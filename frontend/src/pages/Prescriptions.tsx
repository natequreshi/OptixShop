import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Prescription {
  id: string; prescription_no: string; customer_id: string; customer_name: string;
  prescription_date: string; expiry_date: string; doctor_name: string; clinic_name: string;
  od_sphere: string; od_cylinder: string; od_axis: string; od_add: string; od_pd: string;
  os_sphere: string; os_cylinder: string; os_axis: string; os_add: string; os_pd: string;
  notes: string;
}

const emptyForm = {
  customer_id: '', prescription_date: new Date().toISOString().split('T')[0], expiry_date: '',
  doctor_name: '', clinic_name: '',
  od_sphere: '', od_cylinder: '', od_axis: '', od_add: '', od_pd: '', od_prism: '', od_va: '',
  os_sphere: '', os_cylinder: '', os_axis: '', os_add: '', os_pd: '', os_prism: '', os_va: '',
  notes: '',
};

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (searchTerm) params.set('search', searchTerm);
      const res = await api.get<{ data: Prescription[] }>(`/prescriptions?${params}`);
      setPrescriptions(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [searchTerm]);

  const searchCustomers = async (term: string) => {
    setCustomerSearch(term);
    if (term.length >= 2) {
      const res = await api.get<{ data: any[] }>(`/customers?search=${term}&limit=5`);
      setCustomers(res.data);
    }
  };

  const openNew = () => { setForm({ ...emptyForm }); setEditingId(null); setShowModal(true); };
  const openEdit = async (p: Prescription) => {
    try {
      const data = await api.get<any>(`/prescriptions/${p.id}`);
      setForm({
        customer_id: data.customer_id, prescription_date: data.prescription_date, expiry_date: data.expiry_date || '',
        doctor_name: data.doctor_name || '', clinic_name: data.clinic_name || '',
        od_sphere: data.od_sphere || '', od_cylinder: data.od_cylinder || '', od_axis: data.od_axis || '',
        od_add: data.od_add || '', od_pd: data.od_pd || '', od_prism: data.od_prism || '', od_va: data.od_va || '',
        os_sphere: data.os_sphere || '', os_cylinder: data.os_cylinder || '', os_axis: data.os_axis || '',
        os_add: data.os_add || '', os_pd: data.os_pd || '', os_prism: data.os_prism || '', os_va: data.os_va || '',
        notes: data.notes || '',
      });
      setEditingId(p.id);
      setShowModal(true);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/prescriptions/${editingId}`, form);
        toast.success('Updated');
      } else {
        await api.post('/prescriptions', form);
        toast.success('Created');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) { toast.error(err.message || 'Save failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prescription?')) return;
    try { await api.delete(`/prescriptions/${id}`); toast.success('Deleted'); loadData(); }
    catch (err: any) { toast.error(err.message); }
  };

  const updateField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    const d = new Date(date);
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    return d <= in30;
  };

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input className="form-input" placeholder="Search by patient, doctor..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Prescription</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rx No</th><th>Patient</th><th>Date</th><th>Doctor</th>
                <th>OD (Sph/Cyl/Axis)</th><th>OS (Sph/Cyl/Axis)</th>
                <th>Add</th><th>Expiry</th><th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              ) : prescriptions.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>No prescriptions found</td></tr>
              ) : prescriptions.map(p => (
                <tr key={p.id}>
                  <td><code style={{ fontSize: 12 }}>{p.prescription_no}</code></td>
                  <td style={{ fontWeight: 500 }}>{p.customer_name}</td>
                  <td>{formatDate(p.prescription_date)}</td>
                  <td>{p.doctor_name || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.od_sphere || '—'} / {p.od_cylinder || '—'} × {p.od_axis || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.os_sphere || '—'} / {p.os_cylinder || '—'} × {p.os_axis || '—'}</td>
                  <td>{p.od_add || '—'}</td>
                  <td>
                    {p.expiry_date ? (
                      <span className={isExpiringSoon(p.expiry_date) ? 'text-danger' : ''}>
                        {isExpiringSoon(p.expiry_date) && <AlertCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                        {formatDate(p.expiry_date)}
                      </span>
                    ) : '—'}
                  </td>
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
              <h3 className="modal-title">{editingId ? 'Edit Prescription' : 'New Prescription'}</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Patient & Doctor */}
              <div className="form-grid-3" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  {form.customer_id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input className="form-input" value={form.customer_id} disabled style={{ flex: 1 }} />
                      <button className="btn btn-ghost btn-sm" onClick={() => updateField('customer_id', '')}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input className="form-input" placeholder="Search customer..." value={customerSearch}
                        onChange={e => searchCustomers(e.target.value)} />
                      {customers.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 10 }}>
                          {customers.map(c => (
                            <div key={c.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}
                              onClick={() => { updateField('customer_id', c.id); setCustomers([]); setCustomerSearch(c.first_name + ' ' + c.last_name); }}>
                              {c.first_name} {c.last_name} — {c.phone}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group"><label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.prescription_date} onChange={e => updateField('prescription_date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Expiry Date</label>
                  <input type="date" className="form-input" value={form.expiry_date} onChange={e => updateField('expiry_date', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Doctor</label>
                  <input className="form-input" value={form.doctor_name} onChange={e => updateField('doctor_name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Clinic</label>
                  <input className="form-input" value={form.clinic_name} onChange={e => updateField('clinic_name', e.target.value)} /></div>
              </div>

              {/* Rx Grid */}
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--primary)' }}>Prescription Details</h4>
              <div className="rx-grid">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr><th>Eye</th><th>Sphere</th><th>Cylinder</th><th>Axis</th><th>Add</th><th>PD</th><th>Prism</th><th>VA</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>OD (Right)</td>
                      <td><input className="form-input" style={{ width: 70, padding: '4px 6px', fontSize: 12 }} value={form.od_sphere} onChange={e => updateField('od_sphere', e.target.value)} placeholder="±0.00" /></td>
                      <td><input className="form-input" style={{ width: 70, padding: '4px 6px', fontSize: 12 }} value={form.od_cylinder} onChange={e => updateField('od_cylinder', e.target.value)} placeholder="±0.00" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.od_axis} onChange={e => updateField('od_axis', e.target.value)} placeholder="0-180" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.od_add} onChange={e => updateField('od_add', e.target.value)} placeholder="+0.00" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.od_pd} onChange={e => updateField('od_pd', e.target.value)} /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.od_prism} onChange={e => updateField('od_prism', e.target.value)} /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.od_va} onChange={e => updateField('od_va', e.target.value)} placeholder="6/6" /></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>OS (Left)</td>
                      <td><input className="form-input" style={{ width: 70, padding: '4px 6px', fontSize: 12 }} value={form.os_sphere} onChange={e => updateField('os_sphere', e.target.value)} placeholder="±0.00" /></td>
                      <td><input className="form-input" style={{ width: 70, padding: '4px 6px', fontSize: 12 }} value={form.os_cylinder} onChange={e => updateField('os_cylinder', e.target.value)} placeholder="±0.00" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.os_axis} onChange={e => updateField('os_axis', e.target.value)} placeholder="0-180" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.os_add} onChange={e => updateField('os_add', e.target.value)} placeholder="+0.00" /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.os_pd} onChange={e => updateField('os_pd', e.target.value)} /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.os_prism} onChange={e => updateField('os_prism', e.target.value)} /></td>
                      <td><input className="form-input" style={{ width: 60, padding: '4px 6px', fontSize: 12 }} value={form.os_va} onChange={e => updateField('os_va', e.target.value)} placeholder="6/6" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={e => updateField('notes', e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Save Prescription'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
