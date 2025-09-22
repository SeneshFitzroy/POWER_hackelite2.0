import { format } from 'date-fns';

/**
 * Safely format a date, handling invalid dates gracefully
 * @param {Date|string|number} date - The date to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy')
 * @param {string} fallback - The fallback text for invalid dates (default: 'N/A')
 * @returns {string} Formatted date string or fallback
 */
export const safeFormatDate = (date, formatString = 'MMM dd, yyyy', fallback = 'N/A') => {
  if (!date) return fallback;
  
  try {
    let dateObj;
    
    // Handle Firestore timestamp objects
    if (date && typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

/**
 * Check if a date is valid
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    let dateObj;
    
    // Handle Firestore timestamp objects
    if (date && typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Get days until expiry
 * @param {Date|string|number} expiryDate - The expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  
  try {
    let expiry;
    
    // Handle Firestore timestamp objects
    if (expiryDate && typeof expiryDate === 'object' && expiryDate.toDate && typeof expiryDate.toDate === 'function') {
      expiry = expiryDate.toDate();
    } else {
      expiry = new Date(expiryDate);
    }
    
    // Check if the date is valid
    if (isNaN(expiry.getTime())) {
      return null;
    }
    
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.warn('Date calculation error:', error);
    return null;
  }
};

/**
 * Get expiry status based on days until expiry
 * @param {Date|string|number} expiryDate - The expiry date
 * @param {number} warningDays - Days before expiry to show warning (default: 30)
 * @returns {object} Status object with status, color, and days
 */
export const getExpiryStatus = (expiryDate, warningDays = 30) => {
  const days = getDaysUntilExpiry(expiryDate);
  
  if (days === null) {
    return { status: 'unknown', color: 'default', days: 0 };
  }
  
  if (days < 0) {
    return { status: 'expired', color: 'error', days: Math.abs(days) };
  } else if (days <= 7) {
    return { status: 'critical', color: 'error', days };
  } else if (days <= warningDays) {
    return { status: 'expiring', color: 'warning', days };
  } else {
    return { status: 'valid', color: 'success', days };
  }
};
