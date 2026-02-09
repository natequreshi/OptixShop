import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, FlaskConical } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers';

interface DashboardData {
  today: { sales: number; orders: number };
  month: { sales: number; orders: number };
  lastWeekSales: number;
  customers: { total: number; new: number };
  lowStockCount: number;
  pendingLabOrders: number;
  receivables: number;
  payables: number;
  salesTrend: { month: string; total: number; count: number }[];
  topProducts: { name: string; sku: string; qty_sold: number; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
  recentSales: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardData>('/dashboard/stats')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!data) return <div className="empty-state"><h3>Unable to load dashboard</h3></div>;

  return (
    <div className="fade-in">
      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Today's Sales</h3>
            <div className="stat-value">{formatCurrency(data.today.sales)}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> {data.today.orders} orders
            </div>
          </div>
          <div className="stat-icon blue"><DollarSign size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Monthly Revenue</h3>
            <div className="stat-value">{formatCurrency(data.month.sales)}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> {data.month.orders} orders
            </div>
          </div>
          <div className="stat-icon green"><TrendingUp size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Customers</h3>
            <div className="stat-value">{formatNumber(data.customers.total)}</div>
            <div className="stat-change positive">
              <TrendingUp size={12} /> +{data.customers.new} new
            </div>
          </div>
          <div className="stat-icon purple"><Users size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Low Stock Alerts</h3>
            <div className="stat-value">{data.lowStockCount}</div>
            {data.lowStockCount > 0 && (
              <div className="stat-change negative">
                <AlertTriangle size={12} /> Needs attention
              </div>
            )}
          </div>
          <div className="stat-icon orange"><Package size={22} /></div>
        </div>
      </div>

      {/* Second row of stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/lab-orders')}>
          <div className="stat-info">
            <h3>Pending Lab Orders</h3>
            <div className="stat-value">{data.pendingLabOrders}</div>
          </div>
          <div className="stat-icon blue"><FlaskConical size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Receivables</h3>
            <div className="stat-value" style={{ color: data.receivables > 0 ? 'var(--warning)' : undefined }}>{formatCurrency(data.receivables)}</div>
          </div>
          <div className="stat-icon orange"><TrendingDown size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Payables</h3>
            <div className="stat-value" style={{ color: data.payables > 0 ? 'var(--danger)' : undefined }}>{formatCurrency(data.payables)}</div>
          </div>
          <div className="stat-icon red"><TrendingUp size={22} /></div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Selling Products</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Qty Sold</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-muted" style={{ padding: 30 }}>No sales data yet</td></tr>
                ) : data.topProducts.slice(0, 8).map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div className="text-xs text-muted">{p.sku}</div>
                    </td>
                    <td className="text-right">{p.qty_sold}</td>
                    <td className="text-right font-bold">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales by Category</h3>
          </div>
          <div className="card-body">
            {data.salesByCategory.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <p>No sales data yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.salesByCategory.map((c, i) => {
                  const maxRevenue = Math.max(...data.salesByCategory.map(x => x.revenue));
                  const pct = maxRevenue > 0 ? (c.revenue / maxRevenue) * 100 : 0;
                  const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--danger)', '#8B5CF6', '#EC4899'];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{c.category}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(c.revenue)}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 3, transition: 'width 0.6s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Sales</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sales')}>View All <ArrowRight size={14} /></button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSales.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 30 }}>No recent sales</td></tr>
              ) : data.recentSales.slice(0, 8).map((s: any) => (
                <tr key={s.id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.invoice_no}</span></td>
                  <td>{s.customer_name || 'Walk-in'}</td>
                  <td className="text-muted">{formatDate(s.sale_date)}</td>
                  <td><span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'credit' ? 'badge-warning' : 'badge-secondary'}`}>{s.status}</span></td>
                  <td className="text-right font-bold">{formatCurrency(s.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
