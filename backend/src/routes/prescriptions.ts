import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const prescriptionsRouter = Router();

prescriptionsRouter.get('/', (req, res) => {
  try {
    const { customer_id, search } = req.query;
    let where = 'WHERE rx.is_active = 1';
    const params: any[] = [];

    if (customer_id) { where += ' AND rx.customer_id = ?'; params.push(customer_id); }
    if (search) {
      where += ' AND (rx.prescription_no LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const prescriptions = db.prepare(`
      SELECT rx.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone
      FROM prescriptions rx
      JOIN customers c ON rx.customer_id = c.id
      ${where}
      ORDER BY rx.prescription_date DESC
    `).all(...params);

    res.json(prescriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

prescriptionsRouter.get('/:id', (req, res) => {
  try {
    const rx = db.prepare(`
      SELECT rx.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone
      FROM prescriptions rx
      JOIN customers c ON rx.customer_id = c.id
      WHERE rx.id = ?
    `).get(req.params.id);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

prescriptionsRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastNo = db.prepare("SELECT prescription_no FROM prescriptions ORDER BY prescription_no DESC LIMIT 1").get() as any;
    const prescription_no = generateSequentialNo('RX', lastNo?.prescription_no);
    const r = req.body;

    db.prepare(`INSERT INTO prescriptions (id, prescription_no, customer_id, prescribed_by, prescription_date, expiry_date,
      od_sphere, od_cylinder, od_axis, od_add, od_pd, od_prism, od_va,
      os_sphere, os_cylinder, os_axis, os_add, os_pd, os_prism, os_va,
      near_pd, ipd, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, prescription_no, r.customer_id, r.prescribed_by, r.prescription_date, r.expiry_date,
        r.od_sphere, r.od_cylinder, r.od_axis, r.od_add, r.od_pd, r.od_prism, r.od_va,
        r.os_sphere, r.os_cylinder, r.os_axis, r.os_add, r.os_pd, r.os_prism, r.os_va,
        r.near_pd, r.ipd, r.notes);

    res.status(201).json({ id, prescription_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

prescriptionsRouter.put('/:id', (req, res) => {
  try {
    const r = req.body;
    db.prepare(`UPDATE prescriptions SET prescribed_by=?, prescription_date=?, expiry_date=?,
      od_sphere=?, od_cylinder=?, od_axis=?, od_add=?, od_pd=?, od_prism=?, od_va=?,
      os_sphere=?, os_cylinder=?, os_axis=?, os_add=?, os_pd=?, os_prism=?, os_va=?,
      near_pd=?, ipd=?, notes=?, updated_at=datetime('now') WHERE id=?`)
      .run(r.prescribed_by, r.prescription_date, r.expiry_date,
        r.od_sphere, r.od_cylinder, r.od_axis, r.od_add, r.od_pd, r.od_prism, r.od_va,
        r.os_sphere, r.os_cylinder, r.os_axis, r.os_add, r.os_pd, r.os_prism, r.os_va,
        r.near_pd, r.ipd, r.notes, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Expiring prescriptions alert
prescriptionsRouter.get('/alerts/expiring', (_req, res) => {
  try {
    const expiring = db.prepare(`
      SELECT rx.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name, c.phone as customer_phone
      FROM prescriptions rx
      JOIN customers c ON rx.customer_id = c.id
      WHERE rx.expiry_date IS NOT NULL AND rx.expiry_date <= date('now', '+30 days') AND rx.expiry_date >= date('now')
      AND rx.is_active = 1
      ORDER BY rx.expiry_date
    `).all();
    res.json(expiring);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
