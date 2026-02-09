import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Filter, Eye } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Product {
  id: string; sku: string; barcode: string; name: string; product_type: string;
  brand_id: string; category_id: string; cost_price: number; selling_price: number;
  tax_rate: number; reorder_level: number; is_active: number;
  brand_name: string; category_name: string; stock_quantity: number;
}

interface Brand { id: string; name: string; }
interface Category { id: string; name: string; }

const PRODUCT_TYPES = [
  { value: 'frame', label: 'Frame' },
  { value: 'lens', label: 'Lens' },
  { value: 'contact_lens', label: 'Contact Lens' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'solution', label: 'Solution' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  name: '', sku: '', barcode: '', product_type: 'frame', brand_id: '', category_id: '',
  cost_price: '', selling_price: '', tax_rate: '18', reorder_level: '10', is_active: 1,
  frame_type: '', frame_shape: '', frame_material: '', frame_color: '', frame_size: '', frame_gender: '',
  lens_type: '', lens_material: '', lens_coating: '', lens_index: '',
  contact_type: '', contact_wear_schedule: '', contact_replacement: '', contact_base_curve: '', contact_diameter: '', contact_power_range: '',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [showDetail, setShowDetail] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (searchTerm) params.set('search', searchTerm);
      if (typeFilter) params.set('type', typeFilter);
      const res = await api.get<{ data: Product[] }>(`/products?${params}`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [searchTerm, typeFilter]);

  useEffect(() => {
    Promise.all([
      api.get<Brand[]>('/brands'),
      api.get<Category[]>('/categories'),
    ]).then(([b, c]) => { setBrands(b); setCategories(c); }).catch(console.error);
  }, []);

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowModal(true); };
  const openEdit = async (p: Product) => {
    try {
      const data = await api.get<any>(`/products/${p.id}`);
      setForm({
        name: data.name, sku: data.sku, barcode: data.barcode || '', product_type: data.product_type,
        brand_id: data.brand_id || '', category_id: data.category_id || '',
        cost_price: data.cost_price, selling_price: data.selling_price,
        tax_rate: data.tax_rate, reorder_level: data.reorder_level, is_active: data.is_active,
        frame_type: data.frame_type || '', frame_shape: data.frame_shape || '', frame_material: data.frame_material || '',
        frame_color: data.frame_color || '', frame_size: data.frame_size || '', frame_gender: data.frame_gender || '',
        lens_type: data.lens_type || '', lens_material: data.lens_material || '',
        lens_coating: data.lens_coating || '', lens_index: data.lens_index || '',
        contact_type: data.contact_type || '', contact_wear_schedule: data.contact_wear_schedule || '',
        contact_replacement: data.contact_replacement || '', contact_base_curve: data.contact_base_curve || '',
        contact_diameter: data.contact_diameter || '', contact_power_range: data.contact_power_range || '',
      });
      setEditingId(p.id);
      setShowModal(true);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSave = async () => {
    try {
      const body: any = {
        name: form.name, sku: form.sku, barcode: form.barcode || null, product_type: form.product_type,
        brand_id: form.brand_id || null, category_id: form.category_id || null,
        cost_price: parseFloat(form.cost_price), selling_price: parseFloat(form.selling_price),
        tax_rate: parseFloat(form.tax_rate), reorder_level: parseInt(form.reorder_level), is_active: form.is_active,
      };
      if (form.product_type === 'frame') {
        body.frame_type = form.frame_type; body.frame_shape = form.frame_shape; body.frame_material = form.frame_material;
        body.frame_color = form.frame_color; body.frame_size = form.frame_size; body.frame_gender = form.frame_gender;
      } else if (form.product_type === 'lens') {
        body.lens_type = form.lens_type; body.lens_material = form.lens_material;
        body.lens_coating = form.lens_coating; body.lens_index = form.lens_index;
      } else if (form.product_type === 'contact_lens') {
        body.contact_type = form.contact_type; body.contact_wear_schedule = form.contact_wear_schedule;
        body.contact_replacement = form.contact_replacement; body.contact_base_curve = form.contact_base_curve;
        body.contact_diameter = form.contact_diameter; body.contact_power_range = form.contact_power_range;
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, body);
        toast.success('Product updated');
      } else {
        await api.post('/products', body);
        toast.success('Product created');
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) { toast.error(err.message || 'Save failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      loadProducts();
    } catch (err: any) { toast.error(err.message); }
  };

  const updateField = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input className="form-input" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Product</button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th><th>Name</th><th>Type</th><th>Brand</th><th>Category</th>
                <th style={{ textAlign: 'right' }}>Cost</th><th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Stock</th><th>Status</th><th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td><code style={{ fontSize: 12 }}>{p.sku}</code></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className="badge badge-info">{p.product_type}</span></td>
                  <td>{p.brand_name || '—'}</td>
                  <td>{p.category_name || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(p.cost_price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.selling_price)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={p.stock_quantity <= 5 ? 'text-danger' : ''}>{p.stock_quantity}</span>
                  </td>
                  <td><span className={`badge ${p.is_active ? 'badge-success' : 'badge-secondary'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Product' : 'New Product'}</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Basic Info */}
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => updateField('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input className="form-input" value={form.sku} onChange={e => updateField('sku', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode</label>
                  <input className="form-input" value={form.barcode} onChange={e => updateField('barcode', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Type *</label>
                  <select className="form-input" value={form.product_type} onChange={e => updateField('product_type', e.target.value)}>
                    {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select className="form-input" value={form.brand_id} onChange={e => updateField('brand_id', e.target.value)}>
                    <option value="">— Select Brand —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category_id} onChange={e => updateField('category_id', e.target.value)}>
                    <option value="">— Select Category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price *</label>
                  <input type="number" className="form-input" value={form.cost_price} onChange={e => updateField('cost_price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price *</label>
                  <input type="number" className="form-input" value={form.selling_price} onChange={e => updateField('selling_price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input type="number" className="form-input" value={form.tax_rate} onChange={e => updateField('tax_rate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reorder Level</label>
                  <input type="number" className="form-input" value={form.reorder_level} onChange={e => updateField('reorder_level', e.target.value)} />
                </div>
              </div>

              {/* Frame Attributes */}
              {form.product_type === 'frame' && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--primary)' }}>Frame Attributes</h4>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Frame Type</label>
                      <select className="form-input" value={form.frame_type} onChange={e => updateField('frame_type', e.target.value)}>
                        <option value="">Select</option>
                        <option value="full_rim">Full Rim</option>
                        <option value="half_rim">Half Rim</option>
                        <option value="rimless">Rimless</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shape</label>
                      <select className="form-input" value={form.frame_shape} onChange={e => updateField('frame_shape', e.target.value)}>
                        <option value="">Select</option>
                        {['rectangle', 'round', 'oval', 'cat_eye', 'aviator', 'wayfarer', 'square', 'clubmaster'].map(s =>
                          <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Material</label>
                      <select className="form-input" value={form.frame_material} onChange={e => updateField('frame_material', e.target.value)}>
                        <option value="">Select</option>
                        {['metal', 'plastic', 'acetate', 'titanium', 'tr90', 'wood', 'carbon_fiber'].map(m =>
                          <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color</label>
                      <input className="form-input" value={form.frame_color} onChange={e => updateField('frame_color', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Size</label>
                      <input className="form-input" placeholder="e.g. 52-18-140" value={form.frame_size} onChange={e => updateField('frame_size', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-input" value={form.frame_gender} onChange={e => updateField('frame_gender', e.target.value)}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unisex">Unisex</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Lens Attributes */}
              {form.product_type === 'lens' && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--primary)' }}>Lens Attributes</h4>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Lens Type</label>
                      <select className="form-input" value={form.lens_type} onChange={e => updateField('lens_type', e.target.value)}>
                        <option value="">Select</option>
                        {['single_vision', 'bifocal', 'progressive', 'reading', 'computer'].map(t =>
                          <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Material</label>
                      <select className="form-input" value={form.lens_material} onChange={e => updateField('lens_material', e.target.value)}>
                        <option value="">Select</option>
                        {['cr39', 'polycarbonate', 'trivex', 'high_index', 'glass'].map(m =>
                          <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Coating</label>
                      <select className="form-input" value={form.lens_coating} onChange={e => updateField('lens_coating', e.target.value)}>
                        <option value="">Select</option>
                        {['anti_reflective', 'blue_cut', 'photochromic', 'polarized', 'uv', 'scratch_resistant', 'hydrophobic'].map(c =>
                          <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Index</label>
                      <select className="form-input" value={form.lens_index} onChange={e => updateField('lens_index', e.target.value)}>
                        <option value="">Select</option>
                        <option value="1.50">1.50</option>
                        <option value="1.56">1.56</option>
                        <option value="1.60">1.60</option>
                        <option value="1.67">1.67</option>
                        <option value="1.74">1.74</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Lens Attributes */}
              {form.product_type === 'contact_lens' && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--primary)' }}>Contact Lens Attributes</h4>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-input" value={form.contact_type} onChange={e => updateField('contact_type', e.target.value)}>
                        <option value="">Select</option>
                        {['soft', 'rigid', 'hybrid', 'scleral'].map(t =>
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wear Schedule</label>
                      <select className="form-input" value={form.contact_wear_schedule} onChange={e => updateField('contact_wear_schedule', e.target.value)}>
                        <option value="">Select</option>
                        <option value="daily">Daily Wear</option>
                        <option value="extended">Extended Wear</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Replacement</label>
                      <select className="form-input" value={form.contact_replacement} onChange={e => updateField('contact_replacement', e.target.value)}>
                        <option value="">Select</option>
                        {['daily', 'biweekly', 'monthly', 'quarterly', 'yearly'].map(r =>
                          <option key={r} value={r}>{r.toUpperCase()}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Base Curve</label>
                      <input className="form-input" value={form.contact_base_curve} onChange={e => updateField('contact_base_curve', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diameter</label>
                      <input className="form-input" value={form.contact_diameter} onChange={e => updateField('contact_diameter', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Power Range</label>
                      <input className="form-input" value={form.contact_power_range} onChange={e => updateField('contact_power_range', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
