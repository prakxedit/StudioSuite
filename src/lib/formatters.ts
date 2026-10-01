/**
 * SkySuite Indian Business Utilities & Formatters
 */

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  // If format is HH:MM or HH:MM:SS
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  }
  return timeStr;
}

export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

export function createWhatsAppUrl(phone: string, message?: string): string {
  let clean = sanitizePhone(phone);
  if (!clean) return '#';
  if (!clean.startsWith('+')) {
    if (clean.length === 10) {
      clean = '91' + clean;
    }
  } else {
    clean = clean.replace('+', '');
  }
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${clean}${textParam}`;
}

export function getDaysDiff(targetDateStr: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function isOverdue(dateStr: string): boolean {
  return getDaysDiff(dateStr) < 0;
}
