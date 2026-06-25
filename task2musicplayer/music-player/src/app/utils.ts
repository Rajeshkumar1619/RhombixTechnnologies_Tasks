export function normalizeQuery(s: string): string {
  return (s ?? '').toLowerCase().trim();
}

export function tokenizeTags(input: string): string[] {
  return input
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
    .map(x => x.replace(/\s+/g, ' '));
}

export function escapeHtml(str: string): string {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

