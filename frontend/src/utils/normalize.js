export function normalize(value) {
  if (value === null || value === undefined) return '';
  const result = value
    .toString()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
    .toLowerCase();
  // Remove any non-alphanumeric characters except spaces
  return result;
}
