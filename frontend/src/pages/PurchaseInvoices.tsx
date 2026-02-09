import { useState, useEffect } from 'react';
import { Plus, Eye, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, today } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Invoice {
  id: string; invoice_number: string; vendor_name: string; po_number: string; grn_number: string;
  invoice_date: string; due_date: string; subtotal: number; tax_amount: number;
  total_amount: number; paid_amount: number; status: string;
}

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState('');
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [lines, setLines] = useState<any[]>([{ product_id: '', description: '', quantity: '1', unit_price: '0', tax_rate: '18' }]);
  const [products, setProducts] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ data: Invoice[] }>(`/purchase-invoices?${params}`);
      setInvoices(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>('/vendors?limit=100'),
      api.get<{ data: any[] }>('/products?limit=200'),
    ]).then(([v, p]) => { setVendors(v.data); setProducts(p.data); }).catch(console.error);
  }, []);

  const addLine = () => setLines(l => [...l, { product_id: '', description: '', quantity: '1', unit_price: '0', tax_rate: '18' }]);
  const removeLine = (idx: number) => setLines(l => l.filter((_, i) => i !== idx));
  const updateLine = (idx: number, field: string, value: string) => {
    setLines(l => l.map((line, i) => {
      if (i !== idx) return line;
      const updated = { ...line, [field]: value };
      if (field === 'product_id') {
        const prod = products.find((p: any) => p.id === value);
        if (prod) { updated.description = prod.name; updated.unit_price = String(prod.cost_price); updated.tax_rate = String(prod.tax_rate); }
      }
      return updated;
    }));
  };

  const lineTotal = (l: any) => parseFloat(l.quantity || '0') * parseFloat(l.unit_price || '0');
  const subtotal = lines.reduce((s: number, l: any) => s + lineTotal(l), 0);
  const taxTotal = lines.reduce((s: number, l: any) => s + lineTotal(l) * parseFloat(l.tax_rate || '0') / 100, 0);

  const handleCreate = async () => {
    try {
      await api.post('/purchase-invoices', {
        vendor_id: vendorId, invoice_date: invoiceDate, due_date: dueDate || null,
        vendor_invoice_no: vendorInvoiceNo || null,
        items: lines.map(l => ({
          product_id: l.product_id || null,
          description: l.description,
          quantity: parseInt(l.quantity),
          unit_price: parseFloat(l.unit_price),
          tax_rate: parseFloat(l.tax_rate),
        })),
      });
      toast.success('Purchase invoice created');
      setShowModal(false); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewDetail = async (inv: Invoice) => {
    try { const data = await api.get<any>(`/purchase-invoices/${inv.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const statusColors: Record<string, string> = { pending: 'badge-warning', partial: 'badge-info', paid: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div>
      <div className="toolbar">
        <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setVendorId(''); setLines([{ product_id: '', description: '', quantity: '1', unit_price: '0', tax_rate: '18' }]); setShowModal(true); }}>
          <Plus size={16} /> New Purchase Invoice
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Invoice #</th><th>Vendor</th><th>Date</th><th>Due</th>
              <th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Paid</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th><th style={{ width: 60 }}>View</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : invoices.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>No invoices</td></tr>
              : invoices.map(inv => (
                <tr key={inv.id}>
                  <td><code style={{ fontSize: 12 }}>{inv.invoice_number}</code></td>
                  <td style={{ fontWeight: 500 }}>{inv.vendor_name}</td>
                  <td>{formatDate(inv.invoice_date)}</td>
                  <td>{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.total_amount)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(inv.paid_amount || 0)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(inv.total_amount - (inv.paid_amount || 0))}</td>
                  <td><span className={`badge ${statusColors[inv.status] || 'badge-secondary'}`}>{inv.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => viewDetail(inv)}><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Purchase Invoice</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3" style={{ marginBottom: 20 }}>
                <div className="form-group"><label className="form-label">Vendor *</label>
                  <select className="form-input" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Invoice Date</label>
                  <input type="date" className="form-input" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Vendor Invoice No</label>
                  <input className="form-input" value={vendorInvoiceNo} onChange={e => setVendorInvoiceNo(e.target.value)} /></div>
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Items</h4>
              <table className="table" style={{ marginBottom: 12 }}>
                <thead><tr><th>Product</th><th>Description</th><th style={{ width: 70 }}>Qty</th><th style={{ width: 90 }}>Price</th><th style={{ width: 70 }}>Tax%</th><th style={{ width: 100, textAlign: 'right' }}>Total</th><th style={{ width: 40 }}></th></tr></thead>
                <tbody>
                  {lines.map((line: any, idx: number) => (
                    <tr key={idx}>
                      <td><select className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.product_id} onChange={e => updateLine(idx, 'product_id', e.target.value)}>
                        <option value="">Select</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select></td>
                      <td><input className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.description} onChange={e => updateLine(idx, 'description', e.target.value)} /></td>
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
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create Invoice</button></div>
          </div>
        </div>
      )}

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Invoice: {detail.invoice_number}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Vendor:</strong> {detail.vendor_name}</div>
                <div><strong>Date:</strong> {formatDate(detail.invoice_date)}</div>
                <div><strong>Status:</strong> <span className={`badge ${statusColors[detail.status]}`}>{detail.status}</span></div>
              </div>
              <table className="table">
                <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Tax</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {detail.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.description || item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{item.tax_rate}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={4} style={{ textAlign: 'right' }}>Subtotal:</td><td style={{ textAlign: 'right' }}>{formatCurrency(detail.subtotal)}</td></tr>
                  <tr><td colSpan={4} style={{ textAlign: 'right' }}>Tax:</td><td style={{ textAlign: 'right' }}>{formatCurrency(detail.tax_amount)}</td></tr>
                  <tr><td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td><td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>{formatCurrency(detail.total_amount)}</td></tr>
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
