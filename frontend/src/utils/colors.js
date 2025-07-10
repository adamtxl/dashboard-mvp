const colorPalette = [
  '#36A2EB', // Blue
  '#FF6384', // Red
  '#4BC0C0', // Teal
  '#FFCD56', // Yellow
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#C9CBCF', // Gray
  '#8DD17E', // Green
  '#F67019', // Dark Orange
  '#00A8C6', // Cyan
];

export function getColorForIndex(index) {
  return colorPalette[index % colorPalette.length];
}
