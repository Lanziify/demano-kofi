export function normalizeSeparators(value: string): string {
  return value
    .replace(/[-_.\\/]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function toSentenceCase(value: string): string {
  const normalized = normalizeSeparators(value).toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function toLowerCase(value: string): string {
  return normalizeSeparators(value).toLowerCase();
}

export function slugify(value?: string): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}
