
/**
 * Format a number as ZMW (Zambian Kwacha)
 */
export const formatZMW = (amount: number): string => {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
  }).format(amount);
};
