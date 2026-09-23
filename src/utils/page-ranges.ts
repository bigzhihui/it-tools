export type PageRangeResult =
  | { ok: true; pages: number[] }
  | { ok: false; error: 'empty' | 'syntax' | 'outOfRange' };

// Accepts the notation people already know from print dialogs, such as
// "1-3, 5, 8-10". Full-width digits, commas and dashes typed on Chinese
// keyboards are accepted too, a range may run backwards ("5-3"), and "7-" runs
// to the end. Pages come back 1-based in the order written, so "3,1,2" also
// reorders.
export function parsePageRanges(input: string, pageCount: number): PageRangeResult {
  const normalized = input
    .replace(/[０-９]/g, digit => String.fromCharCode(digit.charCodeAt(0) - 0xFEE0))
    .replace(/[，、;；]/g, ',')
    .replace(/[－—–~～]/g, '-')
    .replace(/\s+/g, '');

  if (normalized === '') {
    return { ok: false, error: 'empty' };
  }

  const pages: number[] = [];

  for (const part of normalized.split(',')) {
    if (part === '') {
      continue;
    }

    const match = part.match(/^(\d+)(?:-(\d*))?$/);
    if (!match) {
      return { ok: false, error: 'syntax' };
    }

    const start = Number(match[1]);
    const hasDash = match[2] !== undefined;
    const end = hasDash ? (match[2] === '' ? pageCount : Number(match[2])) : start;

    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      return { ok: false, error: 'outOfRange' };
    }

    const step = end >= start ? 1 : -1;
    for (let page = start; page !== end + step; page += step) {
      pages.push(page);
    }
  }

  if (pages.length === 0) {
    return { ok: false, error: 'empty' };
  }

  return { ok: true, pages };
}
