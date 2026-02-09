import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit2, X, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { formatDate, today } from '../utils/helpers';
import toast from 'react-hot-toast';

interface LabOrder {
  id: string; order_number: string; sale_invoice: string; customer_name: string;
  product_name: string; prescription_no: string; status: string;
  order_date: string; due_date: string; lab_name: string;
}

const STATUSES = ['pending', 'in_progress', 'edging', 'polishing', 'fitting', 'quality_check', 'ready', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', edging: 'Edging', polishing: 'Polishing',
  fitting: 'Fitting', quality_check: 'QC', ready: 'Ready', delivered: 'Delivered',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-secondary', in_progress: 'badge-info', edging: 'badge-info',
  polishing: 'badge-info', fitting: 'badge-warning', quality_check: 'badge-warning',
  ready: 'badge-success', delivered: 'badge-primary',
};

const emptyForm = {
  customer_id: '', sale_id: '', prescription_id: '', product_id: '',
  order_date: today(), due_date: '', lab_name: '', lab_phone: '',
  lens_type: '', lens_material: '', lens_coating: '', lens_index: '',
  frame_info: '', special_instructions: '', notes: '',
};

export default function LabOrders() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ data: LabOrder[] }>(`/lab-orders?${params}`);
      setOrders(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/lab-orders', form);
      toast.success('Lab order created');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const advanceStatus = async (order: LabOrder) => {
    const currentIdx = STATUSES.indexOf(order.status);
    if (currentIdx >= STATUSES.length - 1) return;
    const nextStatus = STATUSES[currentIdx + 1];
    try {
      await api.put(`/lab-orders/${order.id}`, { status: nextStatus });
      toast.success(`Status updated to ${STATUS_LABELS[nextStatus]}`);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewDetail = async (order: LabOrder) => {
    try { const data = await api.get<any>(`/lab-orders/${order.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const updateField = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  // Count by status
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {} as Record<string, number>);

  return (
    <div>
      <div className="toolbar">
        <div className="filter-pills">
          <button className={`filter-pill ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>All ({orders.length})</button>
          {STATUSES.map(s => (
            <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {STATUS_LABELS[s]} ({counts[s] || 0})
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setForm({ ...emptyForm }); setShowModal(true); }}><Plus size={16} /> New Lab Order</button>
      </div>

      {/* Pipeline */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {STATUSES.slice(0, -1).map(s => (
          <div key={s} style={{ flex: 1, minWidth: 120, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
              {STATUS_LABELS[s]} ({counts[s] || 0})
            </div>
            {orders.filter(o => o.status === s).slice(0, 5).map(o => (
              <div key={o.id} style={{ background: 'white', borderRadius: 6, padding: '8px 10px', marginBottom: 4, fontSize: 12, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                onClick={() => viewDetail(o)}>
                <div style={{ fontWeight: 600 }}>{o.order_number}</div>
                <div style={{ color: 'var(--text-muted)' }}>{o.customer_name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Product</th><th>Lab</th><th>Order Date</th><th>Due Date</th><th>Status</th><th style={{ width: 140 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : orders.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>No lab orders</td></tr>
              : orders.map(o => (
                <tr key={o.id}>
                  <td><code style={{ fontSize: 12 }}>{o.order_number}</code></td>
                  <td style={{ fontWeight: 500 }}>{o.customer_name || '—'}</td>
                  <td>{o.product_name || '—'}</td>
                  <td>{o.lab_name || '—'}</td>
                  <td>{formatDate(o.order_date)}</td>
                  <td>{o.due_date ? formatDate(o.due_date) : '—'}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-secondary'}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(o)}><Eye size={14} /></button>
                      {o.status !== 'delivered' && (
                        <button className="btn btn-outline btn-sm" onClick={() => advanceStatus(o)}>
                          Next <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Lab Order</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3">
                <div className="form-group"><label className="form-label">Order Date</label><input type="date" className="form-input" value={form.order_date} onChange={e => updateField('order_date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={form.due_date} onChange={e => updateField('due_date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Lab Name</label><input className="form-input" value={form.lab_name} onChange={e => updateField('lab_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Lab Phone</label><input className="form-input" value={form.lab_phone} onChange={e => updateField('lab_phone', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Lens Type</label><input className="form-input" value={form.lens_type} onChange={e => updateField('lens_type', e.target.value)} placeholder="Single Vision, Progressive..." /></div>
                <div className="form-group"><label className="form-label">Lens Material</label><input className="form-input" value={form.lens_material} onChange={e => updateField('lens_material', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Lens Coating</label><input className="form-input" value={form.lens_coating} onChange={e => updateField('lens_coating', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Lens Index</label><input className="form-input" value={form.lens_index} onChange={e => updateField('lens_index', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Frame Info</label><input className="form-input" value={form.frame_info} onChange={e => updateField('frame_info', e.target.value)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Special Instructions</label>
                <textarea className="form-input" rows={2} value={form.special_instructions} onChange={e => updateField('special_instructions', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => updateField('notes', e.target.value)} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Lab Order</button></div>
          </div>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Lab Order: {detail.order_number}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {STATUSES.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                      background: STATUSES.indexOf(detail.status) >= i ? 'var(--primary)' : 'var(--border)', color: STATUSES.indexOf(detail.status) >= i ? 'white' : 'var(--text-muted)' }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: STATUSES.indexOf(detail.status) >= i ? 'var(--text)' : 'var(--text-muted)' }}>{STATUS_LABELS[s]}</span>
                    {i < STATUSES.length - 1 && <ChevronRight size={12} style={{ color: 'var(--border)' }} />}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div><strong>Customer:</strong> {detail.customer_name || '—'}</div>
                <div><strong>Lab:</strong> {detail.lab_name || '—'}</div>
                <div><strong>Order Date:</strong> {formatDate(detail.order_date)}</div>
                <div><strong>Due Date:</strong> {detail.due_date ? formatDate(detail.due_date) : '—'}</div>
                <div><strong>Lens:</strong> {detail.lens_type} {detail.lens_material} {detail.lens_index}</div>
                <div><strong>Coating:</strong> {detail.lens_coating || '—'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Frame:</strong> {detail.frame_info || '—'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Instructions:</strong> {detail.special_instructions || '—'}</div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
