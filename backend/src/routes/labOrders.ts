import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const labOrdersRouter = Router();

labOrdersRouter.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (status) { where += ' AND lo.status = ?'; params.push(status); }

    const orders = db.prepare(`
      SELECT lo.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone,
        f.name as frame_name, l.name as lens_name, rx.prescription_no
      FROM lab_orders lo
      JOIN customers c ON lo.customer_id = c.id
      LEFT JOIN products f ON lo.frame_product_id = f.id
      LEFT JOIN products l ON lo.lens_product_id = l.id
      LEFT JOIN prescriptions rx ON lo.prescription_id = rx.id
      ${where}
      ORDER BY lo.order_date DESC
    `).all(...params);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

labOrdersRouter.get('/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT lo.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone,
        f.name as frame_name, l.name as lens_name,
        rx.*
      FROM lab_orders lo
      JOIN customers c ON lo.customer_id = c.id
      LEFT JOIN products f ON lo.frame_product_id = f.id
      LEFT JOIN products l ON lo.lens_product_id = l.id
      LEFT JOIN prescriptions rx ON lo.prescription_id = rx.id
      WHERE lo.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Lab order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

labOrdersRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastNo = db.prepare("SELECT order_no FROM lab_orders ORDER BY order_no DESC LIMIT 1").get() as any;
    const order_no = generateSequentialNo('LAB', lastNo?.order_no);
    const o = req.body;

    db.prepare(`INSERT INTO lab_orders (id, order_no, sale_id, customer_id, prescription_id, order_date,
      frame_product_id, lens_product_id, fitting_height, seg_height, wrap_angle, pantoscopic_tilt,
      lab_type, lab_name, lab_notes, status, estimated_delivery, lab_cost, notes, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, order_no, o.sale_id, o.customer_id, o.prescription_id, o.order_date || new Date().toISOString().split('T')[0],
        o.frame_product_id, o.lens_product_id, o.fitting_height, o.seg_height, o.wrap_angle, o.pantoscopic_tilt,
        o.lab_type, o.lab_name, o.lab_notes, 'pending', o.estimated_delivery, o.lab_cost || 0, o.notes, o.created_by);

    res.status(201).json({ id, order_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

labOrdersRouter.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updates: any = { status };
    if (status === 'delivered') updates.actual_delivery = new Date().toISOString().split('T')[0];

    db.prepare(`UPDATE lab_orders SET status = ?, actual_delivery = CASE WHEN ? = 'delivered' THEN date('now') ELSE actual_delivery END,
      updated_at = datetime('now') WHERE id = ?`).run(status, status, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
