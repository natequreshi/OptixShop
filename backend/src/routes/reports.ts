import { Router } from 'express';
import db from '../database/connection';

export const reportsRouter = Router();

// Daily Sales Summary / X Report
reportsRouter.get('/daily-sales', (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const summary = db.prepare(`
      SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_amount), 0) as gross_sales,
        COALESCE(SUM(discount_amount), 0) as total_discounts,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(total_amount), 0) as net_sales,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE paid_amount END), 0) as total_collected,
        COALESCE(SUM(balance_amount), 0) as total_credit
      FROM sales
      WHERE sale_date = ? AND status != 'void'
    `).get(targetDate);

    const byPaymentMethod = db.prepare(`
      SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE payment_date = ? AND payment_type = 'sale'
      GROUP BY payment_method
    `).all(targetDate);

    const byCategory = db.prepare(`
      SELECT pc.name as category, COALESCE(SUM(si.total), 0) as total, SUM(si.quantity) as qty
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN product_categories pc ON p.category_id = pc.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date = ? AND s.status != 'void'
      GROUP BY pc.id
      ORDER BY total DESC
    `).all(targetDate);

    const returns = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
      FROM returns WHERE return_date = ?
    `).get(targetDate);

    res.json({ date: targetDate, summary, byPaymentMethod, byCategory, returns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Z Report (End of Day)
reportsRouter.get('/z-report/:sessionId', (req, res) => {
  try {
    const session = db.prepare(`
      SELECT rs.*, u.full_name as opened_by_name, u2.full_name as closed_by_name
      FROM register_sessions rs
      JOIN users u ON rs.opened_by = u.id
      LEFT JOIN users u2 ON rs.closed_by = u2.id
      WHERE rs.id = ?
    `).get(req.params.sessionId);

    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Sales by period
reportsRouter.get('/sales-period', (req, res) => {
  try {
    const { from, to, group_by = 'day' } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    let groupExpr = "sale_date";
    if (group_by === 'month') groupExpr = "strftime('%Y-%m', sale_date)";
    if (group_by === 'week') groupExpr = "strftime('%Y-W%W', sale_date)";

    const data = db.prepare(`
      SELECT ${groupExpr} as period, COUNT(*) as orders, 
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(discount_amount), 0) as discounts,
        COALESCE(SUM(tax_amount), 0) as tax
      FROM sales
      WHERE sale_date BETWEEN ? AND ? AND status != 'void'
      GROUP BY ${groupExpr}
      ORDER BY period
    `).all(fromDate, toDate);

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Top products
reportsRouter.get('/top-products', (req, res) => {
  try {
    const { from, to, limit = '20' } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    const data = db.prepare(`
      SELECT p.id, p.sku, p.name, p.product_type, b.name as brand_name,
        SUM(si.quantity) as qty_sold, SUM(si.total) as revenue,
        SUM(si.total) - SUM(si.cost_price * si.quantity) as profit,
        ROUND((SUM(si.total) - SUM(si.cost_price * si.quantity)) * 100.0 / NULLIF(SUM(si.total), 0), 1) as margin_pct
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date BETWEEN ? AND ? AND s.status != 'void'
      GROUP BY si.product_id
      ORDER BY revenue DESC
      LIMIT ?
    `).all(fromDate, toDate, parseInt(limit as string));

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Slow moving stock
reportsRouter.get('/slow-moving', (_req, res) => {
  try {
    const data = db.prepare(`
      SELECT p.id, p.sku, p.name, p.product_type, b.name as brand_name, i.quantity as stock,
        COALESCE(i.avg_cost * i.quantity, 0) as stock_value,
        COALESCE((SELECT SUM(si.quantity) FROM sale_items si JOIN sales s ON si.sale_id = s.id 
          WHERE si.product_id = p.id AND s.sale_date >= date('now', '-90 days') AND s.status != 'void'), 0) as sold_90_days
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND i.quantity > 0
      ORDER BY sold_90_days ASC, stock_value DESC
      LIMIT 50
    `).all();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GST Report
reportsRouter.get('/gst', (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from || new Date().toISOString().slice(0, 8) + '01';
    const toDate = to || new Date().toISOString().split('T')[0];

    const outputGST = db.prepare(`
      SELECT 'Output' as type, COALESCE(SUM(cgst_amount), 0) as cgst, COALESCE(SUM(sgst_amount), 0) as sgst,
        COALESCE(SUM(igst_amount), 0) as igst, COALESCE(SUM(tax_amount), 0) as total
      FROM sales WHERE sale_date BETWEEN ? AND ? AND status != 'void'
    `).get(fromDate, toDate);

    const inputGST = db.prepare(`
      SELECT 'Input' as type, COALESCE(SUM(cgst_amount), 0) as cgst, COALESCE(SUM(sgst_amount), 0) as sgst,
        COALESCE(SUM(igst_amount), 0) as igst, COALESCE(SUM(tax_amount), 0) as total
      FROM purchase_invoices WHERE invoice_date BETWEEN ? AND ? AND status != 'cancelled'
    `).get(fromDate, toDate);

    const netPayable = (outputGST as any).total - (inputGST as any).total;

    res.json({ outputGST, inputGST, netPayable, period: { from: fromDate, to: toDate } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vendor summary
reportsRouter.get('/vendor-summary', (_req, res) => {
  try {
    const data = db.prepare(`
      SELECT v.id, v.vendor_code, v.company_name,
        COALESCE((SELECT SUM(total_amount) FROM purchase_invoices WHERE vendor_id = v.id AND status != 'cancelled'), 0) as total_purchases,
        COALESCE((SELECT SUM(balance_amount) FROM purchase_invoices WHERE vendor_id = v.id AND balance_amount > 0 AND status != 'cancelled'), 0) as outstanding,
        COALESCE((SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = v.id), 0) as total_pos
      FROM vendors v
      WHERE v.is_active = 1
      ORDER BY total_purchases DESC
    `).all();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer summary / ageing
reportsRouter.get('/customer-ageing', (_req, res) => {
  try {
    const data = db.prepare(`
      SELECT c.id, c.customer_no, c.first_name || ' ' || COALESCE(c.last_name,'') as name, c.phone,
        COALESCE(SUM(s.balance_amount), 0) as total_outstanding,
        COALESCE(SUM(CASE WHEN julianday('now') - julianday(s.sale_date) <= 30 THEN s.balance_amount ELSE 0 END), 0) as current_30,
        COALESCE(SUM(CASE WHEN julianday('now') - julianday(s.sale_date) BETWEEN 31 AND 60 THEN s.balance_amount ELSE 0 END), 0) as days_31_60,
        COALESCE(SUM(CASE WHEN julianday('now') - julianday(s.sale_date) BETWEEN 61 AND 90 THEN s.balance_amount ELSE 0 END), 0) as days_61_90,
        COALESCE(SUM(CASE WHEN julianday('now') - julianday(s.sale_date) > 90 THEN s.balance_amount ELSE 0 END), 0) as over_90
      FROM customers c
      JOIN sales s ON c.id = s.customer_id
      WHERE s.balance_amount > 0 AND s.status != 'void'
      GROUP BY c.id
      HAVING total_outstanding > 0
      ORDER BY total_outstanding DESC
    `).all();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
