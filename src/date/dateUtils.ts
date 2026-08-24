export type DateUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export function addDuration(baseDate: Date, amount: number, unit: DateUnit): Date {
  const d = new Date(baseDate.getTime());
  if (isNaN(d.getTime())) return new Date(NaN);

  switch (unit) {
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'weeks':
      d.setDate(d.getDate() + amount * 7);
      break;
    case 'months': {
      const targetMonth = d.getMonth() + amount;
      const originalDay = d.getDate();
      d.setMonth(targetMonth);
      if (d.getDate() < originalDay) {
        d.setDate(0);
      }
      break;
    }
    case 'years': {
      const targetYear = d.getFullYear() + amount;
      const originalDay = d.getDate();
      d.setFullYear(targetYear);
      if (d.getDate() < originalDay) {
        d.setDate(0);
      }
      break;
    }
  }
  return d;
}

export function subtractDuration(baseDate: Date, amount: number, unit: DateUnit): Date {
  return addDuration(baseDate, -amount, unit);
}

export function getDaysBetween(startDate: Date, endDate: Date, includeEndDay: boolean = false): number {
  const utcStart = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const utcEnd = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const diffTime = Math.abs(utcEnd - utcStart);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return includeEndDay ? diffDays + 1 : diffDays;
}

export function getWorkdaysBetween(startDate: Date, endDate: Date, includeEndDay: boolean = false): number {
  let cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  let end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (cur > end) {
    const temp = cur;
    cur = end;
    end = temp;
  }

  let workdays = 0;
  while (cur < end || (includeEndDay && cur.getTime() === end.getTime())) {
    const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workdays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return workdays;
}

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  formatted: string;
  isNegative: boolean;
}

export function getDateDifference(startDate: Date, endDate: Date): DateDiffResult {
  let isNegative = false;
  let start = new Date(startDate.getTime());
  let end = new Date(endDate.getTime());

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
      totalDays: 0, totalHours: 0, totalMinutes: 0,
      formatted: 'Invalid Date', isNegative: false
    };
  }

  if (start > end) {
    isNegative = true;
    const temp = start;
    start = end;
    end = temp;
  }

  const totalMs = end.getTime() - start.getTime();
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  let cur = new Date(start.getTime());

  let years = end.getFullYear() - cur.getFullYear();
  cur.setFullYear(cur.getFullYear() + years);
  if (cur > end) {
    years--;
    cur = new Date(start.getTime());
    cur.setFullYear(cur.getFullYear() + years);
  }

  let months = 0;
  while (true) {
    const nextMonth = new Date(cur.getTime());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= end) {
      months++;
      cur = nextMonth;
    } else {
      break;
    }
  }

  let days = 0;
  while (true) {
    const nextDay = new Date(cur.getTime());
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= end) {
      days++;
      cur = nextDay;
    } else {
      break;
    }
  }

  const remainingMs = end.getTime() - cur.getTime();
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);

  const formatted = (isNegative ? '-' : '') + parts.join(', ');

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    formatted,
    isNegative
  };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDayOfYear(date: Date): number {
  if (isNaN(date.getTime())) return 0;
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

export function getWeekNumber(date: Date): number {
  if (isNaN(date.getTime())) return 0;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getRelativeTimeString(targetDate: Date, baseDate: Date = new Date()): string {
  if (isNaN(targetDate.getTime()) || isNaN(baseDate.getTime())) return 'Invalid date';

  const elapsedMs = targetDate.getTime() - baseDate.getTime();
  const elapsedSec = Math.round(elapsedMs / 1000);
  const absSec = Math.abs(elapsedSec);
  const isFuture = elapsedMs > 0;

  if (absSec < 30) return 'just now';

  const minutes = Math.round(absSec / 60);
  if (minutes < 45) return isFuture ? `in ${minutes} min` : `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 22) return isFuture ? `in ${hours} hr${hours > 1 ? 's' : ''}` : `${hours} hr${hours > 1 ? 's' : ''} ago`;

  const days = Math.round(hours / 24);
  if (days < 26) return isFuture ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;

  const months = Math.round(days / 30);
  if (months < 11) return isFuture ? `in ${months} month${months > 1 ? 's' : ''}` : `${months} month${months > 1 ? 's' : ''} ago`;

  const years = Math.round(days / 365);
  return isFuture ? `in ${years} year${years > 1 ? 's' : ''}` : `${years} year${years > 1 ? 's' : ''} ago`;
}

export function formatDateTimeLocal(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function formatDateString(date: Date): string {
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
