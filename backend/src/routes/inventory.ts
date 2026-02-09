import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const inventoryRouter = Router();

// Get all inventory with product details
inventoryRouter.get('/', (req, res) => {
  try {
    const { search, low_stock, category } = req.query;
    let where = 'WHERE p.is_active = 1 AND p.track_inventory = 1';
    const params: any[] = [];

    if (search) {
      where += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (low_stock === 'true') {
      where += ' AND i.quantity <= p.reorder_level';
    }
    if (category) {
      where += ' AND p.category_id = ?';
      params.push(category);
    }

    const items = db.prepare(`
      SELECT i.*, p.sku, p.barcode, p.name, p.product_type, p.selling_price, p.cost_price, 
        p.reorder_level, p.reorder_qty, pc.name as category_name, b.name as brand_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${where}
      ORDER BY p.name
    `).all(...params);

    // Summary
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN i.quantity <= p.reorder_level THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN i.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        COALESCE(SUM(i.quantity * i.avg_cost), 0) as total_stock_value
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE p.is_active = 1 AND p.track_inventory = 1
    `).get();

    res.json({ data: items, summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory transactions for a product
inventoryRouter.get('/transactions/:productId', (req, res) => {
  try {
    const txns = db.prepare(`
      SELECT it.*, p.name as product_name, u.full_name as created_by_name
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      LEFT JOIN users u ON it.created_by = u.id
      WHERE it.product_id = ?
      ORDER BY it.created_at DESC
      LIMIT 100
    `).all(req.params.productId);

    res.json(txns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stock adjustment
inventoryRouter.post('/adjust', (req, res) => {
  try {
    const { product_id, new_qty, reason, notes, created_by } = req.body;

    const inv = db.prepare('SELECT * FROM inventory WHERE product_id = ?').get(product_id) as any;
    if (!inv) return res.status(404).json({ error: 'Inventory record not found' });

    const difference = new_qty - inv.quantity;

    // Create adjustment record
    const adjId = generateId();
    const adjNo = 'ADJ-' + Date.now().toString().slice(-6);
    db.prepare(`INSERT INTO stock_adjustments (id, adjustment_no, adjustment_date, reason, notes, status, created_by)
      VALUES (?, ?, date('now'), ?, ?, 'approved', ?)`).run(adjId, adjNo, reason, notes, created_by);

    db.prepare(`INSERT INTO stock_adjustment_items (id, adjustment_id, product_id, current_qty, new_qty, difference, reason, cost_per_unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(generateId(), adjId, product_id, inv.quantity, new_qty, difference, reason, inv.avg_cost);

    // Update inventory
    db.prepare('UPDATE inventory SET quantity = ?, updated_at = datetime(\'now\') WHERE product_id = ?').run(new_qty, product_id);

    // Log transaction
    db.prepare(`INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
      VALUES (?, ?, 'adjustment', ?, ?, 'stock_adjustment', ?, ?, ?)`).run(generateId(), product_id, difference, inv.avg_cost, adjId, notes, created_by);

    res.json({ success: true, adjustment_no: adjNo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get stock adjustments
inventoryRouter.get('/adjustments', (_req, res) => {
  try {
    const adjustments = db.prepare(`
      SELECT sa.*, u.full_name as created_by_name,
        (SELECT COUNT(*) FROM stock_adjustment_items WHERE adjustment_id = sa.id) as item_count
      FROM stock_adjustments sa
      LEFT JOIN users u ON sa.created_by = u.id
      ORDER BY sa.created_at DESC
    `).all();
    res.json(adjustments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Low stock alerts
inventoryRouter.get('/alerts/low-stock', (_req, res) => {
  try {
    const items = db.prepare(`
      SELECT p.id, p.sku, p.name, p.product_type, p.reorder_level, p.reorder_qty,
        i.quantity as current_stock, b.name as brand_name, pc.name as category_name
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE i.quantity <= p.reorder_level AND p.is_active = 1 AND p.track_inventory = 1
      ORDER BY i.quantity ASC
    `).all();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
