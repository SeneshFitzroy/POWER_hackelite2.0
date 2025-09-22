// Database Models and Schemas for Pharmacy POS System

// Medicine Model
export const MedicineModel = {
  // Required fields
  name: '',                    // Medicine name
  genericName: '',             // Generic name
  manufacturer: '',            // Manufacturer name
  barcode: '',                 // Barcode/SKU
  activeIngredient: '',        // Active ingredient
  
  // Category and Type
  category: '',                // Category (Antibiotics, Painkillers, etc.)
  type: 'OTC',                 // 'OTC' or 'Prescription'
  dosageForm: '',              // Tablet, Capsule, Syrup, etc.
  strength: '',                // Dosage strength (500mg, 10ml, etc.)
  
  // Inventory Management
  stockQuantity: 0,            // Current stock
  minStockLevel: 10,           // Minimum stock alert level
  maxStockLevel: 100,          // Maximum stock level
  reorderPoint: 20,            // Reorder point
  
  // Pricing
  costPrice: 0,                // Cost price per unit
  sellingPrice: 0,             // Selling price per unit
  mrp: 0,                      // Maximum Retail Price
  discount: 0,                 // Discount percentage
  
  // Batch Information
  batchNumber: '',             // Current batch number
  manufacturingDate: null,     // Manufacturing date
  expiryDate: null,            // Expiry date
  
  // Storage and Safety
  storageConditions: '',       // Storage requirements
  sideEffects: [],             // Array of side effects
  contraindications: [],       // Array of contraindications
  interactions: [],            // Array of drug interactions
  
  // Prescription Information
  prescriptionRequired: false, // Whether prescription is required
  dosageInstructions: '',      // How to take the medicine
  
  // Status and Metadata
  status: 'active',            // active, inactive, discontinued
  taxRate: 0,                  // Tax rate percentage
  createdAt: null,
  updatedAt: null,
  
  // Additional pharmacy-specific fields
  rackLocation: '',            // Physical location in pharmacy
  vendor: '',                  // Supplier information
  purchaseOrderNumber: '',     // Last purchase order
};

// Patient Model
export const PatientModel = {
  // Basic Information
  name: '',                    // Patient full name
  phoneNumber: '',             // Primary phone number (unique identifier)
  alternatePhone: '',          // Alternate phone number
  email: '',                   // Email address
  
  // Personal Details
  dateOfBirth: null,           // Date of birth
  gender: '',                  // Male, Female, Other
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka'
  },
  
  // Medical Information
  allergies: [],               // Array of known allergies
  medicalConditions: [],       // Array of medical conditions
  bloodGroup: '',              // Blood group
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  },
  
  // Insurance Information
  insuranceProvider: '',       // Insurance company name
  insuranceNumber: '',         // Insurance policy number
  insuranceCoverage: 0,        // Coverage percentage
  
  // Purchase History
  totalPurchases: 0,           // Total amount spent
  totalVisits: 0,              // Number of visits
  lastVisit: null,             // Last visit date
  loyaltyPoints: 0,            // Loyalty points earned
  
  // Prescription History
  prescriptions: [],           // Array of prescription IDs
  
  // Status and Metadata
  status: 'active',            // active, inactive
  createdAt: null,
  updatedAt: null,
  
  // Privacy and Consent
  consentForMarketing: false,  // Marketing consent
  dataPrivacyConsent: true,    // Data privacy consent
};

