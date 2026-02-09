import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Vendor {
  id: string; vendor_code: string; company_name: string; contact_person: string;
  phone: string; email: string; gstin: string; city: string; state: string;
  total_purchases: number; outstanding_amount: number;
}

const emptyForm = {
  company_name: '', contact_person: '', phone: '', email: '', gstin: '', pan: '',
  address: '', city: '', state: '', pincode: '', payment_terms: '30',
  bank_name: '', bank_account: '', bank_ifsc: '', notes: '',
};

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchTerm) params.set('search', searchTerm);
      const res = await api.get<{ data: Vendor[] }>(`/vendors?${params}`);
      setVendors(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [searchTerm]);

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowModal(true); };
  const openEdit = async (v: Vendor) => {
    try {
      const data = await api.get<any>(`/vendors/${v.id}`);
      setForm({
        company_name: data.company_name, contact_person: data.contact_person || '', phone: data.phone || '',
        email: data.email || '', gstin: data.gstin || '', pan: data.pan || '',
        address: data.address || '', city: data.city || '', state: data.state || '', pincode: data.pincode || '',
        payment_terms: data.payment_terms || '30', bank_name: data.bank_name || '',
        bank_account: data.bank_account || '', bank_ifsc: data.bank_ifsc || '', notes: data.notes || '',
      });
      setEditingId(v.id);
      setShowModal(true);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSave = async () => {
    try {
      if (editingId) { await api.put(`/vendors/${editingId}`, form); toast.success('Updated'); }
      else { await api.post('/vendors', form); toast.success('Created'); }
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewDetail = async (v: Vendor) => {
    try { const data = await api.get<any>(`/vendors/${v.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete vendor?')) return;
    try { await api.delete(`/vendors/${id}`); toast.success('Deleted'); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const updateField = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className="toolbar">
        <div className="search-box"><Search /><input className="form-input" placeholder="Search vendors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} /></div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Vendor</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Company</th><th>Contact</th><th>Phone</th><th>GSTIN</th><th>City</th>
                <th style={{ textAlign: 'right' }}>Purchases</th><th style={{ textAlign: 'right' }}>Outstanding</th><th style={{ width: 120 }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : vendors.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>No vendors</td></tr>
              : vendors.map(v => (
                <tr key={v.id}>
                  <td><code style={{ fontSize: 12 }}>{v.vendor_code}</code></td>
                  <td style={{ fontWeight: 500 }}>{v.company_name}</td>
                  <td>{v.contact_person || '—'}</td>
                  <td>{v.phone || '—'}</td>
                  <td style={{ fontSize: 12 }}>{v.gstin || '—'}</td>
                  <td>{v.city || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(v.total_purchases || 0)}</td>
                  <td style={{ textAlign: 'right', color: (v.outstanding_amount || 0) > 0 ? 'var(--danger)' : '' }}>{formatCurrency(v.outstanding_amount || 0)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(v)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /></button>
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
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{editingId ? 'Edit Vendor' : 'New Vendor'}</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3">
                <div className="form-group"><label className="form-label">Company Name *</label><input className="form-input" value={form.company_name} onChange={e => updateField('company_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contact_person} onChange={e => updateField('contact_person', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => updateField('email', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">GSTIN</label><input className="form-input" value={form.gstin} onChange={e => updateField('gstin', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">PAN</label><input className="form-input" value={form.pan} onChange={e => updateField('pan', e.target.value)} /></div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => updateField('address', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => updateField('city', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">State</label><input className="form-input" value={form.state} onChange={e => updateField('state', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" value={form.pincode} onChange={e => updateField('pincode', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Payment Terms (days)</label><input type="number" className="form-input" value={form.payment_terms} onChange={e => updateField('payment_terms', e.target.value)} /></div>
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: '16px 0 8px', color: 'var(--primary)' }}>Bank Details</h4>
              <div className="form-grid-3">
                <div className="form-group"><label className="form-label">Bank Name</label><input className="form-input" value={form.bank_name} onChange={e => updateField('bank_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Account No</label><input className="form-input" value={form.bank_account} onChange={e => updateField('bank_account', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">IFSC</label><input className="form-input" value={form.bank_ifsc} onChange={e => updateField('bank_ifsc', e.target.value)} /></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Create'}</button></div>
          </div>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{detail.company_name}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 16 }}>
                <div className="stat-card"><div className="stat-label">Total Purchases</div><div className="stat-value">{formatCurrency(detail.total_purchases || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(detail.outstanding_amount || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Payment Terms</div><div className="stat-value">{detail.payment_terms || 30} days</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                <div><strong>Contact:</strong> {detail.contact_person}</div>
                <div><strong>Phone:</strong> {detail.phone}</div>
                <div><strong>Email:</strong> {detail.email}</div>
                <div><strong>GSTIN:</strong> {detail.gstin}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {detail.address}, {detail.city} {detail.state} {detail.pincode}</div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
