// Currency formatting utilities for Sri Lankan Rupees (LKR)

export const formatLKR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0.00';
  }
  
  const number = parseFloat(amount);
  
  // Format with Sri Lankan number formatting (with commas)
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

export const formatLKRCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0';
  }
  
  const number = parseFloat(amount);
  
  if (number >= 1000000) {
    return `LKR ${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `LKR ${(number / 1000).toFixed(1)}K`;
  } else {
    return `LKR ${number.toFixed(0)}`;
  }
};

export const parseLKR = (lkrString) => {
  if (!lkrString) {
    return 0;
  }
  // Remove LKR, commas, and other non-numeric characters except decimal point
  return parseFloat(lkrString.replace(/[^0-9.-]+/g, '')) || 0;
};
