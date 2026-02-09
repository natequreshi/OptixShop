import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const customersRouter = Router();

customersRouter.get('/', (req, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    let where = 'WHERE c.is_active = 1';
    const params: any[] = [];

    if (search) {
      where += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.customer_no LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const total = db.prepare(`SELECT COUNT(*) as count FROM customers c ${where}`).get(...params) as any;

    const customers = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM sales WHERE customer_id = c.id AND status != 'void') as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE customer_id = c.id AND status != 'void') as total_spent,
        (SELECT COUNT(*) FROM prescriptions WHERE customer_id = c.id AND is_active = 1) as prescription_count
      FROM customers c
      ${where}
      ORDER BY c.first_name, c.last_name
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit as string), offset);

    res.json({ data: customers, total: total.count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

customersRouter.get('/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE customer_id = ? ORDER BY prescription_date DESC').all(req.params.id);
    const sales = db.prepare(`
      SELECT s.*, (SELECT GROUP_CONCAT(p.name, ', ') FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = s.id) as items_summary
      FROM sales s WHERE s.customer_id = ? AND s.status != 'void' ORDER BY s.sale_date DESC LIMIT 20
    `).all(req.params.id);
    const loyaltyHistory = db.prepare('SELECT * FROM loyalty_transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id);

    res.json({ ...customer as any, prescriptions, sales, loyaltyHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

customersRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastNo = db.prepare("SELECT customer_no FROM customers ORDER BY customer_no DESC LIMIT 1").get() as any;
    const customer_no = generateSequentialNo('C', lastNo?.customer_no);
    const c = req.body;

    db.prepare(`INSERT INTO customers (id, customer_no, first_name, last_name, email, phone, alt_phone, whatsapp,
      date_of_birth, gender, address_line1, address_line2, city, state, pincode, gst_no, pan_no,
      insurance_provider, insurance_policy_no, insurance_expiry, notes, credit_limit)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, customer_no, c.first_name, c.last_name, c.email, c.phone, c.alt_phone, c.whatsapp,
        c.date_of_birth, c.gender, c.address_line1, c.address_line2, c.city, c.state, c.pincode,
        c.gst_no, c.pan_no, c.insurance_provider, c.insurance_policy_no, c.insurance_expiry, c.notes, c.credit_limit || 0);

    res.status(201).json({ id, customer_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

customersRouter.put('/:id', (req, res) => {
  try {
    const c = req.body;
    db.prepare(`UPDATE customers SET first_name=?, last_name=?, email=?, phone=?, alt_phone=?, whatsapp=?,
      date_of_birth=?, gender=?, address_line1=?, address_line2=?, city=?, state=?, pincode=?,
      gst_no=?, pan_no=?, insurance_provider=?, insurance_policy_no=?, insurance_expiry=?, notes=?,
      credit_limit=?, updated_at=datetime('now') WHERE id=?`)
      .run(c.first_name, c.last_name, c.email, c.phone, c.alt_phone, c.whatsapp,
        c.date_of_birth, c.gender, c.address_line1, c.address_line2, c.city, c.state, c.pincode,
        c.gst_no, c.pan_no, c.insurance_provider, c.insurance_policy_no, c.insurance_expiry, c.notes,
        c.credit_limit, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

customersRouter.delete('/:id', (req, res) => {
  try {
    db.prepare("UPDATE customers SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
