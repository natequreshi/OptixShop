import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const couponsRouter = Router();

couponsRouter.get('/', (_req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

couponsRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const c = req.body;
    db.prepare(`INSERT INTO coupons (id, code, description, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_until, usage_limit)
      VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(id, c.code, c.description, c.discount_type, c.discount_value, c.min_purchase || 0, c.max_discount, c.valid_from, c.valid_until, c.usage_limit);
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

couponsRouter.get('/validate/:code', (req, res) => {
  try {
    const coupon = db.prepare(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = 1 AND valid_from <= date('now') AND valid_until >= date('now')
      AND (usage_limit IS NULL OR used_count < usage_limit)
    `).get(req.params.code);
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon' });
    res.json(coupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
