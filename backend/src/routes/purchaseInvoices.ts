import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo, splitGST } from '../utils/helpers';

export const purchaseInvoicesRouter = Router();

purchaseInvoicesRouter.get('/', (req, res) => {
  try {
    const { status, vendor_id } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (status) { where += ' AND pi.status = ?'; params.push(status); }
    if (vendor_id) { where += ' AND pi.vendor_id = ?'; params.push(vendor_id); }

    const invoices = db.prepare(`
      SELECT pi.*, v.company_name as vendor_name
      FROM purchase_invoices pi
      JOIN vendors v ON pi.vendor_id = v.id
      ${where}
      ORDER BY pi.invoice_date DESC
    `).all(...params);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

purchaseInvoicesRouter.get('/:id', (req, res) => {
  try {
    const inv = db.prepare(`
      SELECT pi.*, v.company_name as vendor_name, v.gst_no as vendor_gst
      FROM purchase_invoices pi
      JOIN vendors v ON pi.vendor_id = v.id
      WHERE pi.id = ?
    `).get(req.params.id) as any;
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    inv.items = db.prepare(`
      SELECT pii.*, p.name as product_name, p.sku
      FROM purchase_invoice_items pii
      JOIN products p ON pii.product_id = p.id
      WHERE pii.invoice_id = ?
    `).all(req.params.id);

    res.json(inv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

purchaseInvoicesRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastInv = db.prepare("SELECT invoice_no FROM purchase_invoices ORDER BY invoice_no DESC LIMIT 1").get() as any;
    const invoice_no = generateSequentialNo('PI', lastInv?.invoice_no);
    const pi = req.body;

    let subtotal = 0, taxTotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

    for (const item of pi.items) {
      const itemBase = item.quantity * item.unit_price * (1 - (item.discount_pct || 0) / 100);
      const itemTax = itemBase * (item.tax_rate || 0) / 100;
      const gst = splitGST(itemTax, pi.is_inter_state || false);
      subtotal += itemBase;
      taxTotal += itemTax;
      cgstTotal += gst.cgst;
      sgstTotal += gst.sgst;
      igstTotal += gst.igst;
    }

    const total = subtotal + taxTotal + (pi.freight_amount || 0) - (pi.discount_amount || 0);

    db.prepare(`INSERT INTO purchase_invoices (id, invoice_no, vendor_invoice_no, vendor_id, po_id, grn_id,
      invoice_date, due_date, subtotal, discount_amount, tax_amount, freight_amount, total_amount,
      paid_amount, balance_amount, status, cgst_amount, sgst_amount, igst_amount, notes, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, invoice_no, pi.vendor_invoice_no, pi.vendor_id, pi.po_id, pi.grn_id,
        pi.invoice_date, pi.due_date, subtotal, pi.discount_amount || 0, taxTotal,
        pi.freight_amount || 0, total, 0, total, 'unpaid',
        cgstTotal, sgstTotal, igstTotal, pi.notes, pi.created_by);

    // Insert items
    const insertItem = db.prepare(`INSERT INTO purchase_invoice_items (id, invoice_id, product_id, quantity, unit_price, discount_pct, tax_rate, tax_amount, cgst, sgst, igst, total)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

    for (const item of pi.items) {
      const itemBase = item.quantity * item.unit_price * (1 - (item.discount_pct || 0) / 100);
      const itemTax = itemBase * (item.tax_rate || 0) / 100;
      const gst = splitGST(itemTax, pi.is_inter_state || false);
      insertItem.run(generateId(), id, item.product_id, item.quantity, item.unit_price,
        item.discount_pct || 0, item.tax_rate || 0, itemTax, gst.cgst, gst.sgst, gst.igst, itemBase + itemTax);
    }

    // Create accounting journal entry (Purchase → Dr Purchases, Dr Input GST, Cr Accounts Payable)
    const jeId = generateId();
    const jeNo = generateSequentialNo('JE', null);
    db.prepare(`INSERT INTO journal_entries (id, entry_no, entry_date, entry_type, reference_type, reference_id, narration, is_posted, created_by)
      VALUES (?, ?, ?, 'purchase', 'purchase_invoice', ?, ?, 1, ?)`).run(jeId, jeNo, pi.invoice_date, id, `Purchase Invoice ${invoice_no}`, pi.created_by);

    // Get account IDs
    const cogsAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '5100'").get() as any;
    const apAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '2100'").get() as any;
    const invAcct = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1400'").get() as any;
    const inputCgst = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1600'").get() as any;
    const inputSgst = db.prepare("SELECT id FROM chart_of_accounts WHERE account_code = '1610'").get() as any;

    const insertLine = db.prepare(`INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit) VALUES (?,?,?,?,?)`);

    // Dr Inventory (asset)
    insertLine.run(generateId(), jeId, invAcct.id, subtotal, 0);
    // Dr Input CGST
    if (cgstTotal > 0) insertLine.run(generateId(), jeId, inputCgst.id, cgstTotal, 0);
    // Dr Input SGST
    if (sgstTotal > 0) insertLine.run(generateId(), jeId, inputSgst.id, sgstTotal, 0);
    // Cr Accounts Payable
    insertLine.run(generateId(), jeId, apAcct.id, 0, total);

    res.status(201).json({ id, invoice_no, total_amount: total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
