import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo, splitGST } from '../utils/helpers';

export const salesRouter = Router();

salesRouter.get('/', (req, res) => {
  try {
    const { date, status, customer_id, page = '1', limit = '50' } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (date) { where += ' AND s.sale_date = ?'; params.push(date); }
    if (status) { where += ' AND s.status = ?'; params.push(status); }
    if (customer_id) { where += ' AND s.customer_id = ?'; params.push(customer_id); }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = db.prepare(`SELECT COUNT(*) as count FROM sales s ${where}`).get(...params) as any;

    const sales = db.prepare(`
      SELECT s.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone,
        u.full_name as cashier_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.cashier_id = u.id
      ${where}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit as string), offset);

    res.json({ data: sales, total: total.count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

salesRouter.get('/:id', (req, res) => {
  try {
    const sale = db.prepare(`
      SELECT s.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone,
        c.email as customer_email, c.gst_no as customer_gst,
        u.full_name as cashier_name, rx.prescription_no
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.cashier_id = u.id
      LEFT JOIN prescriptions rx ON s.prescription_id = rx.id
      WHERE s.id = ?
    `).get(req.params.id) as any;
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    sale.items = db.prepare(`
      SELECT si.*, p.name as product_name, p.sku, p.barcode, p.product_type
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(req.params.id);

    sale.payments = db.prepare(`SELECT * FROM payments WHERE reference_type = 'sale' AND reference_id = ?`).all(req.params.id);

    res.json(sale);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create sale (POS checkout)
salesRouter.post('/', (req, res) => {
  try {
    const s = req.body;
    const id = generateId();
    const lastInv = db.prepare("SELECT invoice_no FROM sales ORDER BY invoice_no DESC LIMIT 1").get() as any;
    const invoice_no = generateSequentialNo('INV', lastInv?.invoice_no);

    let subtotal = 0, taxTotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

    // Calculate line items
    const itemCalcs = [];
    for (const item of s.items) {
      const lineBase = item.quantity * item.unit_price;
      const lineDiscount = item.discount_amount || (lineBase * (item.discount_pct || 0) / 100);
      const lineAfterDiscount = lineBase - lineDiscount;
      const lineTax = lineAfterDiscount * (item.tax_rate || 0) / 100;
      const gst = splitGST(lineTax, false);
      const lineTotal = lineAfterDiscount + lineTax;

      subtotal += lineAfterDiscount;
      taxTotal += lineTax;
      cgstTotal += gst.cgst;
      sgstTotal += gst.sgst;
      igstTotal += gst.igst;

      itemCalcs.push({ ...item, lineAfterDiscount, lineTax, lineTotal, gst, lineDiscount });
    }

    // Global discount
    const discountAmount = s.discount_amount || 0;
    const totalAmount = subtotal - discountAmount + taxTotal;
    const paidAmount = s.paid_amount || 0;
    const balanceAmount = totalAmount - paidAmount;
    const paymentStatus = balanceAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    const status = s.payment_method === 'credit' ? 'credit' : 'completed';

    // Insert sale
    db.prepare(`INSERT INTO sales (id, invoice_no, customer_id, prescription_id, sale_date, subtotal, discount_amount,
      discount_type, tax_amount, cgst_amount, sgst_amount, igst_amount, total_amount, paid_amount, balance_amount,
      status, payment_status, coupon_code, coupon_discount, loyalty_points_earned, loyalty_points_redeemed,
      notes, cashier_id, register_session_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, invoice_no, s.customer_id, s.prescription_id, s.sale_date || new Date().toISOString().split('T')[0],
        subtotal, discountAmount, s.discount_type || 'amount', taxTotal, cgstTotal, sgstTotal, igstTotal,
        totalAmount, paidAmount, balanceAmount, status, paymentStatus,
        s.coupon_code, s.coupon_discount || 0, s.loyalty_points_earned || 0, s.loyalty_points_redeemed || 0,
        s.notes, s.cashier_id, s.register_session_id);

    // Insert sale items
    const insertItem = db.prepare(`INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, cost_price,
      discount_pct, discount_amount, tax_rate, tax_amount, cgst, sgst, igst, total, prescription_id, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

    for (const item of itemCalcs) {
      const product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(item.product_id) as any;
      insertItem.run(generateId(), id, item.product_id, item.quantity, item.unit_price,
        product?.cost_price || 0, item.discount_pct || 0, item.lineDiscount,
        item.tax_rate || 0, item.lineTax, item.gst.cgst, item.gst.sgst, item.gst.igst,
        item.lineTotal, item.prescription_id, item.notes);

      // Deduct inventory
      db.prepare("UPDATE inventory SET quantity = quantity - ?, updated_at = datetime('now') WHERE product_id = ?")
        .run(item.quantity, item.product_id);

      // Log inventory transaction
      db.prepare(`INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, unit_cost, reference_type, reference_id, created_by)
        VALUES (?, ?, 'sale', ?, ?, 'sale', ?, ?)`).run(generateId(), item.product_id, -item.quantity, product?.cost_price || 0, id, s.cashier_id);
    }

    // Record payment
    if (paidAmount > 0) {
      const paymentId = generateId();
      const paymentNo = generateSequentialNo('PAY', null);
      db.prepare(`INSERT INTO payments (id, payment_no, payment_type, reference_type, reference_id, customer_id,
        payment_date, amount, payment_method, transaction_ref, split_details, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(paymentId, paymentNo, 'sale', 'sale', id, s.customer_id,
          s.sale_date || new Date().toISOString().split('T')[0], paidAmount,
          s.payment_method || 'cash', s.transaction_ref, s.split_details ? JSON.stringify(s.split_details) : null, s.cashier_id);
    }

    // Update customer credit balance if credit sale
    if (balanceAmount > 0 && s.customer_id) {
      db.prepare("UPDATE customers SET credit_balance = credit_balance + ?, updated_at = datetime('now') WHERE id = ?")
        .run(balanceAmount, s.customer_id);
    }

    // Loyalty points
    if (s.customer_id) {
      const pointsPerHundred = parseInt((db.prepare("SELECT value FROM settings WHERE key = 'loyalty_points_per_100'").get() as any)?.value || '5');
      const pointsEarned = Math.floor(totalAmount / 100) * pointsPerHundred;
      if (pointsEarned > 0) {
        db.prepare("UPDATE customers SET loyalty_points = loyalty_points + ?, updated_at = datetime('now') WHERE id = ?").run(pointsEarned, s.customer_id);
        db.prepare("INSERT INTO loyalty_transactions (id, customer_id, sale_id, points, transaction_type, description) VALUES (?,?,?,?,'earned',?)")
          .run(generateId(), s.customer_id, id, pointsEarned, `Earned from sale ${invoice_no}`);
      }
    }

    // Create accounting journal entry
    // Dr Cash/Bank, Dr Accounts Receivable (if credit), Cr Sales Revenue, Cr Output GST
    const jeId = generateId();
    const jeNo = generateSequentialNo('JE', null);
    db.prepare(`INSERT INTO journal_entries (id, entry_no, entry_date, entry_type, reference_type, reference_id, narration, is_posted, created_by)
      VALUES (?, ?, ?, 'sale', 'sale', ?, ?, 1, ?)`)
      .run(jeId, jeNo, s.sale_date || new Date().toISOString().split('T')[0], id, `Sale Invoice ${invoice_no}`, s.cashier_id);

    const insertLine = db.prepare(`INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit) VALUES (?,?,?,?,?)`);
    const cashAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1100'").get() as any;
    const arAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1300'").get() as any;
    const salesAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '4100'").get() as any;
    const cogsAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '5100'").get() as any;
    const invAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1400'").get() as any;
    const outputCgst = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '2300'").get() as any;
    const outputSgst = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '2310'").get() as any;

    // Dr Cash/Bank for paid amount
    if (paidAmount > 0) insertLine.run(generateId(), jeId, cashAcct.id, paidAmount, 0);
    // Dr Accounts Receivable for balance
    if (balanceAmount > 0) insertLine.run(generateId(), jeId, arAcct.id, balanceAmount, 0);
    // Cr Sales Revenue
    insertLine.run(generateId(), jeId, salesAcct.id, 0, subtotal - discountAmount);
    // Cr Output CGST
    if (cgstTotal > 0) insertLine.run(generateId(), jeId, outputCgst.id, 0, cgstTotal);
    // Cr Output SGST
    if (sgstTotal > 0) insertLine.run(generateId(), jeId, outputSgst.id, 0, sgstTotal);

    // COGS entry: Dr COGS, Cr Inventory
    let totalCOGS = 0;
    for (const item of itemCalcs) {
      const product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(item.product_id) as any;
      totalCOGS += (product?.cost_price || 0) * item.quantity;
    }
    if (totalCOGS > 0) {
      insertLine.run(generateId(), jeId, cogsAcct.id, totalCOGS, 0);
      insertLine.run(generateId(), jeId, invAcct.id, 0, totalCOGS);
    }

    // Update register session
    if (s.register_session_id) {
      db.prepare(`UPDATE register_sessions SET 
        total_sales = total_sales + ?, transaction_count = transaction_count + 1,
        total_cash_payments = total_cash_payments + CASE WHEN ? = 'cash' THEN ? ELSE 0 END,
        total_card_payments = total_card_payments + CASE WHEN ? = 'card' THEN ? ELSE 0 END,
        total_upi_payments = total_upi_payments + CASE WHEN ? = 'upi' THEN ? ELSE 0 END,
        total_credit_given = total_credit_given + ?
        WHERE id = ?`)
        .run(totalAmount, s.payment_method, paidAmount, s.payment_method, paidAmount, s.payment_method, paidAmount, balanceAmount, s.register_session_id);
    }

    res.status(201).json({ id, invoice_no, total_amount: totalAmount, paid_amount: paidAmount, balance_amount: balanceAmount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Void sale
salesRouter.post('/:id/void', (req, res) => {
  try {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(req.params.id) as any;
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    db.prepare("UPDATE sales SET status = 'void', updated_at = datetime('now') WHERE id = ?").run(req.params.id);

    // Restore inventory
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(req.params.id) as any[];
    for (const item of items) {
      db.prepare("UPDATE inventory SET quantity = quantity + ?, updated_at = datetime('now') WHERE product_id = ?")
        .run(item.quantity, item.product_id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
