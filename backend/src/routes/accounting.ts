import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const accountingRouter = Router();

// ─── Chart of Accounts ───────────────────────────────
accountingRouter.get('/accounts', (_req, res) => {
  try {
    const accounts = db.prepare(`
      SELECT coa.*, p.account_name as parent_name,
        (SELECT COALESCE(SUM(debit) - SUM(credit), 0) FROM journal_entry_lines jel 
         JOIN journal_entries je ON jel.journal_entry_id = je.id
         WHERE jel.account_id = coa.id AND je.is_posted = 1) as current_balance
      FROM chart_of_accounts coa
      LEFT JOIN chart_of_accounts p ON coa.parent_id = p.id
      WHERE coa.is_active = 1
      ORDER BY coa.account_code
    `).all();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

accountingRouter.post('/accounts', (req, res) => {
  try {
    const id = generateId();
    const a = req.body;
    db.prepare(`INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_id, is_group, description, opening_balance, opening_balance_type)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(id, a.account_code, a.account_name, a.account_type, a.parent_id, a.is_group ? 1 : 0, a.description, a.opening_balance || 0, a.opening_balance_type || 'debit');
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Journal Entries ──────────────────────────────────
accountingRouter.get('/journal-entries', (req, res) => {
  try {
    const { date_from, date_to, type, posted } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (date_from) { where += ' AND je.entry_date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND je.entry_date <= ?'; params.push(date_to); }
    if (type) { where += ' AND je.entry_type = ?'; params.push(type); }
    if (posted !== undefined) { where += ' AND je.is_posted = ?'; params.push(posted === 'true' ? 1 : 0); }

    const entries = db.prepare(`
      SELECT je.*, u.full_name as created_by_name,
        (SELECT SUM(debit) FROM journal_entry_lines WHERE journal_entry_id = je.id) as total_debit,
        (SELECT SUM(credit) FROM journal_entry_lines WHERE journal_entry_id = je.id) as total_credit
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      ${where}
      ORDER BY je.entry_date DESC, je.created_at DESC
    `).all(...params);
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

accountingRouter.get('/journal-entries/:id', (req, res) => {
  try {
    const entry = db.prepare('SELECT je.*, u.full_name as created_by_name FROM journal_entries je LEFT JOIN users u ON je.created_by = u.id WHERE je.id = ?')
      .get(req.params.id) as any;
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    entry.lines = db.prepare(`
      SELECT jel.*, coa.account_code, coa.account_name, coa.account_type
      FROM journal_entry_lines jel
      JOIN chart_of_accounts coa ON jel.account_id = coa.id
      WHERE jel.journal_entry_id = ?
    `).all(req.params.id);

    res.json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual journal entry
accountingRouter.post('/journal-entries', (req, res) => {
  try {
    const je = req.body;
    const id = generateId();
    const lastNo = db.prepare("SELECT entry_no FROM journal_entries ORDER BY entry_no DESC LIMIT 1").get() as any;
    const entry_no = generateSequentialNo('JE', lastNo?.entry_no);

    // Validate debit = credit
    let totalDebit = 0, totalCredit = 0;
    for (const line of je.lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ error: 'Debits must equal Credits' });
    }

    db.prepare(`INSERT INTO journal_entries (id, entry_no, entry_date, entry_type, narration, is_posted, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, entry_no, je.entry_date, je.entry_type || 'journal', je.narration, je.auto_post ? 1 : 0, je.created_by);

    const insertLine = db.prepare('INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, narration) VALUES (?,?,?,?,?,?)');
    for (const line of je.lines) {
      insertLine.run(generateId(), id, line.account_id, line.debit || 0, line.credit || 0, line.narration);
    }

    res.status(201).json({ id, entry_no });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Post journal entry
accountingRouter.post('/journal-entries/:id/post', (req, res) => {
  try {
    db.prepare("UPDATE journal_entries SET is_posted = 1, posted_at = datetime('now'), approved_by = ? WHERE id = ?")
      .run(req.body.approved_by, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Ledger ───────────────────────────────────────────
accountingRouter.get('/ledger/:accountId', (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    let where = 'WHERE jel.account_id = ? AND je.is_posted = 1';
    const params: any[] = [req.params.accountId];
    if (date_from) { where += ' AND je.entry_date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND je.entry_date <= ?'; params.push(date_to); }

    const account = db.prepare('SELECT * FROM chart_of_accounts WHERE id = ?').get(req.params.accountId);

    const entries = db.prepare(`
      SELECT je.entry_date, je.entry_no, je.narration, je.entry_type,
        jel.debit, jel.credit, jel.narration as line_narration
      FROM journal_entry_lines jel
      JOIN journal_entries je ON jel.journal_entry_id = je.id
      ${where}
      ORDER BY je.entry_date, je.created_at
    `).all(...params);

    // Calculate running balance
    let balance = 0;
    const ledgerEntries = entries.map((e: any) => {
      balance += e.debit - e.credit;
      return { ...e, balance };
    });

    res.json({ account, entries: ledgerEntries });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trial Balance ────────────────────────────────────
accountingRouter.get('/trial-balance', (req, res) => {
  try {
    const { as_of } = req.query;
    let dateFilter = '';
    const params: any[] = [];
    if (as_of) { dateFilter = 'AND je.entry_date <= ?'; params.push(as_of); }

    const balances = db.prepare(`
      SELECT coa.id, coa.account_code, coa.account_name, coa.account_type, coa.is_group,
        COALESCE(SUM(jel.debit), 0) as total_debit,
        COALESCE(SUM(jel.credit), 0) as total_credit,
        COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as net_balance
      FROM chart_of_accounts coa
      LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.is_posted = 1 ${dateFilter}
      WHERE coa.is_active = 1 AND coa.is_group = 0
      GROUP BY coa.id
      HAVING total_debit > 0 OR total_credit > 0
      ORDER BY coa.account_code
    `).all(...params);

    const totals = balances.reduce((acc: any, b: any) => {
      acc.debit += b.total_debit;
      acc.credit += b.total_credit;
      return acc;
    }, { debit: 0, credit: 0 });

    res.json({ balances, totals });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Profit & Loss ────────────────────────────────────
accountingRouter.get('/profit-loss', (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    let dateFilter = '';
    const params: any[] = [];
    if (date_from) { dateFilter += ' AND je.entry_date >= ?'; params.push(date_from); }
    if (date_to) { dateFilter += ' AND je.entry_date <= ?'; params.push(date_to); }

    const revenue = db.prepare(`
      SELECT coa.account_code, coa.account_name,
        COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) as amount
      FROM chart_of_accounts coa
      LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.is_posted = 1 ${dateFilter}
      WHERE coa.account_type = 'revenue' AND coa.is_group = 0
      GROUP BY coa.id
      ORDER BY coa.account_code
    `).all(...params);

    const expenses = db.prepare(`
      SELECT coa.account_code, coa.account_name,
        COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) as amount
      FROM chart_of_accounts coa
      LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.is_posted = 1 ${dateFilter}
      WHERE coa.account_type = 'expense' AND coa.is_group = 0
      GROUP BY coa.id
      ORDER BY coa.account_code
    `).all(...params);

    const totalRevenue = revenue.reduce((sum: number, r: any) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    res.json({
      revenue, expenses,
      totalRevenue, totalExpenses,
      netProfit: totalRevenue - totalExpenses
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Balance Sheet ────────────────────────────────────
accountingRouter.get('/balance-sheet', (req, res) => {
  try {
    const { as_of } = req.query;
    let dateFilter = '';
    const params: any[] = [];
    if (as_of) { dateFilter = 'AND je.entry_date <= ?'; params.push(as_of); }

    const getByType = (type: string) => db.prepare(`
      SELECT coa.account_code, coa.account_name,
        CASE WHEN coa.account_type IN ('asset','expense')
          THEN COALESCE(SUM(jel.debit) - SUM(jel.credit), 0)
          ELSE COALESCE(SUM(jel.credit) - SUM(jel.debit), 0)
        END as amount
      FROM chart_of_accounts coa
      LEFT JOIN journal_entry_lines jel ON coa.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.is_posted = 1 ${dateFilter}
      WHERE coa.account_type = ? AND coa.is_group = 0
      GROUP BY coa.id
      ORDER BY coa.account_code
    `).all(...params, type);

    const assets = getByType('asset');
    const liabilities = getByType('liability');
    const equity = getByType('equity');

    const totalAssets = assets.reduce((sum: number, a: any) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum: number, l: any) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum: number, e: any) => sum + e.amount, 0);

    res.json({
      assets, liabilities, equity,
      totalAssets, totalLiabilities, totalEquity,
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Day Book ─────────────────────────────────────────
accountingRouter.get('/day-book', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const entries = db.prepare(`
      SELECT je.*, 
        (SELECT SUM(debit) FROM journal_entry_lines WHERE journal_entry_id = je.id) as total_debit,
        u.full_name as created_by_name
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE je.entry_date = ? AND je.is_posted = 1
      ORDER BY je.created_at
    `).all(targetDate);

    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
