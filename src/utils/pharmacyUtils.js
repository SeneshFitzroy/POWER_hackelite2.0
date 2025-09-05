// Pharmacy business logic and calculations

// Tax calculations
export const calculateTax = (amount, taxRate = 18) => {
  return (amount * taxRate) / 100;
};

// Discount calculations
export const calculateDiscount = (amount, discount, discountType = 'percentage') => {
  if (discountType === 'percentage') {
    return (amount * discount) / 100;
  }
  return Math.min(discount, amount); // Flat discount cannot exceed amount
};

// Total calculation for transaction
export const calculateTransactionTotal = (items, globalDiscount = 0, globalDiscountType = 'percentage') => {
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  // Calculate subtotal and individual item taxes/discounts
  items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = calculateDiscount(itemTotal, item.discount || 0, 'percentage');
    const itemTaxableAmount = itemTotal - itemDiscount;
    const itemTax = calculateTax(itemTaxableAmount, item.taxRate || 0);

    item.totalPrice = itemTotal - itemDiscount + itemTax;
    subtotal += itemTotal;
    totalDiscount += itemDiscount;
    totalTax += itemTax;
  });

  // Apply global discount
  const globalDiscountAmount = calculateDiscount(subtotal, globalDiscount, globalDiscountType);
  totalDiscount += globalDiscountAmount;

  const finalTotal = subtotal - totalDiscount + totalTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(totalDiscount * 100) / 100,
    tax: Math.round(totalTax * 100) / 100,
    total: Math.round(finalTotal * 100) / 100
  };
};

// Check if medicine is expiring soon
export const isExpiringMedicine = (expiryDate, daysThreshold = 30) => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const threshold = new Date();
  threshold.setDate(today.getDate() + daysThreshold);
  
  return expiry <= threshold;
};

// Check if medicine is expired
export const isExpiredMedicine = (expiryDate) => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  
  return expiry < today;
};

// Calculate stock status
export const getStockStatus = (currentStock, minLevel, maxLevel) => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= minLevel) return 'low_stock';
  if (currentStock >= maxLevel) return 'overstock';
  return 'normal';
};

// Generate unique IDs
export const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

export const generateReceiptNumber = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = today.getTime().toString().slice(-6);
  return `RCP-${dateStr}-${timeStr}`;
};

export const generatePrescriptionNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `PRX-${timestamp}-${random}`.toUpperCase();
};

// Insurance calculations
export const calculateInsuranceCoverage = (totalAmount, coveragePercentage = 0, maxCoverage = null) => {
  if (coveragePercentage <= 0) return 0;
  
  let coverage = (totalAmount * coveragePercentage) / 100;
  
  if (maxCoverage && coverage > maxCoverage) {
    coverage = maxCoverage;
  }
  
  return Math.round(coverage * 100) / 100;
};

// Calculate patient balance after insurance
export const calculatePatientBalance = (totalAmount, insuranceCoverage = 0) => {
  return Math.round((totalAmount - insuranceCoverage) * 100) / 100;
};

// Loyalty points calculation
export const calculateLoyaltyPoints = (amount, pointsPerRupee = 0.01) => {
  return Math.floor(amount * pointsPerRupee);
};

// Age calculation from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Format currency for display
export const formatCurrency = (amount, currency = 'LKR') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date for display
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString('en-LK', options[format] || options.short);
};

// Validate prescription requirements
export const validatePrescriptionSale = (items, patientAge = null) => {
  const prescriptionRequired = items.some(item => item.prescriptionRequired);
  const warnings = [];
  
  if (prescriptionRequired) {
    warnings.push('This sale contains prescription medicines and requires prescription verification.');
  }
  
  // Check age-restricted medicines
  items.forEach(item => {
    if (item.ageRestriction && patientAge && patientAge < item.ageRestriction) {
      warnings.push(`${item.medicineName} is age-restricted (minimum age: ${item.ageRestriction})`);
    }
  });
  
  return {
    prescriptionRequired,
    warnings
  };
};

// Calculate reorder quantity
export const calculateReorderQuantity = (currentStock, minLevel, maxLevel, averageUsage = 0) => {
  if (currentStock > minLevel) return 0;
  
  // Simple reorder calculation: bring stock to max level plus buffer for average usage
  const reorderQuantity = maxLevel - currentStock + (averageUsage * 7); // 7 days buffer
  
  return Math.max(0, Math.ceil(reorderQuantity));
};

// Check for drug interactions (simplified)
export const checkBasicInteractions = (medicines) => {
  const interactions = [];
  
  // This is a simplified example - in reality, you'd have a comprehensive drug interaction database
  const commonInteractions = {
    'warfarin': ['aspirin', 'ibuprofen'],
    'aspirin': ['warfarin', 'methotrexate'],
    'digoxin': ['quinidine', 'verapamil']
  };
  
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const med1 = medicines[i].activeIngredient?.toLowerCase();
      const med2 = medicines[j].activeIngredient?.toLowerCase();
      
      if (med1 && med2 && commonInteractions[med1]?.includes(med2)) {
        interactions.push({
          medicine1: medicines[i].name,
          medicine2: medicines[j].name,
          severity: 'moderate',
          description: `Potential interaction between ${med1} and ${med2}`
        });
      }
    }
  }
  
  return interactions;
};

// Generate sales report data
export const generateSalesReportData = (transactions, startDate, endDate) => {
  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.createdAt);
    return txnDate >= startDate && txnDate <= endDate;
  });
  
  const totalSales = filteredTransactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  // Group by payment method
  const paymentMethods = filteredTransactions.reduce((acc, txn) => {
    acc[txn.paymentMethod] = (acc[txn.paymentMethod] || 0) + txn.totalAmount;
    return acc;
  }, {});
  
  // Top selling medicines
  const medicinesSold = {};
  filteredTransactions.forEach(txn => {
    txn.items.forEach(item => {
      if (!medicinesSold[item.medicineId]) {
        medicinesSold[item.medicineId] = {
          name: item.medicineName,
          quantity: 0,
          revenue: 0
        };
      }
      medicinesSold[item.medicineId].quantity += item.quantity;
      medicinesSold[item.medicineId].revenue += item.totalPrice;
    });
  });
  
  const topSellingMedicines = Object.values(medicinesSold)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalTransactions,
    averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
    paymentMethods,
    topSellingMedicines,
    period: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  };
};

// Barcode validation
export const validateBarcode = (barcode) => {
  // Remove any spaces or special characters
  const cleanBarcode = barcode.replace(/[^0-9]/g, '');
  
  // Check common barcode formats
  const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, ITF-14
  
  return validLengths.includes(cleanBarcode.length) && /^\d+$/.test(cleanBarcode);
};

// Search suggestion generator
export const generateSearchSuggestions = (searchTerm, medicines, limit = 5) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const suggestions = medicines
    .filter(medicine => 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limit)
    .map(medicine => ({
      id: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      type: medicine.type
    }));
  
  return suggestions;
};
