import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const vendorsRouter = Router();

vendorsRouter.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let where = 'WHERE v.is_active = 1';
    const params: any[] = [];

    if (search) {
      where += ' AND (v.company_name LIKE ? OR v.vendor_code LIKE ? OR v.contact_person LIKE ? OR v.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const vendors = db.prepare(`
      SELECT v.*,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_invoices WHERE vendor_id = v.id AND status != 'cancelled') as total_purchases,
        (SELECT COALESCE(SUM(balance_amount), 0) FROM purchase_invoices WHERE vendor_id = v.id AND balance_amount > 0 AND status != 'cancelled') as outstanding_balance,
        (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = v.id) as po_count
      FROM vendors v
      ${where}
      ORDER BY v.company_name
    `).all(...params);

    res.json(vendors);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vendorsRouter.get('/:id', (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const pos = db.prepare('SELECT * FROM purchase_orders WHERE vendor_id = ? ORDER BY order_date DESC LIMIT 20').all(req.params.id);
    const invoices = db.prepare('SELECT * FROM purchase_invoices WHERE vendor_id = ? ORDER BY invoice_date DESC LIMIT 20').all(req.params.id);

    res.json({ ...vendor as any, purchase_orders: pos, invoices });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vendorsRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const v = req.body;
    db.prepare(`INSERT INTO vendors (id, vendor_code, company_name, contact_person, email, phone, alt_phone,
      address_line1, address_line2, city, state, pincode, country, gst_no, pan_no, tin_no, vat_no,
      payment_terms, credit_limit, credit_days, bank_name, bank_account, bank_ifsc, categories_supplied, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, v.vendor_code, v.company_name, v.contact_person, v.email, v.phone, v.alt_phone,
        v.address_line1, v.address_line2, v.city, v.state, v.pincode, v.country || 'India',
        v.gst_no, v.pan_no, v.tin_no, v.vat_no, v.payment_terms || 'net30',
        v.credit_limit || 0, v.credit_days || 30, v.bank_name, v.bank_account, v.bank_ifsc,
        v.categories_supplied, v.notes);
    res.status(201).json({ id, vendor_code: v.vendor_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vendorsRouter.put('/:id', (req, res) => {
  try {
    const v = req.body;
    db.prepare(`UPDATE vendors SET company_name=?, contact_person=?, email=?, phone=?, alt_phone=?,
      address_line1=?, address_line2=?, city=?, state=?, pincode=?, country=?, gst_no=?, pan_no=?,
      tin_no=?, vat_no=?, payment_terms=?, credit_limit=?, credit_days=?, bank_name=?, bank_account=?,
      bank_ifsc=?, categories_supplied=?, notes=?, updated_at=datetime('now') WHERE id=?`)
      .run(v.company_name, v.contact_person, v.email, v.phone, v.alt_phone,
        v.address_line1, v.address_line2, v.city, v.state, v.pincode, v.country,
        v.gst_no, v.pan_no, v.tin_no, v.vat_no, v.payment_terms, v.credit_limit, v.credit_days,
        v.bank_name, v.bank_account, v.bank_ifsc, v.categories_supplied, v.notes, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

vendorsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare("UPDATE vendors SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor ledger
vendorsRouter.get('/:id/ledger', (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT 'invoice' as type, invoice_no as reference, invoice_date as date, total_amount as debit, 0 as credit, status
      FROM purchase_invoices WHERE vendor_id = ? AND status != 'cancelled'
      UNION ALL
      SELECT 'payment' as type, payment_no as reference, payment_date as date, 0 as debit, amount as credit, 'completed' as status
      FROM payments WHERE vendor_id = ? AND payment_type = 'vendor_payment'
      ORDER BY date DESC
    `).all(req.params.id, req.params.id);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
