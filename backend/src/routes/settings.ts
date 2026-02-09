import { Router } from 'express';
import db from '../database/connection';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings ORDER BY category, key').all();
    const grouped: Record<string, any> = {};
    for (const s of settings as any[]) {
      if (!grouped[s.category]) grouped[s.category] = {};
      grouped[s.category][s.key] = s.value;
    }
    res.json(grouped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

settingsRouter.put('/', (req, res) => {
  try {
    const updates = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value, category, updated_at) VALUES (?, ?, ?, datetime('now'))");
    for (const [key, value] of Object.entries(updates)) {
      const existing = db.prepare('SELECT category FROM settings WHERE key = ?').get(key) as any;
      stmt.run(key, value, existing?.category || 'general');
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
