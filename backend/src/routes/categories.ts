import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order, name').all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

categoriesRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    db.prepare('INSERT INTO product_categories (id, name, parent_id, description, sort_order) VALUES (?, ?, ?, ?, ?)')
      .run(id, req.body.name, req.body.parent_id, req.body.description, req.body.sort_order || 0);
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