// Transaction Model
export const TransactionModel = {
  // Transaction Details
  transactionId: '',           // Unique transaction ID
  receiptNumber: '',           // Receipt number
  type: 'sale',                // sale, refund, exchange
  status: 'completed',         // pending, completed, refunded, cancelled
  
  // Customer Information
  patientId: null,             // Patient ID (if registered customer)
  patientPhone: '',            // Phone number for lookup
  patientName: '',             // Customer name
  
  // Items and Pricing
  items: [],                   // Array of purchased items
  subtotal: 0,                 // Subtotal before tax and discount
  discount: 0,                 // Total discount amount
  discountType: 'amount',      // amount or percentage
  taxAmount: 0,                // Total tax amount
  totalAmount: 0,              // Final total amount
  
  // Payment Information
  paymentMethod: 'cash',       // cash, card, insurance, mixed
  paymentDetails: {
    cash: 0,
    card: 0,
    insurance: 0,
    change: 0
  },
  
  // Prescription Information
  prescriptionId: null,        // Associated prescription ID
  prescriptionRequired: false, // Whether prescription was required
  
  // Employee Information
  employeeId: '',              // Employee who processed the sale
  pharmacistId: '',            // Pharmacist who verified (if prescription)
  pharmacyRegistrationNumber: '', // Pharmacy registration number
  
  // Insurance Claims
  insuranceClaim: {
    claimNumber: '',
    provider: '',
    amount: 0,
    status: 'pending'          // pending, approved, rejected
  },
  
  // Refund Information
  originalTransactionId: null, // Original transaction (for refunds)
  refundTransactionId: null,   // Refund transaction (for original)
  refundReason: '',            // Reason for refund
  
  // Timestamps
  createdAt: null,
  updatedAt: null,
  
  // Additional Notes
  notes: '',                   // Any additional notes
  deliveryAddress: null,       // Delivery address (if applicable)
  deliveryStatus: 'none'       // none, pending, delivered
};

// Transaction Item Model
export const TransactionItemModel = {
  medicineId: '',              // Medicine ID
  medicineName: '',            // Medicine name
  batchNumber: '',             // Batch number
  quantity: 0,                 // Quantity sold
  unitPrice: 0,                // Price per unit
  discount: 0,                 // Discount on this item
  taxRate: 0,                  // Tax rate for this item
  totalPrice: 0,               // Total price for this item
  prescriptionRequired: false, // Whether prescription was required
  dosageInstructions: '',      // Dosage instructions provided
  expiryDate: null,            // Expiry date of the batch sold
};

// Employee Model
export const EmployeeModel = {
  // Basic Information
  employeeId: '',              // Unique employee ID
  name: '',                    // Full name
  email: '',                   // Email address
  phone: '',                   // Phone number
  
  // Role and Permissions
  role: 'staff',               // owner, pharmacist, staff, cashier
  permissions: [],             // Array of permissions
  pharmacistLicense: '',       // Pharmacist license number (if applicable)
  
  // Work Information
  department: 'pharmacy',      // Department
  shift: 'day',                // day, night, flexible
  salary: 0,                   // Monthly salary
  joiningDate: null,           // Date of joining
  
  // Status and Security
  status: 'active',            // active, inactive, terminated
  lastLogin: null,             // Last login timestamp
  
  // Personal Information
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka'
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  },
  
  // Timestamps
  createdAt: null,
  updatedAt: null
};

// Prescription Model
export const PrescriptionModel = {
  // Prescription Details
  prescriptionNumber: '',      // Unique prescription number
  prescriptionDate: null,      // Date of prescription
  status: 'pending',           // pending, filled, partially_filled, cancelled
  
  // Patient Information
  patientId: '',               // Patient ID
  patientName: '',             // Patient name
  patientPhone: '',            // Patient phone
  patientAge: 0,               // Patient age
  patientGender: '',           // Patient gender
  
  // Doctor Information
  doctorName: '',              // Prescribing doctor name
  doctorRegNumber: '',         // Doctor registration number
  hospital: '',                // Hospital/clinic name
  doctorPhone: '',             // Doctor phone number
  
  // Prescription Items
  medications: [],             // Array of prescribed medications
  diagnosis: '',               // Diagnosis
  symptoms: '',                // Patient symptoms
  
  // Filling Information
  filledBy: null,              // Employee ID who filled prescription
  filledAt: null,              // Date/time when filled
  pharmacistVerification: '',  // Pharmacist who verified
  
  // Instructions
  generalInstructions: '',     // General instructions for patient
  followUpRequired: false,     // Whether follow-up is required
  followUpDate: null,          // Follow-up date
  
  // Insurance and Payment
  insuranceCovered: false,     // Whether covered by insurance
  insuranceProvider: '',       // Insurance provider
  copayAmount: 0,              // Copay amount
  
  // Status and Metadata
  refillsRemaining: 0,         // Number of refills remaining
  originalPrescriptionId: null, // Original prescription (for refills)
  
  // Timestamps
  createdAt: null,
  updatedAt: null,
  
  // Digital signature/verification
  digitalSignature: '',        // Digital signature of doctor
  verificationCode: '',        // Verification code
};

