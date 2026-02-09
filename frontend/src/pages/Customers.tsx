import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Phone, Mail, User, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Customer {
  id: string; customer_no: string; first_name: string; last_name: string; phone: string;
  email: string; gender: string; date_of_birth: string; address: string; city: string;
  loyalty_points: number; credit_balance: number; total_orders: number; total_spent: number;
  created_at: string;
}

const emptyForm = {
  first_name: '', last_name: '', phone: '', email: '', gender: '', date_of_birth: '',
  address: '', city: '', state: '', pincode: '', notes: '',
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [detail, setDetail] = useState<any>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchTerm) params.set('search', searchTerm);
      const res = await api.get<{ data: Customer[] }>(`/customers?${params}`);
      setCustomers(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, [searchTerm]);

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowModal(true); };
  const openEdit = async (c: Customer) => {
    try {
      const data = await api.get<any>(`/customers/${c.id}`);
      setForm({
        first_name: data.first_name, last_name: data.last_name, phone: data.phone || '',
        email: data.email || '', gender: data.gender || '', date_of_birth: data.date_of_birth || '',
        address: data.address || '', city: data.city || '', state: data.state || '',
        pincode: data.pincode || '', notes: data.notes || '',
      });
      setEditingId(c.id);
      setShowModal(true);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', form);
        toast.success('Customer created');
      }
      setShowModal(false);
      loadCustomers();
    } catch (err: any) { toast.error(err.message || 'Save failed'); }
  };

  const viewDetail = async (c: Customer) => {
    try {
      const data = await api.get<any>(`/customers/${c.id}`);
      setDetail(data);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Deleted');
      loadCustomers();
    } catch (err: any) { toast.error(err.message); }
  };

  const updateField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input className="form-input" placeholder="Search by name, phone, email..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Customer</button>
      </div>

      {/* Stats */}
      <div className="stat-cards" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card"><div className="stat-label">Total Customers</div><div className="stat-value">{customers.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">{formatCurrency(customers.reduce((s, c) => s + (c.total_spent || 0), 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Avg. Spend</div><div className="stat-value">{formatCurrency(customers.length ? customers.reduce((s, c) => s + (c.total_spent || 0), 0) / customers.length : 0)}</div></div>
        <div className="stat-card"><div className="stat-label">With Credit</div><div className="stat-value">{customers.filter(c => c.credit_balance > 0).length}</div></div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Phone</th><th>Email</th>
                <th style={{ textAlign: 'right' }}>Orders</th><th style={{ textAlign: 'right' }}>Total Spent</th>
                <th style={{ textAlign: 'right' }}>Loyalty Pts</th><th style={{ textAlign: 'right' }}>Credit</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>No customers found</td></tr>
              ) : customers.map(c => (
                <tr key={c.id}>
                  <td><code style={{ fontSize: 12 }}>{c.customer_no}</code></td>
                  <td style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{c.total_orders || 0}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(c.total_spent || 0)}</td>
                  <td style={{ textAlign: 'right' }}>{c.loyalty_points || 0}</td>
                  <td style={{ textAlign: 'right', color: c.credit_balance > 0 ? 'var(--danger)' : '' }}>
                    {formatCurrency(c.credit_balance || 0)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(c)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-3">
                <div className="form-group"><label className="form-label">First Name *</label>
                  <input className="form-input" value={form.first_name} onChange={e => updateField('first_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Last Name *</label>
                  <input className="form-input" value={form.last_name} onChange={e => updateField('last_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={e => updateField('gender', e.target.value)}>
                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={e => updateField('address', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">State</label>
                  <input className="form-input" value={form.state} onChange={e => updateField('state', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Pincode</label>
                  <input className="form-input" value={form.pincode} onChange={e => updateField('pincode', e.target.value)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={form.notes} onChange={e => updateField('notes', e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Customer: {detail.first_name} {detail.last_name}</h3>
              <button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{detail.total_orders || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Total Spent</div><div className="stat-value">{formatCurrency(detail.total_spent || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Loyalty Points</div><div className="stat-value">{detail.loyalty_points || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Credit Balance</div><div className="stat-value">{formatCurrency(detail.credit_balance || 0)}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div><strong>Customer No:</strong> {detail.customer_no}</div>
                <div><strong>Phone:</strong> {detail.phone || '—'}</div>
                <div><strong>Email:</strong> {detail.email || '—'}</div>
                <div><strong>Gender:</strong> {detail.gender || '—'}</div>
                <div><strong>DOB:</strong> {detail.date_of_birth ? formatDate(detail.date_of_birth) : '—'}</div>
                <div><strong>City:</strong> {detail.city || '—'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {detail.address || '—'}</div>
              </div>

              {detail.recent_sales?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Recent Purchases</h4>
                  <table className="table">
                    <thead><tr><th>Invoice</th><th>Date</th><th>Items</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {detail.recent_sales.map((s: any) => (
                        <tr key={s.id}>
                          <td>{s.invoice_no}</td>
                          <td>{formatDate(s.sale_date)}</td>
                          <td>{s.item_count}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(s.total_amount)}</td>
                          <td><span className={`badge ${s.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detail.prescriptions?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Prescriptions</h4>
                  <table className="table">
                    <thead><tr><th>Date</th><th>Doctor</th><th>OD Sphere</th><th>OD Cyl</th><th>OS Sphere</th><th>OS Cyl</th><th>Expiry</th></tr></thead>
                    <tbody>
                      {detail.prescriptions.map((p: any) => (
                        <tr key={p.id}>
                          <td>{formatDate(p.prescription_date)}</td>
                          <td>{p.doctor_name || '—'}</td>
                          <td>{p.od_sphere || '—'}</td><td>{p.od_cylinder || '—'}</td>
                          <td>{p.os_sphere || '—'}</td><td>{p.os_cylinder || '—'}</td>
                          <td>{p.expiry_date ? formatDate(p.expiry_date) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
