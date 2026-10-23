const kesFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export function formatKES(amount) {
  return kesFormatter.format(Number(amount) || 0);
}
