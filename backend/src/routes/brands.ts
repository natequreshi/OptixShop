import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const brandsRouter = Router();

brandsRouter.get('/', (_req, res) => {
  try {
    const brands = db.prepare('SELECT * FROM brands WHERE is_active = 1 ORDER BY name').all();
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

brandsRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    db.prepare('INSERT INTO brands (id, name, description) VALUES (?, ?, ?)').run(id, req.body.name, req.body.description);
    res.status(201).json({ id, name: req.body.name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

brandsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('UPDATE brands SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
