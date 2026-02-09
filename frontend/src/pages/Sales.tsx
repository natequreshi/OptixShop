import { useState, useEffect } from 'react';
import { Search, Eye, RotateCcw, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Sale {
  id: string; invoice_no: string; sale_date: string; customer_name: string;
  subtotal: number; discount_amount: number; tax_amount: number; total_amount: number;
  paid_amount: number; payment_method: string; status: string; cashier_name: string;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const res = await api.get<{ data: Sale[] }>(`/sales?${params}`);
      setSales(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, dateFrom, dateTo]);

  const viewDetail = async (sale: Sale) => {
    try { const data = await api.get<any>(`/sales/${sale.id}`); setDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const voidSale = async (id: string) => {
    if (!confirm('Void this sale? This cannot be undone.')) return;
    try { await api.post(`/sales/${id}/void`, {}); toast.success('Sale voided'); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const totalRevenue = sales.filter(s => s.status === 'completed').reduce((s, sale) => s + sale.total_amount, 0);
  const totalPaid = sales.filter(s => s.status === 'completed').reduce((s, sale) => s + sale.paid_amount, 0);

  const statusColors: Record<string, string> = { completed: 'badge-success', voided: 'badge-danger', returned: 'badge-warning' };

  return (
    <div>
      <div className="toolbar">
        <select className="form-input" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="completed">Completed</option><option value="voided">Voided</option><option value="returned">Returned</option>
        </select>
        <input type="date" className="form-input" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
        <input type="date" className="form-input" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
      </div>

      <div className="stat-cards" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card"><div className="stat-label">Total Sales</div><div className="stat-value">{sales.length}</div></div>
        <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value">{formatCurrency(totalRevenue)}</div></div>
        <div className="stat-card"><div className="stat-label">Collected</div><div className="stat-value">{formatCurrency(totalPaid)}</div></div>
        <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalRevenue - totalPaid)}</div></div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Payment</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th><th style={{ textAlign: 'right' }}>Tax</th>
              <th style={{ textAlign: 'right' }}>Total</th><th style={{ textAlign: 'right' }}>Paid</th>
              <th>Status</th><th style={{ width: 100 }}>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={10}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              : sales.length === 0 ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>No sales found</td></tr>
              : sales.map(s => (
                <tr key={s.id}>
                  <td><code style={{ fontSize: 12 }}>{s.invoice_no}</code></td>
                  <td>{formatDate(s.sale_date)}</td>
                  <td style={{ fontWeight: 500 }}>{s.customer_name || 'Walk-in'}</td>
                  <td><span className="badge badge-info">{s.payment_method}</span></td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(s.subtotal)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(s.tax_amount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(s.total_amount)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(s.paid_amount)}</td>
                  <td><span className={`badge ${statusColors[s.status] || 'badge-secondary'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(s)}><Eye size={14} /></button>
                      {s.status === 'completed' && <button className="btn btn-ghost btn-sm" onClick={() => voidSale(s.id)}><RotateCcw size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Invoice: {detail.invoice_no}</h3><button className="btn btn-ghost" onClick={() => setDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Date:</strong> {formatDate(detail.sale_date)}</div>
                <div><strong>Customer:</strong> {detail.customer_name || 'Walk-in'}</div>
                <div><strong>Payment:</strong> {detail.payment_method}</div>
                <div><strong>Status:</strong> <span className={`badge ${statusColors[detail.status]}`}>{detail.status}</span></div>
              </div>
              <table className="table">
                <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Discount</th><th>Tax</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>
                  {detail.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{item.discount_pct > 0 ? `${item.discount_pct}%` : '—'}</td>
                      <td>{item.tax_rate}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={5} style={{ textAlign: 'right' }}>Subtotal:</td><td style={{ textAlign: 'right' }}>{formatCurrency(detail.subtotal)}</td></tr>
                  {detail.discount_amount > 0 && <tr><td colSpan={5} style={{ textAlign: 'right', color: 'var(--success)' }}>Discount:</td><td style={{ textAlign: 'right', color: 'var(--success)' }}>-{formatCurrency(detail.discount_amount)}</td></tr>}
                  <tr><td colSpan={5} style={{ textAlign: 'right' }}>Tax:</td><td style={{ textAlign: 'right' }}>{formatCurrency(detail.tax_amount)}</td></tr>
                  <tr><td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td><td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>{formatCurrency(detail.total_amount)}</td></tr>
                  <tr><td colSpan={5} style={{ textAlign: 'right' }}>Paid:</td><td style={{ textAlign: 'right' }}>{formatCurrency(detail.paid_amount)}</td></tr>
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
