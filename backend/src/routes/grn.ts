import { Router } from 'express';
import db from '../database/connection';
import { generateId, generateSequentialNo } from '../utils/helpers';

export const grnRouter = Router();

grnRouter.get('/', (req, res) => {
  try {
    const grns = db.prepare(`
      SELECT g.*, v.company_name as vendor_name, po.po_number, u.full_name as received_by_name
      FROM goods_receipt_notes g
      JOIN vendors v ON g.vendor_id = v.id
      LEFT JOIN purchase_orders po ON g.po_id = po.id
      LEFT JOIN users u ON g.received_by = u.id
      ORDER BY g.receipt_date DESC
    `).all();
    res.json(grns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

grnRouter.get('/:id', (req, res) => {
  try {
    const grn = db.prepare(`
      SELECT g.*, v.company_name as vendor_name, po.po_number
      FROM goods_receipt_notes g
      JOIN vendors v ON g.vendor_id = v.id
      LEFT JOIN purchase_orders po ON g.po_id = po.id
      WHERE g.id = ?
    `).get(req.params.id) as any;
    if (!grn) return res.status(404).json({ error: 'GRN not found' });

    grn.items = db.prepare(`
      SELECT gi.*, p.name as product_name, p.sku
      FROM grn_items gi
      JOIN products p ON gi.product_id = p.id
      WHERE gi.grn_id = ?
    `).all(req.params.id);

    res.json(grn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

grnRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const lastGrn = db.prepare("SELECT grn_number FROM goods_receipt_notes ORDER BY grn_number DESC LIMIT 1").get() as any;
    const grn_number = generateSequentialNo('GRN', lastGrn?.grn_number);
    const g = req.body;

    db.prepare(`INSERT INTO goods_receipt_notes (id, grn_number, po_id, vendor_id, receipt_date, status, notes, received_by)
      VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, grn_number, g.po_id, g.vendor_id, g.receipt_date, 'accepted', g.notes, g.received_by);

    const insertItem = db.prepare(`INSERT INTO grn_items (id, grn_id, po_item_id, product_id, ordered_qty, received_qty, accepted_qty, rejected_qty, batch_no, serial_no, expiry_date, damage_notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

    for (const item of g.items) {
      insertItem.run(generateId(), id, item.po_item_id, item.product_id, item.ordered_qty, item.received_qty, item.accepted_qty, item.rejected_qty || 0, item.batch_no, item.serial_no, item.expiry_date, item.damage_notes);

      // Update inventory
      const inv = db.prepare('SELECT * FROM inventory WHERE product_id = ?').get(item.product_id) as any;
      if (inv) {
        const newQty = inv.quantity + item.accepted_qty;
        const newCost = ((inv.quantity * inv.avg_cost) + (item.accepted_qty * (item.unit_cost || inv.avg_cost))) / newQty;
        db.prepare("UPDATE inventory SET quantity = ?, avg_cost = ?, updated_at = datetime('now') WHERE product_id = ?")
          .run(newQty, newCost, item.product_id);
      }

      // Log inventory transaction
      db.prepare(`INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, unit_cost, reference_type, reference_id, created_by)
        VALUES (?, ?, 'purchase', ?, ?, 'grn', ?, ?)`).run(generateId(), item.product_id, item.accepted_qty, item.unit_cost || 0, id, g.received_by);

      // Update PO item received qty
      if (item.po_item_id) {
        db.prepare('UPDATE purchase_order_items SET received_qty = received_qty + ? WHERE id = ?')
          .run(item.accepted_qty, item.po_item_id);
      }
    }

    // Update PO status
    if (g.po_id) {
      const poItems = db.prepare('SELECT SUM(quantity) as total, SUM(received_qty) as received FROM purchase_order_items WHERE po_id = ?').get(g.po_id) as any;
      const newStatus = poItems.received >= poItems.total ? 'received' : 'partial';
      db.prepare("UPDATE purchase_orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, g.po_id);
    }

    res.status(201).json({ id, grn_number });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