// Prescription Medication Model
export const PrescriptionMedicationModel = {
  medicineId: '',              // Medicine ID from inventory
  medicineName: '',            // Medicine name
  dosage: '',                  // Dosage (500mg, 10ml, etc.)
  frequency: '',               // How often to take (twice daily, etc.)
  duration: '',                // Duration of treatment
  quantity: 0,                 // Quantity prescribed
  instructions: '',            // Specific instructions
  substitutionAllowed: true,   // Whether generic substitution allowed
  
  // Filling information
  quantityFilled: 0,           // Quantity actually filled
  filledDate: null,            // Date when filled
  batchNumber: '',             // Batch number of filled medicine
  expiryDate: null,            // Expiry date of filled medicine
};

// Pharmacy Registration Model
export const PharmacyRegistrationModel = {
  registrationNumber: '',      // Pharmacy registration number
  pharmacyName: '',            // Pharmacy name
  ownerName: '',               // Owner name
  licenseNumber: '',           // License number
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Sri Lanka'
  },
  phone: '',                   // Contact phone
  email: '',                   // Contact email
  status: 'active',            // active, inactive, suspended
  issueDate: null,             // License issue date
  expiryDate: null,            // License expiry date
  renewalDate: null,           // Last renewal date
  createdAt: null,
  updatedAt: null
};

// Daily Sales Summary Model
export const DailySalesModel = {
  date: '',                    // Date (YYYY-MM-DD)
  totalSales: 0,               // Total sales amount
  transactionCount: 0,         // Number of transactions
  prescriptionCount: 0,        // Number of prescriptions filled
  otcCount: 0,                 // Number of OTC sales
  cashSales: 0,                // Cash sales amount
  cardSales: 0,                // Card sales amount
  insuranceSales: 0,           // Insurance sales amount
  refundAmount: 0,             // Total refunds
  discountAmount: 0,           // Total discounts given
  taxAmount: 0,                // Total tax collected
  topSellingMedicines: [],     // Top selling medicines
  employeeSales: {},           // Sales by employee
  createdAt: null,
  updatedAt: null
};

// Validation functions
export const validateMedicine = (medicine) => {
  const errors = [];
  if (!medicine.name) errors.push('Medicine name is required');
  if (!medicine.barcode) errors.push('Barcode is required');
  if (medicine.sellingPrice <= 0) errors.push('Selling price must be greater than 0');
  if (medicine.stockQuantity < 0) errors.push('Stock quantity cannot be negative');
  return errors;
};

export const validatePatient = (patient) => {
  const errors = [];
  if (!patient.name) errors.push('Patient name is required');
  if (!patient.phoneNumber) errors.push('Phone number is required');
  if (patient.phoneNumber && !/^\d{10}$/.test(patient.phoneNumber)) {
    errors.push('Phone number must be 10 digits');
  }
  return errors;
};

export const validateTransaction = (transaction) => {
  const errors = [];
  if (!transaction.items || transaction.items.length === 0) {
    errors.push('Transaction must have at least one item');
  }
  if (transaction.totalAmount <= 0) {
    errors.push('Total amount must be greater than 0');
  }
  if (!transaction.employeeId) {
    errors.push('Employee ID is required');
  }
  return errors;
};
