import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const registerRouter = Router();

// Open register session
registerRouter.post('/open', (req, res) => {
  try {
    const { opened_by, opening_cash, opening_notes } = req.body;

    // Check if already open
    const existing = db.prepare("SELECT * FROM register_sessions WHERE opened_by = ? AND status = 'open'").get(opened_by) as any;
    if (existing) return res.json(existing);

    const id = generateId();
    const lastNo = db.prepare("SELECT session_no FROM register_sessions ORDER BY session_no DESC LIMIT 1").get() as any;
    const session_no = generateSequentialNo('REG', lastNo?.session_no);

    db.prepare(`INSERT INTO register_sessions (id, session_no, opened_by, opening_cash, opening_notes)
      VALUES (?, ?, ?, ?, ?)`)
      .run(id, session_no, opened_by, opening_cash || 0, opening_notes);

    res.status(201).json({ id, session_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get current session
registerRouter.get('/current/:userId', (req, res) => {
  try {
    const session = db.prepare("SELECT * FROM register_sessions WHERE opened_by = ? AND status = 'open'").get(req.params.userId);
    res.json(session || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Close register session
registerRouter.post('/close', (req, res) => {
  try {
    const { session_id, closed_by, closing_cash, closing_notes } = req.body;

    const session = db.prepare('SELECT * FROM register_sessions WHERE id = ?').get(session_id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const expectedCash = session.opening_cash + session.total_cash_payments - (session.total_returns || 0);
    const difference = (closing_cash || 0) - expectedCash;

    db.prepare(`UPDATE register_sessions SET closed_by = ?, closed_at = datetime('now'), 
      closing_cash = ?, expected_cash = ?, cash_difference = ?, closing_notes = ?, status = 'closed'
      WHERE id = ?`)
      .run(closed_by, closing_cash, expectedCash, difference, closing_notes, session_id);

    res.json({ success: true, expected_cash: expectedCash, difference });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List sessions
registerRouter.get('/sessions', (_req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT rs.*, u.full_name as opened_by_name, u2.full_name as closed_by_name
      FROM register_sessions rs
      JOIN users u ON rs.opened_by = u.id
      LEFT JOIN users u2 ON rs.closed_by = u2.id
      ORDER BY rs.opened_at DESC
    `).all();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
