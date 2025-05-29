export function normalize(value) {
  if (value === null || value === undefined) return '';
  const result = value
    .toString()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
    .toLowerCase();
  if (value !== result) {
    console.log(`🔍 Normalized '${value}' => '${result}'`);
  }
  return result;
}
