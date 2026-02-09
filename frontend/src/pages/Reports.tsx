import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, FileText, Download } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, today } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type ReportType = 'daily_sales' | 'sales_by_period' | 'top_products' | 'slow_moving' | 'gst_report' | 'customer_ageing' | 'vendor_summary';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Reports() {
  const [report, setReport] = useState<ReportType>('daily_sales');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());

  const loadReport = async () => {
    setLoading(true);
    try {
      let res: any;
      switch (report) {
        case 'daily_sales':
          res = await api.get<any>(`/reports/daily-sales?date=${dateFrom}`);
          setData(res);
          break;
        case 'sales_by_period':
          res = await api.get<any>(`/reports/sales-by-period?from=${dateFrom}&to=${dateTo}`);
          setData(res);
          break;
        case 'top_products':
          res = await api.get<any>(`/reports/top-products?from=${dateFrom}&to=${dateTo}&limit=20`);
          setData(res);
          break;
        case 'slow_moving':
          res = await api.get<any>('/reports/slow-moving-stock?days=30&limit=20');
          setData(res);
          break;
        case 'gst_report':
          res = await api.get<any>(`/reports/gst-report?from=${dateFrom}&to=${dateTo}`);
          setData(res);
          break;
        case 'customer_ageing':
          res = await api.get<any>('/reports/customer-ageing');
          setData(res);
          break;
        case 'vendor_summary':
          res = await api.get<any>(`/reports/vendor-summary?from=${dateFrom}&to=${dateTo}`);
          setData(res);
          break;
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadReport(); }, [report, dateFrom, dateTo]);

  const reportTabs: { key: ReportType; label: string; icon: any }[] = [
    { key: 'daily_sales', label: 'Daily Sales', icon: BarChart3 },
    { key: 'sales_by_period', label: 'Sales by Period', icon: TrendingUp },
    { key: 'top_products', label: 'Top Products', icon: Package },
    { key: 'slow_moving', label: 'Slow Moving', icon: Package },
    { key: 'gst_report', label: 'GST Report', icon: FileText },
    { key: 'customer_ageing', label: 'Customer Ageing', icon: Users },
    { key: 'vendor_summary', label: 'Vendor Summary', icon: FileText },
  ];

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {reportTabs.map(t => (
          <button key={t.key} className={`tab ${report === t.key ? 'active' : ''}`} onClick={() => setReport(t.key)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      {!['slow_moving', 'customer_ageing'].includes(report) && (
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <input type="date" className="form-input" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          {report !== 'daily_sales' && (
            <input type="date" className="form-input" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          )}
        </div>
      )}

      {loading ? <div className="loading-center"><div className="spinner"></div></div> : !data ? <div className="empty-state"><h3>No data</h3></div> : (
        <>
          {/* Daily Sales */}
          {report === 'daily_sales' && (
            <div>
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-label">Total Sales</div><div className="stat-value">{data.total_sales || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Revenue</div><div className="stat-value">{formatCurrency(data.total_revenue || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Tax Collected</div><div className="stat-value">{formatCurrency(data.total_tax || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Avg. Transaction</div><div className="stat-value">{formatCurrency(data.total_sales ? (data.total_revenue || 0) / data.total_sales : 0)}</div></div>
              </div>
              {data.payment_breakdown && (
                <div className="card">
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Payment Breakdown</h3></div>
                  <table className="table">
                    <thead><tr><th>Method</th><th style={{ textAlign: 'right' }}>Count</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                    <tbody>{data.payment_breakdown.map((p: any) => (
                      <tr key={p.method}><td style={{ textTransform: 'capitalize' }}>{p.method}</td><td style={{ textAlign: 'right' }}>{p.count}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.amount)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sales by Period */}
          {report === 'sales_by_period' && Array.isArray(data) && (
            <div>
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <table className="table">
                  <thead><tr><th>Date</th><th style={{ textAlign: 'right' }}>Sales</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Tax</th></tr></thead>
                  <tbody>{data.map((row: any) => (
                    <tr key={row.date}><td>{formatDate(row.date)}</td><td style={{ textAlign: 'right' }}>{row.count}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.revenue)}</td><td style={{ textAlign: 'right' }}>{formatCurrency(row.tax)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Products */}
          {report === 'top_products' && Array.isArray(data) && (
            <div className="card">
              <table className="table">
                <thead><tr><th>#</th><th>Product</th><th style={{ textAlign: 'right' }}>Qty Sold</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Cost</th><th style={{ textAlign: 'right' }}>Margin</th><th style={{ textAlign: 'right' }}>Margin %</th></tr></thead>
                <tbody>{data.map((p: any, i: number) => (
                  <tr key={p.product_id || i}>
                    <td>{i + 1}</td><td style={{ fontWeight: 500 }}>{p.product_name}</td>
                    <td style={{ textAlign: 'right' }}>{p.total_qty}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.total_revenue)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(p.total_cost || 0)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency((p.total_revenue || 0) - (p.total_cost || 0))}</td>
                    <td style={{ textAlign: 'right' }}>{p.total_revenue ? (((p.total_revenue - (p.total_cost || 0)) / p.total_revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* Slow Moving */}
          {report === 'slow_moving' && Array.isArray(data) && (
            <div className="card">
              <table className="table">
                <thead><tr><th>SKU</th><th>Product</th><th style={{ textAlign: 'right' }}>Stock</th><th style={{ textAlign: 'right' }}>Last Sold</th><th style={{ textAlign: 'right' }}>Days Idle</th><th style={{ textAlign: 'right' }}>Stock Value</th></tr></thead>
                <tbody>{data.map((p: any) => (
                  <tr key={p.product_id || p.sku}>
                    <td><code>{p.sku}</code></td><td style={{ fontWeight: 500 }}>{p.product_name}</td>
                    <td style={{ textAlign: 'right' }}>{p.stock_quantity}</td>
                    <td style={{ textAlign: 'right' }}>{p.last_sold ? formatDate(p.last_sold) : 'Never'}</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{p.days_idle || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(p.stock_value || 0)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* GST Report */}
          {report === 'gst_report' && (
            <div>
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-label">Output GST (Sales)</div><div className="stat-value">{formatCurrency(data.output_tax || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Input GST (Purchases)</div><div className="stat-value">{formatCurrency(data.input_tax || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Net GST Payable</div><div className="stat-value" style={{ color: (data.net_tax || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatCurrency(data.net_tax || 0)}</div></div>
              </div>
              {data.details && (
                <div className="card">
                  <table className="table">
                    <thead><tr><th>Tax Rate</th><th style={{ textAlign: 'right' }}>Taxable Value</th><th style={{ textAlign: 'right' }}>CGST</th><th style={{ textAlign: 'right' }}>SGST</th><th style={{ textAlign: 'right' }}>IGST</th><th style={{ textAlign: 'right' }}>Total Tax</th></tr></thead>
                    <tbody>{data.details.map((row: any) => (
                      <tr key={row.rate}><td>{row.rate}%</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(row.taxable)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(row.cgst)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(row.sgst)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(row.igst)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Customer Ageing */}
          {report === 'customer_ageing' && Array.isArray(data) && (
            <div className="card">
              <table className="table">
                <thead><tr><th>Customer</th><th style={{ textAlign: 'right' }}>Current</th><th style={{ textAlign: 'right' }}>1-30 Days</th><th style={{ textAlign: 'right' }}>31-60 Days</th><th style={{ textAlign: 'right' }}>61-90 Days</th><th style={{ textAlign: 'right' }}>90+ Days</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                <tbody>{data.map((c: any) => (
                  <tr key={c.customer_id}>
                    <td style={{ fontWeight: 500 }}>{c.customer_name}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(c.current || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(c.days_30 || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(c.days_60 || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(c.days_90 || 0)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(c.over_90 || 0)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(c.total || 0)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* Vendor Summary */}
          {report === 'vendor_summary' && Array.isArray(data) && (
            <div className="card">
              <table className="table">
                <thead><tr><th>Vendor</th><th style={{ textAlign: 'right' }}>Orders</th><th style={{ textAlign: 'right' }}>Total Purchases</th><th style={{ textAlign: 'right' }}>Paid</th><th style={{ textAlign: 'right' }}>Outstanding</th></tr></thead>
                <tbody>{data.map((v: any) => (
                  <tr key={v.vendor_id}>
                    <td style={{ fontWeight: 500 }}>{v.company_name}</td>
                    <td style={{ textAlign: 'right' }}>{v.order_count}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(v.total_purchases)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(v.paid_amount || 0)}</td>
                    <td style={{ textAlign: 'right', color: (v.outstanding || 0) > 0 ? 'var(--danger)' : '' }}>{formatCurrency(v.outstanding || 0)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
