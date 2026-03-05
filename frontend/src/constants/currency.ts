export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  label: 'Indian Rupee',
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
