import { useState, useEffect } from 'react';
import { DollarSign, Clock, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Session {
  id: string; user_name: string; open_time: string; close_time: string;
  opening_cash: number; closing_cash: number; total_sales: number; total_cash: number;
  total_card: number; total_upi: number; total_credit: number; sale_count: number;
  difference: number; status: string;
}

export default function Register() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sessRes, curRes] = await Promise.all([
        api.get<{ data: Session[] }>('/register/sessions?limit=20'),
        api.get<Session | null>('/register/current').catch(() => null),
      ]);
      setSessions(sessRes.data);
      setCurrentSession(curRes);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openRegister = async () => {
    try {
      await api.post('/register/open', { opening_cash: parseFloat(openingCash) || 0 });
      toast.success('Register opened');
      setShowOpen(false);
      setOpeningCash('');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const closeRegister = async () => {
    try {
      await api.post('/register/close', { closing_cash: parseFloat(closingCash) || 0 });
      toast.success('Register closed');
      setShowClose(false);
      setClosingCash('');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      {/* Current Session */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Current Register Session</h3>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? <div className="loading-center"><div className="spinner"></div></div>
          : currentSession ? (
            <>
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-label">Opening Cash</div><div className="stat-value">{formatCurrency(currentSession.opening_cash)}</div></div>
                <div className="stat-card"><div className="stat-label">Sales Count</div><div className="stat-value">{currentSession.sale_count || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Total Sales</div><div className="stat-value">{formatCurrency(currentSession.total_sales || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Cash Sales</div><div className="stat-value">{formatCurrency(currentSession.total_cash || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Card/UPI</div><div className="stat-value">{formatCurrency((currentSession.total_card || 0) + (currentSession.total_upi || 0))}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, marginBottom: 16 }}>
                <div><strong>Opened:</strong> {formatDateTime(currentSession.open_time)}</div>
                <div><strong>Cashier:</strong> {currentSession.user_name}</div>
                <div><span className="badge badge-success">Active</span></div>
              </div>
              <button className="btn btn-danger" onClick={() => setShowClose(true)}>
                <Clock size={16} /> Close Register
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Register is Closed</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Open the register to start accepting sales</p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowOpen(true)}>
                <DollarSign size={16} /> Open Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Session History</h3></div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Opened</th><th>Closed</th><th>Cashier</th><th style={{ textAlign: 'right' }}>Opening</th>
              <th style={{ textAlign: 'right' }}>Sales</th><th style={{ textAlign: 'right' }}>Cash</th>
              <th style={{ textAlign: 'right' }}>Card/UPI</th><th style={{ textAlign: 'right' }}>Closing</th>
              <th style={{ textAlign: 'right' }}>Difference</th><th>Status</th></tr></thead>
            <tbody>
              {sessions.length === 0 ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>No sessions</td></tr>
              : sessions.map(s => (
                <tr key={s.id}>
                  <td>{formatDateTime(s.open_time)}</td>
                  <td>{s.close_time ? formatDateTime(s.close_time) : '—'}</td>
                  <td>{s.user_name}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(s.opening_cash)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(s.total_sales || 0)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(s.total_cash || 0)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency((s.total_card || 0) + (s.total_upi || 0))}</td>
                  <td style={{ textAlign: 'right' }}>{s.closing_cash != null ? formatCurrency(s.closing_cash) : '—'}</td>
                  <td style={{ textAlign: 'right', color: (s.difference || 0) !== 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {s.difference != null ? formatCurrency(s.difference) : '—'}
                  </td>
                  <td><span className={`badge ${s.status === 'open' ? 'badge-success' : 'badge-secondary'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Modal */}
      {showOpen && (
        <div className="modal-overlay" onClick={() => setShowOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Open Register</h3></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Opening Cash Amount</label>
                <input type="number" className="form-input form-input-lg" value={openingCash} onChange={e => setOpeningCash(e.target.value)}
                  placeholder="Enter cash in drawer..." autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={openRegister}>Open Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showClose && (
        <div className="modal-overlay" onClick={() => setShowClose(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Close Register</h3></div>
            <div className="modal-body">
              {currentSession && (
                <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <div>Expected Cash: <strong>{formatCurrency((currentSession.opening_cash || 0) + (currentSession.total_cash || 0))}</strong></div>
                  <div>Total Sales: <strong>{formatCurrency(currentSession.total_sales || 0)}</strong></div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Actual Closing Cash</label>
                <input type="number" className="form-input form-input-lg" value={closingCash} onChange={e => setClosingCash(e.target.value)}
                  placeholder="Count and enter cash..." autoFocus />
              </div>
              {closingCash && currentSession && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Difference: <strong style={{ color: Math.abs(parseFloat(closingCash) - (currentSession.opening_cash + (currentSession.total_cash || 0))) > 0.01 ? 'var(--danger)' : 'var(--success)' }}>
                    {formatCurrency(parseFloat(closingCash) - (currentSession.opening_cash + (currentSession.total_cash || 0)))}
                  </strong>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowClose(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={closeRegister}>Close Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
