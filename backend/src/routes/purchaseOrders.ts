import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const purchaseOrdersRouter = Router();

purchaseOrdersRouter.get('/', (req, res) => {
  try {
    const { status, vendor_id } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (status) { where += ' AND po.status = ?'; params.push(status); }
    if (vendor_id) { where += ' AND po.vendor_id = ?'; params.push(vendor_id); }

    const orders = db.prepare(`
      SELECT po.*, v.company_name as vendor_name, u.full_name as created_by_name,
        (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) as item_count
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      LEFT JOIN users u ON po.created_by = u.id
      ${where}
      ORDER BY po.order_date DESC
    `).all(...params);

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

purchaseOrdersRouter.get('/:id', (req, res) => {
  try {
    const po = db.prepare(`
      SELECT po.*, v.company_name as vendor_name, v.gst_no as vendor_gst, v.phone as vendor_phone,
        v.address_line1 as vendor_address, v.city as vendor_city
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE po.id = ?
    `).get(req.params.id) as any;
    if (!po) return res.status(404).json({ error: 'PO not found' });

    po.items = db.prepare(`
      SELECT poi.*, p.name as product_name, p.sku
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.po_id = ?
    `).all(req.params.id);

    res.json(po);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

purchaseOrdersRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastPo = db.prepare("SELECT po_number FROM purchase_orders ORDER BY po_number DESC LIMIT 1").get() as any;
    const po_number = generateSequentialNo('PO', lastPo?.po_number);
    const po = req.body;

    let subtotal = 0;
    let taxAmount = 0;

    // Calculate totals
    for (const item of po.items) {
      const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_pct || 0) / 100);
      const itemTax = itemTotal * (item.tax_rate || 0) / 100;
      subtotal += itemTotal;
      taxAmount += itemTax;
    }

    const total = subtotal + taxAmount + (po.freight_amount || 0) - (po.discount_amount || 0);

    db.prepare(`INSERT INTO purchase_orders (id, po_number, vendor_id, requisition_id, order_date, expected_delivery,
      subtotal, discount_amount, tax_amount, freight_amount, total_amount, status, payment_terms, notes, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, po_number, po.vendor_id, po.requisition_id, po.order_date, po.expected_delivery,
        subtotal, po.discount_amount || 0, taxAmount, po.freight_amount || 0, total,
        'draft', po.payment_terms, po.notes, po.created_by);

    // Insert items
    const insertItem = db.prepare(`INSERT INTO purchase_order_items (id, po_id, product_id, quantity, unit_price, discount_pct, tax_rate, tax_amount, total)
      VALUES (?,?,?,?,?,?,?,?,?)`);

    for (const item of po.items) {
      const itemTotal = item.quantity * item.unit_price * (1 - (item.discount_pct || 0) / 100);
      const itemTax = itemTotal * (item.tax_rate || 0) / 100;
      insertItem.run(generateId(), id, item.product_id, item.quantity, item.unit_price, item.discount_pct || 0, item.tax_rate || 0, itemTax, itemTotal + itemTax);
    }

    res.status(201).json({ id, po_number, total_amount: total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

purchaseOrdersRouter.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare("UPDATE purchase_orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
