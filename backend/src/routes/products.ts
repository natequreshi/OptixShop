import { Router } from 'express';
import db from '../database/connection';
import { generateId } from '../utils/helpers';

export const productsRouter = Router();

// List all products with pagination & search
productsRouter.get('/', (req, res) => {
  try {
    const { search, category, type, brand, page = '1', limit = '50', active } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      where += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) { where += ' AND p.category_id = ?'; params.push(category); }
    if (type) { where += ' AND p.product_type = ?'; params.push(type); }
    if (brand) { where += ' AND p.brand_id = ?'; params.push(brand); }
    if (active !== undefined) { where += ' AND p.is_active = ?'; params.push(active === 'true' ? 1 : 0); }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const total = db.prepare(`SELECT COUNT(*) as count FROM products p ${where}`).get(...params) as any;

    const products = db.prepare(`
      SELECT p.*, 
        pc.name as category_name, 
        b.name as brand_name,
        COALESCE(i.quantity, 0) as stock_quantity,
        COALESCE(i.avg_cost, p.cost_price) as avg_cost
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory i ON p.id = i.product_id
      ${where}
      ORDER BY p.name
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit as string), offset);

    res.json({ data: products, total: total.count, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID with all attributes
productsRouter.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, pc.name as category_name, b.name as brand_name,
        COALESCE(i.quantity, 0) as stock_quantity, COALESCE(i.avg_cost, p.cost_price) as avg_cost
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = ?
    `).get(req.params.id) as any;

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Get type-specific attributes
    if (product.product_type === 'frame') {
      product.attributes = db.prepare('SELECT * FROM frame_attributes WHERE product_id = ?').get(product.id);
    } else if (product.product_type === 'lens') {
      product.attributes = db.prepare('SELECT * FROM lens_attributes WHERE product_id = ?').get(product.id);
    } else if (product.product_type === 'contact_lens') {
      product.attributes = db.prepare('SELECT * FROM contact_lens_attributes WHERE product_id = ?').get(product.id);
    } else if (product.product_type === 'sunglasses') {
      product.attributes = db.prepare('SELECT * FROM sunglasses_attributes WHERE product_id = ?').get(product.id);
    }

    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Barcode/SKU lookup (for POS)
productsRouter.get('/lookup/:code', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, pc.name as category_name, b.name as brand_name,
        COALESCE(i.quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE (p.barcode = ? OR p.sku = ?) AND p.is_active = 1
    `).get(req.params.code, req.params.code);

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
productsRouter.post('/', (req, res) => {
  try {
    const id = generateId();
    const p = req.body;

    db.prepare(`
      INSERT INTO products (id, sku, barcode, name, description, category_id, brand_id, product_type,
        cost_price, selling_price, mrp, wholesale_price, tax_rate, tax_inclusive, hsn_sac_code,
        track_inventory, reorder_level, reorder_qty, costing_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, p.sku, p.barcode, p.name, p.description, p.category_id, p.brand_id, p.product_type,
      p.cost_price, p.selling_price, p.mrp, p.wholesale_price, p.tax_rate, p.tax_inclusive ? 1 : 0,
      p.hsn_sac_code, p.track_inventory !== false ? 1 : 0, p.reorder_level || 5, p.reorder_qty || 10,
      p.costing_method || 'average');

    // Create inventory record
    if (p.track_inventory !== false) {
      db.prepare('INSERT INTO inventory (id, product_id, quantity, avg_cost) VALUES (?, ?, ?, ?)')
        .run(generateId(), id, p.opening_stock || 0, p.cost_price || 0);
    }

    // Insert type-specific attributes
    if (p.product_type === 'frame' && p.attributes) {
      const a = p.attributes;
      db.prepare(`INSERT INTO frame_attributes (product_id, model, color, size_bridge, size_temple, size_lens_width, material, shape, gender, frame_type, weight_grams)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, a.model, a.color, a.size_bridge, a.size_temple, a.size_lens_width, a.material, a.shape, a.gender, a.frame_type, a.weight_grams);
    } else if (p.product_type === 'lens' && p.attributes) {
      const a = p.attributes;
      db.prepare(`INSERT INTO lens_attributes (product_id, lens_type, lens_index, lens_material, coating_ar, coating_blue_cut, coating_photochromic, coating_polarized, coating_scratch_resistant, coating_uv, tint, addition_range, diameter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, a.lens_type, a.lens_index, a.lens_material, a.coating_ar?1:0, a.coating_blue_cut?1:0, a.coating_photochromic?1:0, a.coating_polarized?1:0, a.coating_scratch_resistant?1:0, a.coating_uv?1:0, a.tint, a.addition_range, a.diameter);
    } else if (p.product_type === 'contact_lens' && p.attributes) {
      const a = p.attributes;
      db.prepare(`INSERT INTO contact_lens_attributes (product_id, contact_type, sphere_range, cylinder_range, axis_range, base_curve, diameter, pack_size, water_content, material)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, a.contact_type, a.sphere_range, a.cylinder_range, a.axis_range, a.base_curve, a.diameter, a.pack_size, a.water_content, a.material);
    } else if (p.product_type === 'sunglasses' && p.attributes) {
      const a = p.attributes;
      db.prepare(`INSERT INTO sunglasses_attributes (product_id, is_rx_ready, uv_category, is_polarized, lens_color, mirror_coating)
        VALUES (?, ?, ?, ?, ?, ?)`).run(id, a.is_rx_ready?1:0, a.uv_category, a.is_polarized?1:0, a.lens_color, a.mirror_coating?1:0);
    }

    res.status(201).json({ id, sku: p.sku, name: p.name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
productsRouter.put('/:id', (req, res) => {
  try {
    const p = req.body;
    db.prepare(`
      UPDATE products SET sku=?, barcode=?, name=?, description=?, category_id=?, brand_id=?,
        cost_price=?, selling_price=?, mrp=?, wholesale_price=?, tax_rate=?, tax_inclusive=?,
        hsn_sac_code=?, reorder_level=?, reorder_qty=?, is_active=?, updated_at=datetime('now')
      WHERE id=?
    `).run(p.sku, p.barcode, p.name, p.description, p.category_id, p.brand_id,
      p.cost_price, p.selling_price, p.mrp, p.wholesale_price, p.tax_rate, p.tax_inclusive ? 1 : 0,
      p.hsn_sac_code, p.reorder_level, p.reorder_qty, p.is_active !== false ? 1 : 0, req.params.id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (soft)
productsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('UPDATE products SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
