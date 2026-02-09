import { Router } from 'express';
import db from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateId } from '../utils/helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'optivision-secret-key-change-in-production';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username) as any;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role, email: user.email },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, username, full_name, role, email, phone FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

authRouter.get('/users', (_req, res) => {
  try {
    const users = db.prepare('SELECT id, username, full_name, role, email, phone, is_active, created_at FROM users ORDER BY full_name').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/users', (req, res) => {
  try {
    const { username, password, full_name, email, phone, role } = req.body;
    const id = generateId();
    const password_hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, password_hash, full_name, email, phone, role) VALUES (?,?,?,?,?,?,?)')
      .run(id, username, password_hash, full_name, email, phone, role);
    res.status(201).json({ id, username, full_name, role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
