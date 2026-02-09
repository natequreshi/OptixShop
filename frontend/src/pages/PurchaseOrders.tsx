import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, today } from '../utils/helpers';
import toast from 'react-hot-toast';

interface PO {
  id: string; po_number: string; vendor_id: string; vendor_name: string;
  order_date: string; expected_date: string; status: string;
  subtotal: number; tax_amount: number; total_amount: number;
}

interface Vendor { id: string; company_name: string; }
interface Product { id: string; name: string; sku: string; cost_price: number; tax_rate: number; }

interface POLine { product_id: string; product_name: string; quantity: string; unit_price: string; tax_rate: string; }

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [orderDate, setOrderDate] = useState(today());
  const [expectedDate, setExpectedDate] = useState('');
  const [lines, setLines] = useState<POLine[]>([{ product_id: '', product_name: '', quantity: '1', unit_price: '0', tax_rate: '18' }]);
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ data: PO[] }>(`/purchase-orders?${params}`);
      setOrders(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    Promise.all([
      api.get<{ data: Vendor[] }>('/vendors?limit=100'),
      api.get<{ data: Product[] }>('/products?limit=200'),
    ]).then(([v, p]) => { setVendors(v.data); setProducts(p.data); }).catch(console.error);
  }, []);

  const addLine = () => setLines(l => [...l, { product_id: '', product_name: '', quantity: '1', unit_price: '0', tax_rate: '18' }]);
  const removeLine = (idx: number) => setLines(l => l.filter((_, i) => i !== idx));
  const updateLine = (idx: number, field: string, value: string) => {
    setLines(l => l.map((line, i) => {
      if (i !== idx) return line;
      const updated = { ...line, [field]: value };
      if (field === 'product_id') {
        const prod = products.find(p => p.id === value);
        if (prod) { updated.product_name = prod.name; updated.unit_price = String(prod.cost_price); updated.tax_rate = String(prod.tax_rate); }
      }
      return updated;
    }));
  };

  const lineTotal = (l: POLine) => parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0');
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const taxTotal = lines.reduce((s, l) => s + lineTotal(l) * parseFloat(l.tax_rate || '0') / 100, 0);

  const handleCreate = async () => {
    try {
      await api.post('/purchase-orders', {
        vendor_id: vendorId, order_date: orderDate, expected_date: expectedDate || null,
        items: lines.map(l => ({ product_id: l.product_id, quantity: parseInt(l.quantity), unit_price: parseFloat(l.unit_price), tax_rate: parseFloat(l.tax_rate) })),
      });
      toast.success('PO created');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewDetail = async (po: PO) => {
    try { const data = await api.get<any>(`/purchase-orders/${po.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const statusColors: Record<string, string> = { draft: 'badge-secondary', sent: 'badge-info', partial: 'badge-warning', received: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div>
      <div className="toolbar">
        <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="draft">Draft</option><option value="sent">Sent</option>
          <option value="partial">Partial</option><option value="received">Received</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setVendorId(''); setLines([{ product_id: '', product_name: '', quantity: '1', unit_price: '0', tax_rate: '18' }]); setShowModal(true); }}>
          <Plus size={16} /> New Purchase Order
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>PO #</th><th>Vendor</th><th>Date</th><th>Expected</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th style={{ width: 80 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : orders.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No purchase orders</td></tr>
              : orders.map(po => (
                <tr key={po.id}>
                  <td><code style={{ fontSize: 12 }}>{po.po_number}</code></td>
                  <td style={{ fontWeight: 500 }}>{po.vendor_name}</td>
                  <td>{formatDate(po.order_date)}</td>
                  <td>{po.expected_date ? formatDate(po.expected_date) : '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(po.total_amount)}</td>
                  <td><span className={`badge ${statusColors[po.status] || 'badge-secondary'}`}>{po.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => viewDetail(po)}><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Purchase Order</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3" style={{ marginBottom: 20 }}>
                <div className="form-group"><label className="form-label">Vendor *</label>
                  <select className="form-input" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Order Date</label>
                  <input type="date" className="form-input" value={orderDate} onChange={e => setOrderDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Expected Date</label>
                  <input type="date" className="form-input" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} /></div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Items</h4>
              <table className="table" style={{ marginBottom: 12 }}>
                <thead><tr><th>Product</th><th style={{ width: 80 }}>Qty</th><th style={{ width: 100 }}>Price</th><th style={{ width: 80 }}>Tax%</th><th style={{ width: 100, textAlign: 'right' }}>Total</th><th style={{ width: 40 }}></th></tr></thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      <td><select className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.product_id} onChange={e => updateLine(idx, 'product_id', e.target.value)}>
                        <option value="">Select</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select></td>
                      <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} /></td>
                      <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.unit_price} onChange={e => updateLine(idx, 'unit_price', e.target.value)} /></td>
                      <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.tax_rate} onChange={e => updateLine(idx, 'tax_rate', e.target.value)} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(lineTotal(line))}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => removeLine(idx)}><X size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-secondary btn-sm" onClick={addLine}><Plus size={14} /> Add Line</button>
              <div style={{ marginTop: 16, textAlign: 'right', fontSize: 14 }}>
                <div>Subtotal: <strong>{formatCurrency(subtotal)}</strong></div>
                <div>Tax: <strong>{formatCurrency(taxTotal)}</strong></div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>Total: {formatCurrency(subtotal + taxTotal)}</div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create PO</button></div>
          </div>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">PO: {detail.po_number}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Vendor:</strong> {detail.vendor_name}</div>
                <div><strong>Date:</strong> {formatDate(detail.order_date)}</div>
                <div><strong>Status:</strong> <span className={`badge ${statusColors[detail.status]}`}>{detail.status}</span></div>
              </div>
              <table className="table">
                <thead><tr><th>Product</th><th>Qty</th><th>Received</th><th>Price</th><th>Tax</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {detail.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.received_qty || 0}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{item.tax_rate}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>Total:</td><td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>{formatCurrency(detail.total_amount)}</td></tr>
                </tfoot>
              </table>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
