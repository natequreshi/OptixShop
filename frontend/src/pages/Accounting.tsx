import { useState, useEffect } from 'react';
import { Plus, Eye, BookOpen, FileText, BarChart3, TrendingUp, DollarSign, X } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, today } from '../utils/helpers';
import toast from 'react-hot-toast';

type TabType = 'chart' | 'journal' | 'ledger' | 'trial_balance' | 'pnl' | 'balance_sheet' | 'day_book';

interface Account { id: string; code: string; name: string; type: string; parent_id: string; is_active: number; balance: number; }
interface JournalEntry { id: string; entry_no: string; entry_date: string; description: string; reference: string; status: string; total_debit: number; total_credit: number; }

export default function Accounting() {
  const [tab, setTab] = useState<TabType>('chart');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [dayBook, setDayBook] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalDetail, setJournalDetail] = useState<any>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ code: '', name: '', type: 'asset', parent_id: '' });
  const [journalForm, setJournalForm] = useState({ entry_date: today(), description: '', reference: '', lines: [{ account_id: '', debit: '', credit: '', description: '' }, { account_id: '', debit: '', credit: '', description: '' }] });
  const [ledgerAccountId, setLedgerAccountId] = useState('');
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadTab = async () => {
    setLoading(true);
    try {
      if (tab === 'chart') {
        const res = await api.get<Account[]>('/accounting/accounts');
        setAccounts(res);
      } else if (tab === 'journal') {
        const res = await api.get<{ data: JournalEntry[] }>('/accounting/journal-entries?limit=100');
        setJournals(res.data);
      } else if (tab === 'trial_balance') {
        const params = new URLSearchParams();
        if (dateTo) params.set('as_of', dateTo);
        const res = await api.get<any>(`/accounting/trial-balance?${params}`);
        setTrialBalance(res);
      } else if (tab === 'pnl') {
        const params = new URLSearchParams();
        if (dateFrom) params.set('from', dateFrom);
        if (dateTo) params.set('to', dateTo);
        const res = await api.get<any>(`/accounting/profit-loss?${params}`);
        setPnl(res);
      } else if (tab === 'balance_sheet') {
        const params = new URLSearchParams();
        if (dateTo) params.set('as_of', dateTo);
        const res = await api.get<any>(`/accounting/balance-sheet?${params}`);
        setBalanceSheet(res);
      } else if (tab === 'day_book') {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date', dateFrom || today());
        const res = await api.get<any[]>(`/accounting/day-book?${params}`);
        setDayBook(res);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadTab(); }, [tab, dateFrom, dateTo]);
  useEffect(() => { api.get<Account[]>('/accounting/accounts').then(setAccounts).catch(console.error); }, []);

  const loadLedger = async () => {
    if (!ledgerAccountId) return;
    try {
      const params = new URLSearchParams({ account_id: ledgerAccountId });
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const res = await api.get<any[]>(`/accounting/ledger?${params}`);
      setLedgerData(res);
    } catch (err: any) { toast.error(err.message); }
  };

  useEffect(() => { if (tab === 'ledger') loadLedger(); }, [tab, ledgerAccountId, dateFrom, dateTo]);

  const createAccount = async () => {
    try {
      await api.post('/accounting/accounts', accountForm);
      toast.success('Account created');
      setShowAccountModal(false);
      loadTab();
    } catch (err: any) { toast.error(err.message); }
  };

  const createJournal = async () => {
    try {
      await api.post('/accounting/journal-entries', {
        ...journalForm,
        lines: journalForm.lines.filter(l => l.account_id).map(l => ({
          account_id: l.account_id, debit: parseFloat(l.debit || '0'), credit: parseFloat(l.credit || '0'), description: l.description,
        })),
      });
      toast.success('Journal entry created');
      setShowJournalModal(false);
      loadTab();
    } catch (err: any) { toast.error(err.message); }
  };

  const viewJournal = async (je: JournalEntry) => {
    try { const data = await api.get<any>(`/accounting/journal-entries/${je.id}`); setJournalDetail(data); }
    catch (err: any) { toast.error(err.message); }
  };

  const addJournalLine = () => setJournalForm(f => ({ ...f, lines: [...f.lines, { account_id: '', debit: '', credit: '', description: '' }] }));
  const updateJournalLine = (idx: number, field: string, value: string) => {
    setJournalForm(f => ({ ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, [field]: value } : l) }));
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'chart', label: 'Chart of Accounts', icon: BookOpen },
    { key: 'journal', label: 'Journal Entries', icon: FileText },
    { key: 'ledger', label: 'Ledger', icon: BookOpen },
    { key: 'trial_balance', label: 'Trial Balance', icon: BarChart3 },
    { key: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { key: 'balance_sheet', label: 'Balance Sheet', icon: DollarSign },
    { key: 'day_book', label: 'Day Book', icon: FileText },
  ];

  const groupedAccounts = {
    asset: accounts.filter(a => a.type === 'asset'),
    liability: accounts.filter(a => a.type === 'liability'),
    equity: accounts.filter(a => a.type === 'equity'),
    revenue: accounts.filter(a => a.type === 'revenue'),
    expense: accounts.filter(a => a.type === 'expense'),
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Date Filters for relevant tabs */}
      {['trial_balance', 'pnl', 'balance_sheet', 'ledger', 'day_book'].includes(tab) && (
        <div className="toolbar" style={{ marginBottom: 16 }}>
          {tab !== 'day_book' && <input type="date" className="form-input" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />}
          <input type="date" className="form-input" style={{ width: 150 }} value={dateTo || dateFrom} onChange={e => tab === 'day_book' ? setDateFrom(e.target.value) : setDateTo(e.target.value)} />
          {tab === 'ledger' && (
            <select className="form-input" style={{ width: 250 }} value={ledgerAccountId} onChange={e => setLedgerAccountId(e.target.value)}>
              <option value="">Select Account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
          )}
        </div>
      )}

      {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
        <>
          {/* Chart of Accounts */}
          {tab === 'chart' && (
            <div>
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={() => setShowAccountModal(true)}><Plus size={16} /> Add Account</button>
              </div>
              {Object.entries(groupedAccounts).map(([type, accs]) => (
                <div key={type} className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{type}s</h3></div>
                  <table className="table">
                    <thead><tr><th>Code</th><th>Name</th><th style={{ textAlign: 'right' }}>Balance</th><th>Status</th></tr></thead>
                    <tbody>
                      {accs.map(a => (
                        <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => { setLedgerAccountId(a.id); setTab('ledger'); }}>
                          <td><code>{a.code}</code></td>
                          <td style={{ fontWeight: 500 }}>{a.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(a.balance || 0)}</td>
                          <td><span className={`badge ${a.is_active ? 'badge-success' : 'badge-secondary'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Journal Entries */}
          {tab === 'journal' && (
            <div>
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={() => { setJournalForm({ entry_date: today(), description: '', reference: '', lines: [{ account_id: '', debit: '', credit: '', description: '' }, { account_id: '', debit: '', credit: '', description: '' }] }); setShowJournalModal(true); }}>
                  <Plus size={16} /> New Journal Entry
                </button>
              </div>
              <div className="card">
                <table className="table">
                  <thead><tr><th>Entry No</th><th>Date</th><th>Description</th><th>Reference</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th><th>Status</th><th style={{ width: 60 }}></th></tr></thead>
                  <tbody>
                    {journals.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>No entries</td></tr>
                    : journals.map(je => (
                      <tr key={je.id}>
                        <td><code style={{ fontSize: 12 }}>{je.entry_no}</code></td>
                        <td>{formatDate(je.entry_date)}</td>
                        <td>{je.description}</td>
                        <td>{je.reference || '—'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(je.total_debit)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(je.total_credit)}</td>
                        <td><span className={`badge ${je.status === 'posted' ? 'badge-success' : 'badge-warning'}`}>{je.status}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => viewJournal(je)}><Eye size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ledger */}
          {tab === 'ledger' && (
            <div className="card">
              {!ledgerAccountId ? (
                <div className="empty-state" style={{ padding: 40 }}><BookOpen size={36} /><h3>Select an account</h3><p>Choose an account above to view its ledger</p></div>
              ) : (
                <table className="table">
                  <thead><tr><th>Date</th><th>Entry No</th><th>Description</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
                  <tbody>
                    {ledgerData.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No entries</td></tr>
                    : ledgerData.map((row: any, i: number) => (
                      <tr key={i}>
                        <td>{formatDate(row.entry_date)}</td>
                        <td><code style={{ fontSize: 12 }}>{row.entry_no}</code></td>
                        <td>{row.description}</td>
                        <td style={{ textAlign: 'right' }}>{row.debit > 0 ? formatCurrency(row.debit) : ''}</td>
                        <td style={{ textAlign: 'right' }}>{row.credit > 0 ? formatCurrency(row.credit) : ''}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(row.running_balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Trial Balance */}
          {tab === 'trial_balance' && trialBalance && (
            <div className="card">
              <table className="table">
                <thead><tr><th>Code</th><th>Account</th><th>Type</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                <tbody>
                  {trialBalance.accounts?.map((a: any) => (
                    <tr key={a.id}>
                      <td><code>{a.code}</code></td>
                      <td>{a.name}</td>
                      <td><span className="badge badge-info">{a.type}</span></td>
                      <td style={{ textAlign: 'right' }}>{a.debit > 0 ? formatCurrency(a.debit) : ''}</td>
                      <td style={{ textAlign: 'right' }}>{a.credit > 0 ? formatCurrency(a.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={3}>Totals</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(trialBalance.total_debit || 0)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(trialBalance.total_credit || 0)}</td>
                  </tr>
                </tfoot>
              </table>
              {trialBalance.total_debit !== trialBalance.total_credit && (
                <div style={{ padding: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 8, margin: 12, fontSize: 13 }}>
                  ⚠️ Trial balance does not balance! Difference: {formatCurrency(Math.abs(trialBalance.total_debit - trialBalance.total_credit))}
                </div>
              )}
            </div>
          )}

          {/* P&L */}
          {tab === 'pnl' && pnl && (
            <div>
              <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">{formatCurrency(pnl.total_revenue || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Total Expenses</div><div className="stat-value">{formatCurrency(pnl.total_expenses || 0)}</div></div>
                <div className="stat-card"><div className="stat-label">Net Profit</div><div className="stat-value" style={{ color: (pnl.net_profit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(pnl.net_profit || 0)}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card">
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Revenue</h3></div>
                  <table className="table">
                    <tbody>
                      {pnl.revenue?.map((r: any) => <tr key={r.id}><td>{r.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(r.amount)}</td></tr>)}
                    </tbody>
                    <tfoot><tr style={{ fontWeight: 700 }}><td>Total Revenue</td><td style={{ textAlign: 'right' }}>{formatCurrency(pnl.total_revenue || 0)}</td></tr></tfoot>
                  </table>
                </div>
                <div className="card">
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Expenses</h3></div>
                  <table className="table">
                    <tbody>
                      {pnl.expenses?.map((e: any) => <tr key={e.id}><td>{e.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(e.amount)}</td></tr>)}
                    </tbody>
                    <tfoot><tr style={{ fontWeight: 700 }}><td>Total Expenses</td><td style={{ textAlign: 'right' }}>{formatCurrency(pnl.total_expenses || 0)}</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Balance Sheet */}
          {tab === 'balance_sheet' && balanceSheet && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Assets</h3></div>
                  <table className="table">
                    <tbody>{balanceSheet.assets?.map((a: any) => <tr key={a.id}><td>{a.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(a.balance)}</td></tr>)}</tbody>
                    <tfoot><tr style={{ fontWeight: 700 }}><td>Total Assets</td><td style={{ textAlign: 'right' }}>{formatCurrency(balanceSheet.total_assets || 0)}</td></tr></tfoot>
                  </table>
                </div>
              </div>
              <div>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Liabilities</h3></div>
                  <table className="table">
                    <tbody>{balanceSheet.liabilities?.map((l: any) => <tr key={l.id}><td>{l.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(l.balance)}</td></tr>)}</tbody>
                    <tfoot><tr style={{ fontWeight: 700 }}><td>Total Liabilities</td><td style={{ textAlign: 'right' }}>{formatCurrency(balanceSheet.total_liabilities || 0)}</td></tr></tfoot>
                  </table>
                </div>
                <div className="card">
                  <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 600 }}>Equity</h3></div>
                  <table className="table">
                    <tbody>{balanceSheet.equity?.map((e: any) => <tr key={e.id}><td>{e.name}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(e.balance)}</td></tr>)}</tbody>
                    <tfoot><tr style={{ fontWeight: 700 }}><td>Total Equity</td><td style={{ textAlign: 'right' }}>{formatCurrency(balanceSheet.total_equity || 0)}</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Day Book */}
          {tab === 'day_book' && (
            <div className="card">
              <table className="table">
                <thead><tr><th>Entry No</th><th>Date</th><th>Account</th><th>Description</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                <tbody>
                  {dayBook.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No entries for this date</td></tr>
                  : dayBook.map((row: any, i: number) => (
                    <tr key={i}>
                      <td><code style={{ fontSize: 12 }}>{row.entry_no}</code></td>
                      <td>{formatDate(row.entry_date)}</td>
                      <td>{row.account_name}</td>
                      <td>{row.description}</td>
                      <td style={{ textAlign: 'right' }}>{row.debit > 0 ? formatCurrency(row.debit) : ''}</td>
                      <td style={{ textAlign: 'right' }}>{row.credit > 0 ? formatCurrency(row.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Account Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Account</h3></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={accountForm.code} onChange={e => setAccountForm(f => ({ ...f, code: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Type *</label>
                <select className="form-input" value={accountForm.type} onChange={e => setAccountForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="asset">Asset</option><option value="liability">Liability</option><option value="equity">Equity</option>
                  <option value="revenue">Revenue</option><option value="expense">Expense</option>
                </select></div>
              <div className="form-group"><label className="form-label">Parent Account</label>
                <select className="form-input" value={accountForm.parent_id} onChange={e => setAccountForm(f => ({ ...f, parent_id: e.target.value }))}>
                  <option value="">None</option>{accounts.filter(a => a.type === accountForm.type).map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                </select></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowAccountModal(false)}>Cancel</button><button className="btn btn-primary" onClick={createAccount}>Create</button></div>
          </div>
        </div>
      )}

      {/* Create Journal Modal */}
      {showJournalModal && (
        <div className="modal-overlay" onClick={() => setShowJournalModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">New Journal Entry</h3><button className="btn btn-ghost" onClick={() => setShowJournalModal(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-grid-3" style={{ marginBottom: 16 }}>
                <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={journalForm.entry_date} onChange={e => setJournalForm(f => ({ ...f, entry_date: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={journalForm.description} onChange={e => setJournalForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Reference</label><input className="form-input" value={journalForm.reference} onChange={e => setJournalForm(f => ({ ...f, reference: e.target.value }))} /></div>
              </div>
              <table className="table" style={{ marginBottom: 12 }}>
                <thead><tr><th>Account</th><th style={{ width: 120 }}>Debit</th><th style={{ width: 120 }}>Credit</th><th>Description</th><th style={{ width: 40 }}></th></tr></thead>
                <tbody>
                  {journalForm.lines.map((line, idx) => (
                    <tr key={idx}>
                      <td><select className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.account_id} onChange={e => updateJournalLine(idx, 'account_id', e.target.value)}>
                        <option value="">Select</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                      </select></td>
                      <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.debit} onChange={e => updateJournalLine(idx, 'debit', e.target.value)} /></td>
                      <td><input type="number" className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.credit} onChange={e => updateJournalLine(idx, 'credit', e.target.value)} /></td>
                      <td><input className="form-input" style={{ padding: '4px 6px', fontSize: 12 }} value={line.description} onChange={e => updateJournalLine(idx, 'description', e.target.value)} /></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => setJournalForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))}><X size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 600 }}>
                    <td>Totals</td>
                    <td>{formatCurrency(journalForm.lines.reduce((s, l) => s + parseFloat(l.debit || '0'), 0))}</td>
                    <td>{formatCurrency(journalForm.lines.reduce((s, l) => s + parseFloat(l.credit || '0'), 0))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
              <button className="btn btn-secondary btn-sm" onClick={addJournalLine}><Plus size={14} /> Add Line</button>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowJournalModal(false)}>Cancel</button><button className="btn btn-primary" onClick={createJournal}>Post Entry</button></div>
          </div>
        </div>
      )}

      {/* Journal Detail */}
      {journalDetail && (
        <div className="modal-overlay" onClick={() => setJournalDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Journal Entry: {journalDetail.entry_no}</h3><button className="btn btn-ghost" onClick={() => setJournalDetail(null)}><X size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
                <div><strong>Date:</strong> {formatDate(journalDetail.entry_date)}</div>
                <div><strong>Description:</strong> {journalDetail.description}</div>
                <div><strong>Status:</strong> <span className={`badge ${journalDetail.status === 'posted' ? 'badge-success' : 'badge-warning'}`}>{journalDetail.status}</span></div>
              </div>
              <table className="table">
                <thead><tr><th>Account</th><th>Description</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                <tbody>
                  {journalDetail.lines?.map((line: any) => (
                    <tr key={line.id}>
                      <td>{line.account_code} — {line.account_name}</td>
                      <td>{line.description || '—'}</td>
                      <td style={{ textAlign: 'right' }}>{line.debit > 0 ? formatCurrency(line.debit) : ''}</td>
                      <td style={{ textAlign: 'right' }}>{line.credit > 0 ? formatCurrency(line.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setJournalDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
