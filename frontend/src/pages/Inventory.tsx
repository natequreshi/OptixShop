import { useState, useEffect } from 'react';
import { Search, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Package, Filter } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string; product_id: string; product_name: string; sku: string; product_type: string;
  stock_quantity: number; avg_cost: number; reorder_level: number;
  brand_name: string; category_name: string;
}

interface Transaction {
  id: string; type: string; quantity: number; unit_cost: number; reference: string;
  notes: string; created_at: string;
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAdjust, setShowAdjust] = useState<InventoryItem | null>(null);
  const [showHistory, setShowHistory] = useState<{ item: InventoryItem; transactions: Transaction[] } | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (searchTerm) params.set('search', searchTerm);
      if (lowStockOnly) params.set('low_stock', 'true');
      const res = await api.get<{ data: InventoryItem[] }>(`/inventory?${params}`);
      setItems(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadInventory(); }, [searchTerm, lowStockOnly]);

  const handleAdjust = async () => {
    if (!showAdjust || !adjustQty) return;
    try {
      await api.post('/inventory/adjust', {
        product_id: showAdjust.product_id,
        type: adjustType,
        quantity: parseInt(adjustQty),
        reason: adjustReason,
      });
      toast.success('Stock adjusted');
      setShowAdjust(null);
      setAdjustQty('');
      setAdjustReason('');
      loadInventory();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewHistory = async (item: InventoryItem) => {
    try {
      const res = await api.get<{ data: Transaction[] }>(`/inventory/${item.product_id}/transactions`);
      setShowHistory({ item, transactions: res.data });
    } catch (err: any) { toast.error(err.message); }
  };

  const lowStockCount = items.filter(i => i.stock_quantity <= i.reorder_level).length;

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input className="form-input" placeholder="Search inventory..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <button className={`btn ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setLowStockOnly(!lowStockOnly)}>
          <AlertTriangle size={16} /> Low Stock {lowStockCount > 0 && `(${lowStockCount})`}
        </button>
      </div>

      {/* Stats */}
      <div className="stat-cards" style={{ marginBottom: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card"><div className="stat-label">Total Items</div><div className="stat-value">{items.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Stock Value</div><div className="stat-value">{formatCurrency(items.reduce((s, i) => s + i.stock_quantity * i.avg_cost, 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Low Stock Items</div><div className="stat-value" style={{ color: 'var(--danger)' }}>{lowStockCount}</div></div>
        <div className="stat-card"><div className="stat-label">Out of Stock</div><div className="stat-value" style={{ color: 'var(--danger)' }}>{items.filter(i => i.stock_quantity === 0).length}</div></div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th><th>Product</th><th>Type</th><th>Brand</th>
                <th style={{ textAlign: 'right' }}>Stock</th><th style={{ textAlign: 'right' }}>Reorder Level</th>
                <th style={{ textAlign: 'right' }}>Avg Cost</th><th style={{ textAlign: 'right' }}>Stock Value</th>
                <th>Status</th><th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}><div className="loading-center"><div className="spinner"></div></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>No inventory items found</td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td><code style={{ fontSize: 12 }}>{item.sku}</code></td>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td><span className="badge badge-info">{item.product_type}</span></td>
                  <td>{item.brand_name || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span className={item.stock_quantity <= item.reorder_level ? 'text-danger' : ''}>
                      {item.stock_quantity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.reorder_level}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.avg_cost)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.stock_quantity * item.avg_cost)}</td>
                  <td>
                    {item.stock_quantity === 0
                      ? <span className="badge badge-danger">Out of Stock</span>
                      : item.stock_quantity <= item.reorder_level
                        ? <span className="badge badge-warning">Low Stock</span>
                        : <span className="badge badge-success">In Stock</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setShowAdjust(item); setAdjustType('add'); }}>
                        Adjust
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewHistory(item)}>
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjust && (
        <div className="modal-overlay" onClick={() => setShowAdjust(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Adjust Stock — {showAdjust.product_name}</h3>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 13 }}>Current Stock: <strong>{showAdjust.stock_quantity}</strong></p>
              <div className="form-group">
                <label className="form-label">Adjustment Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`btn ${adjustType === 'add' ? 'btn-success' : 'btn-secondary'} flex-1`}
                    onClick={() => setAdjustType('add')}>
                    <ArrowUpCircle size={16} /> Add Stock
                  </button>
                  <button className={`btn ${adjustType === 'subtract' ? 'btn-danger' : 'btn-secondary'} flex-1`}
                    onClick={() => setAdjustType('subtract')}>
                    <ArrowDownCircle size={16} /> Remove Stock
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" className="form-input" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                  min="1" placeholder="Enter quantity" />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input className="form-input" value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Damaged, Miscounted, Sample" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdjust(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdjust}>Apply Adjustment</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Stock History — {showHistory.item.product_name}</h3>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Date</th><th>Type</th><th>Qty</th><th>Unit Cost</th><th>Reference</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {showHistory.transactions.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No transactions</td></tr>
                    ) : showHistory.transactions.map(t => (
                      <tr key={t.id}>
                        <td>{formatDateTime(t.created_at)}</td>
                        <td>
                          <span className={`badge ${t.type === 'purchase' || t.type === 'return_in' || t.type === 'adjustment_in' ? 'badge-success' : 'badge-danger'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{t.quantity}</td>
                        <td>{formatCurrency(t.unit_cost)}</td>
                        <td>{t.reference || '—'}</td>
                        <td>{t.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowHistory(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
