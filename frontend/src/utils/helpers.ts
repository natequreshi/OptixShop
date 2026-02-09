export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '0';
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    completed: 'badge-success', paid: 'badge-success', received: 'badge-success', delivered: 'badge-success',
    accepted: 'badge-success', active: 'badge-success', approved: 'badge-success', reconciled: 'badge-success',
    pending: 'badge-warning', partial: 'badge-warning', draft: 'badge-warning', open: 'badge-warning',
    in_progress: 'badge-warning', edging: 'badge-warning', polishing: 'badge-warning', fitting: 'badge-warning',
    unpaid: 'badge-danger', cancelled: 'badge-danger', void: 'badge-danger', rejected: 'badge-danger',
    credit: 'badge-info', sent: 'badge-info', ready: 'badge-info', quality_check: 'badge-info',
    returned: 'badge-secondary',
  };
  return map[status] || 'badge-secondary';
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}
