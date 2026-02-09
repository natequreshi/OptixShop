import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const paymentsRouter = Router();

paymentsRouter.get('/', (req, res) => {
  try {
    const { type, date_from, date_to } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (type) { where += ' AND p.payment_type = ?'; params.push(type); }
    if (date_from) { where += ' AND p.payment_date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND p.payment_date <= ?'; params.push(date_to); }

    const payments = db.prepare(`
      SELECT p.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name,
        v.company_name as vendor_name, u.full_name as created_by_name
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN users u ON p.created_by = u.id
      ${where}
      ORDER BY p.payment_date DESC, p.created_at DESC
    `).all(...params);
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor payment
paymentsRouter.post('/vendor', (req, res) => {
  try {
    const p = req.body;
    const id = generateId();
    const lastNo = db.prepare("SELECT payment_no FROM payments ORDER BY payment_no DESC LIMIT 1").get() as any;
    const payment_no = generateSequentialNo('PAY', lastNo?.payment_no);

    db.prepare(`INSERT INTO payments (id, payment_no, payment_type, reference_type, reference_id, vendor_id,
      payment_date, amount, payment_method, transaction_ref, notes, created_by)
      VALUES (?,?,'vendor_payment',?,?,?,?,?,?,?,?,?)`)
      .run(id, payment_no, p.reference_type, p.reference_id, p.vendor_id, p.payment_date,
        p.amount, p.payment_method, p.transaction_ref, p.notes, p.created_by);

    // Update purchase invoice if applicable
    if (p.reference_type === 'purchase_invoice' && p.reference_id) {
      db.prepare(`UPDATE purchase_invoices SET paid_amount = paid_amount + ?, 
        balance_amount = balance_amount - ?,
        status = CASE WHEN balance_amount - ? <= 0 THEN 'paid' ELSE 'partial' END,
        updated_at = datetime('now')
        WHERE id = ?`).run(p.amount, p.amount, p.amount, p.reference_id);
    }

    // Journal entry: Dr Accounts Payable, Cr Cash/Bank
    const jeId = generateId();
    const jeNo = generateSequentialNo('JE', null);
    db.prepare(`INSERT INTO journal_entries (id, entry_no, entry_date, entry_type, reference_type, reference_id, narration, is_posted, created_by)
      VALUES (?, ?, ?, 'payment', 'payment', ?, ?, 1, ?)`).run(jeId, jeNo, p.payment_date, id, `Vendor payment ${payment_no}`, p.created_by);

    const insertLine = db.prepare('INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit) VALUES (?,?,?,?,?)');
    const apAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '2100'").get() as any;
    const cashAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1100'").get() as any;
    const bankAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1210'").get() as any;

    insertLine.run(generateId(), jeId, apAcct.id, p.amount, 0);
    const payAcct = p.payment_method === 'cash' ? cashAcct : bankAcct;
    insertLine.run(generateId(), jeId, payAcct.id, 0, p.amount);

    res.status(201).json({ id, payment_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer credit payment
paymentsRouter.post('/customer', (req, res) => {
  try {
    const p = req.body;
    const id = generateId();
    const lastNo = db.prepare("SELECT payment_no FROM payments ORDER BY payment_no DESC LIMIT 1").get() as any;
    const payment_no = generateSequentialNo('PAY', lastNo?.payment_no);

    db.prepare(`INSERT INTO payments (id, payment_no, payment_type, reference_type, reference_id, customer_id,
      payment_date, amount, payment_method, transaction_ref, notes, created_by)
      VALUES (?,?,'credit_payment',?,?,?,?,?,?,?,?,?)`)
      .run(id, payment_no, p.reference_type, p.reference_id, p.customer_id, p.payment_date,
        p.amount, p.payment_method, p.transaction_ref, p.notes, p.created_by);

    // Update sale balance
    if (p.reference_type === 'sale' && p.reference_id) {
      db.prepare(`UPDATE sales SET paid_amount = paid_amount + ?, balance_amount = balance_amount - ?,
        payment_status = CASE WHEN balance_amount - ? <= 0 THEN 'paid' ELSE 'partial' END,
        updated_at = datetime('now') WHERE id = ?`).run(p.amount, p.amount, p.amount, p.reference_id);
    }

    // Update customer credit balance
    if (p.customer_id) {
      db.prepare("UPDATE customers SET credit_balance = credit_balance - ?, updated_at = datetime('now') WHERE id = ?")
        .run(p.amount, p.customer_id);
    }

    // Journal entry: Dr Cash/Bank, Cr Accounts Receivable
    const jeId = generateId();
    const jeNo = generateSequentialNo('JE', null);
    db.prepare(`INSERT INTO journal_entries (id, entry_no, entry_date, entry_type, reference_type, reference_id, narration, is_posted, created_by)
      VALUES (?, ?, ?, 'receipt', 'payment', ?, ?, 1, ?)`).run(jeId, jeNo, p.payment_date, id, `Customer payment ${payment_no}`, p.created_by);

    const insertLine = db.prepare('INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit) VALUES (?,?,?,?,?)');
    const arAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1300'").get() as any;
    const cashAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1100'").get() as any;

    insertLine.run(generateId(), jeId, cashAcct.id, p.amount, 0);
    insertLine.run(generateId(), jeId, arAcct.id, 0, p.amount);

    res.status(201).json({ id, payment_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
