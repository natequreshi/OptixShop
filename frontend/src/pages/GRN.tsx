import { useState, useEffect } from 'react';
import { Plus, Search, Eye, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, today } from '../utils/helpers';
import toast from 'react-hot-toast';

interface GRNRecord {
  id: string; grn_number: string; po_number: string; vendor_name: string;
  received_date: string; status: string; notes: string;
}

interface PO { id: string; po_number: string; vendor_name: string; items: any[]; }

export default function GRN() {
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [receivedDate, setReceivedDate] = useState(today());
  const [lines, setLines] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: GRNRecord[] }>('/grn?limit=100');
      setGrns(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = async () => {
    try {
      const res = await api.get<{ data: PO[] }>('/purchase-orders?status=sent&limit=50');
      const partial = await api.get<{ data: PO[] }>('/purchase-orders?status=partial&limit=50');
      setPurchaseOrders([...res.data, ...partial.data]);
      setSelectedPO(null);
      setLines([]);
      setNotes('');
      setShowModal(true);
    } catch (err: any) { toast.error(err.message); }
  };

  const selectPO = async (poId: string) => {
    try {
      const po = await api.get<PO>(`/purchase-orders/${poId}`);
      setSelectedPO(po);
      setLines(po.items.map((item: any) => ({
        po_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        ordered_qty: item.quantity,
        already_received: item.received_qty || 0,
        received_qty: String(item.quantity - (item.received_qty || 0)),
        accepted_qty: String(item.quantity - (item.received_qty || 0)),
        rejected_qty: '0',
        unit_cost: item.unit_price,
      })));
    } catch (err: any) { toast.error(err.message); }
  };

  const updateLine = (idx: number, field: string, value: string) => {
    setLines(l => l.map((line, i) => i === idx ? { ...line, [field]: value } : line));
  };

  const handleCreate = async () => {
    if (!selectedPO) return;
    try {
      await api.post('/grn', {
        po_id: selectedPO.id,
        received_date: receivedDate,
        notes,
        items: lines.map(l => ({
          po_item_id: l.po_item_id,
          product_id: l.product_id,
          received_qty: parseInt(l.received_qty),
          accepted_qty: parseInt(l.accepted_qty),
          rejected_qty: parseInt(l.rejected_qty),
          unit_cost: l.unit_cost,
        })),
      });
      toast.success('GRN created & inventory updated');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewDetail = async (grn: GRNRecord) => {
    try { const data = await api.get<any>(`/grn/${grn.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="toolbar">
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Goods Receipt Notes</h3>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New GRN</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>GRN #</th><th>PO #</th><th>Vendor</th><th>Date</th><th>Status</th><th>Notes</th><th style={{ width: 80 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : grns.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No GRN records</td></tr>
              : grns.map(g => (
                <tr key={g.id}>
                  <td><code style={{ fontSize: 12 }}>{g.grn_number}</code></td>
                  <td>{g.po_number}</td>
                  <td style={{ fontWeight: 500 }}>{g.vendor_name}</td>
                  <td>{formatDate(g.received_date)}</td>
                  <td><span className={`badge ${g.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{g.status}</span></td>
                  <td>{g.notes || '—'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => viewDetail(g)}><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create GRN */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Goods Receipt Note</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3" style={{ marginBottom: 20 }}>
                <div className="form-group"><label className="form-label">Purchase Order *</label>
                  <select className="form-input" value={selectedPO?.id || ''} onChange={e => selectPO(e.target.value)}>
                    <option value="">Select PO</option>
                    {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.po_number} — {po.vendor_name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Received Date</label>
                  <input type="date" className="form-input" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Notes</label>
                  <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} /></div>
              </div>

              {selectedPO && lines.length > 0 && (
                <>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Items to Receive</h4>
                  <table className="table">
                    <thead><tr><th>Product</th><th>Ordered</th><th>Already Recv'd</th><th style={{ width: 90 }}>Received</th><th style={{ width: 90 }}>Accepted</th><th style={{ width: 90 }}>Rejected</th><th style={{ width: 90 }}>Unit Cost</th></tr></thead>
                    <tbody>
                      {lines.map((line, idx) => (
                        <tr key={idx}>
                          <td>{line.product_name}</td>
                          <td>{line.ordered_qty}</td>
                          <td>{line.already_received}</td>
                          <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.received_qty} onChange={e => updateLine(idx, 'received_qty', e.target.value)} /></td>
                          <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.accepted_qty} onChange={e => updateLine(idx, 'accepted_qty', e.target.value)} /></td>
                          <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.rejected_qty} onChange={e => updateLine(idx, 'rejected_qty', e.target.value)} /></td>
                          <td>{formatCurrency(line.unit_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={!selectedPO}>Create GRN</button></div>
          </div>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">GRN: {detail.grn_number}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
                <div><strong>PO:</strong> {detail.po_number}</div>
                <div><strong>Vendor:</strong> {detail.vendor_name}</div>
                <div><strong>Date:</strong> {formatDate(detail.received_date)}</div>
              </div>
              <table className="table">
                <thead><tr><th>Product</th><th>Received</th><th>Accepted</th><th>Rejected</th><th>Unit Cost</th></tr></thead>
                <tbody>
                  {detail.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.received_qty}</td><td>{item.accepted_qty}</td><td>{item.rejected_qty}</td>
                      <td>{formatCurrency(item.unit_cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
