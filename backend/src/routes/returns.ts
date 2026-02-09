import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const returnsRouter = Router();

returnsRouter.get('/', (_req, res) => {
  try {
    const returns = db.prepare(`
      SELECT r.*, s.invoice_no, c.first_name || ' ' || COALESCE(c.last_name,'') as customer_name
      FROM returns r
      JOIN sales s ON r.sale_id = s.id
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY r.return_date DESC
    `).all();
    res.json(returns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

returnsRouter.post('/', (req, res) => {
  try {
    const r = req.body;
    const id = generateId();
    const lastNo = db.prepare("SELECT return_no FROM returns ORDER BY return_no DESC LIMIT 1").get() as any;
    const return_no = generateSequentialNo('RET', lastNo?.return_no);

    let subtotal = 0, taxTotal = 0;

    for (const item of r.items) {
      subtotal += item.quantity * item.unit_price;
      taxTotal += item.quantity * item.unit_price * (item.tax_rate || 0) / 100;
    }

    const totalAmount = subtotal + taxTotal;

    db.prepare(`INSERT INTO returns (id, return_no, sale_id, customer_id, return_date, return_type, reason,
      subtotal, tax_amount, total_amount, refund_method, status, processed_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, return_no, r.sale_id, r.customer_id, r.return_date || new Date().toISOString().split('T')[0],
        r.return_type, r.reason, subtotal, taxTotal, totalAmount, r.refund_method, 'completed', r.processed_by);

    const insertItem = db.prepare(`INSERT INTO return_items (id, return_id, sale_item_id, product_id, quantity, unit_price, total, reason, condition)
      VALUES (?,?,?,?,?,?,?,?,?)`);

    for (const item of r.items) {
      insertItem.run(generateId(), id, item.sale_item_id, item.product_id, item.quantity, item.unit_price,
        item.quantity * item.unit_price, item.reason, item.condition || 'good');

      // Restore inventory if condition is good
      if (item.condition !== 'damaged' && item.condition !== 'defective') {
        db.prepare("UPDATE inventory SET quantity = quantity + ?, updated_at = datetime('now') WHERE product_id = ?")
          .run(item.quantity, item.product_id);
      }
    }

    // Update original sale
    db.prepare("UPDATE sales SET status = 'returned', updated_at = datetime('now') WHERE id = ?").run(r.sale_id);

    res.status(201).json({ id, return_no, total_amount: totalAmount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
