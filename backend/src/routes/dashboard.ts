import { Router } from 'express';
import db from '../database/connection';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const monthStart = today.slice(0, 8) + '01';

    // Today's sales
    const todaySales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count
      FROM sales WHERE sale_date = ? AND status != 'void'
    `).get(today) as any;

    // This month's sales
    const monthSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count
      FROM sales WHERE sale_date >= ? AND status != 'void'
    `).get(monthStart) as any;

    // Last week comparison
    const lastWeekSales = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales WHERE sale_date >= ? AND sale_date < ? AND status != 'void'
    `).get(weekAgo, today) as any;

    // Total customers
    const customers = db.prepare('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').get() as any;

    // New customers this month
    const newCustomers = db.prepare(`
      SELECT COUNT(*) as count FROM customers WHERE created_at >= ?
    `).get(monthStart) as any;

    // Low stock items
    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM products p
      JOIN inventory i ON p.id = i.product_id
      WHERE i.quantity <= p.reorder_level AND p.is_active = 1 AND p.track_inventory = 1
    `).get() as any;

    // Pending lab orders
    const pendingLabs = db.prepare(`
      SELECT COUNT(*) as count FROM lab_orders WHERE status NOT IN ('delivered','cancelled')
    `).get() as any;

    // Outstanding receivables
    const receivables = db.prepare(`
      SELECT COALESCE(SUM(balance_amount), 0) as total FROM sales WHERE balance_amount > 0 AND status != 'void'
    `).get() as any;

    // Outstanding payables
    const payables = db.prepare(`
      SELECT COALESCE(SUM(balance_amount), 0) as total FROM purchase_invoices WHERE balance_amount > 0 AND status != 'cancelled'
    `).get() as any;

    // Monthly sales trend (last 12 months)
    const salesTrend = db.prepare(`
      SELECT strftime('%Y-%m', sale_date) as month, 
             COALESCE(SUM(total_amount), 0) as total,
             COUNT(*) as count
      FROM sales 
      WHERE sale_date >= date('now', '-12 months') AND status != 'void'
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month
    `).all();

    // Top selling products (this month)
    const topProducts = db.prepare(`
      SELECT p.name, p.sku, SUM(si.quantity) as qty_sold, SUM(si.total) as revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date >= ? AND s.status != 'void'
      GROUP BY si.product_id
      ORDER BY revenue DESC
      LIMIT 10
    `).all(monthStart);

    // Sales by category
    const salesByCategory = db.prepare(`
      SELECT pc.name as category, COALESCE(SUM(si.total), 0) as revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN product_categories pc ON p.category_id = pc.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date >= ? AND s.status != 'void'
      GROUP BY pc.id
      ORDER BY revenue DESC
    `).all(monthStart);

    // Recent sales
    const recentSales = db.prepare(`
      SELECT s.*, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.status != 'void'
      ORDER BY s.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      today: { sales: todaySales.total, orders: todaySales.count },
      month: { sales: monthSales.total, orders: monthSales.count },
      lastWeekSales: lastWeekSales.total,
      customers: { total: customers.count, new: newCustomers.count },
      lowStockCount: lowStock.count,
      pendingLabOrders: pendingLabs.count,
      receivables: receivables.total,
      payables: payables.total,
      salesTrend,
      topProducts,
      salesByCategory,
      recentSales,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
