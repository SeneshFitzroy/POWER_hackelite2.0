import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Initialize sample data for pharmacy POS system
export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample pharmacy data...');

    // Sample Medicines
    const sampleMedicines = [
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        manufacturer: 'Glaxo Pharma',
        barcode: '1234567890123',
        activeIngredient: 'paracetamol',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 150,
        minStockLevel: 20,
        maxStockLevel: 200,
        reorderPoint: 30,
        costPrice: 5.50,
        sellingPrice: 8.00,
        mrp: 10.00,
        discount: 0,
        batchNumber: 'PAR001',
        manufacturingDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        storageConditions: 'Store in cool, dry place',
        sideEffects: ['Nausea', 'Stomach upset'],
        contraindications: ['Severe liver disease'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: 'Take 1-2 tablets every 4-6 hours as needed',
        status: 'active',
        taxRate: 18,
        rackLocation: 'A-1-5',
        vendor: 'Pharma Distributors Ltd',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        manufacturer: 'Cipla Ltd',
        barcode: '2345678901234',
        activeIngredient: 'amoxicillin',
        category: 'Antibiotics',
        type: 'Prescription',
        dosageForm: 'Capsule',
        strength: '250mg',
        stockQuantity: 80,
        minStockLevel: 15,
        maxStockLevel: 100,
        reorderPoint: 25,
        costPrice: 12.00,
        sellingPrice: 18.00,
        mrp: 22.00,
        discount: 0,
        batchNumber: 'AMX002',
        manufacturingDate: new Date('2024-03-10'),
        expiryDate: new Date('2026-03-10'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Diarrhea', 'Nausea', 'Skin rash'],
        contraindications: ['Penicillin allergy'],
        interactions: [{ ingredient: 'warfarin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: 'Take one capsule three times daily with food',
        status: 'active',
        taxRate: 18,
        rackLocation: 'B-2-3',
        vendor: 'Medical Supply Co',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        manufacturer: 'Bayer Healthcare',
        barcode: '3456789012345',
        activeIngredient: 'aspirin',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '75mg',
        stockQuantity: 200,
        minStockLevel: 25,
        maxStockLevel: 300,
        reorderPoint: 40,
        costPrice: 3.50,
        sellingPrice: 6.00,
        mrp: 8.00,
        discount: 0,
        batchNumber: 'ASP003',
        manufacturingDate: new Date('2024-02-20'),
        expiryDate: new Date('2026-02-20'),
        storageConditions: 'Store in cool, dry place',
        sideEffects: ['Stomach irritation', 'Bleeding'],
        contraindications: ['Stomach ulcers', 'Bleeding disorders'],
        interactions: [{ ingredient: 'warfarin', severity: 'high' }],
        prescriptionRequired: false,
        dosageInstructions: 'Take one tablet daily with food',
        status: 'active',
        taxRate: 18,
        rackLocation: 'A-1-8',
        vendor: 'Pharma Distributors Ltd',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        manufacturer: 'Dr. Reddy\'s',
        barcode: '4567890123456',
        activeIngredient: 'omeprazole',
        category: 'Antacids',
        type: 'Prescription',
        dosageForm: 'Capsule',
        strength: '20mg',
        stockQuantity: 120,
        minStockLevel: 20,
        maxStockLevel: 150,
        reorderPoint: 30,
        costPrice: 8.00,
        sellingPrice: 12.50,
        mrp: 15.00,
        discount: 0,
        batchNumber: 'OME004',
        manufacturingDate: new Date('2024-04-05'),
        expiryDate: new Date('2026-04-05'),
        storageConditions: 'Store below 25°C, protect from moisture',
        sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
        contraindications: ['Severe liver disease'],
        interactions: [],
        prescriptionRequired: true,
        dosageInstructions: 'Take one capsule daily before breakfast',
        status: 'active',
        taxRate: 18,
        rackLocation: 'C-1-2',
        vendor: 'Medical Supply Co',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan HBr',
        manufacturer: 'Abbott Healthcare',
        barcode: '5678901234567',
        activeIngredient: 'dextromethorphan',
        category: 'Cough & Cold',
        type: 'OTC',
        dosageForm: 'Syrup',
        strength: '15mg/5ml',
        stockQuantity: 45,
        minStockLevel: 10,
        maxStockLevel: 60,
        reorderPoint: 15,
        costPrice: 15.00,
        sellingPrice: 22.00,
        mrp: 25.00,
        discount: 0,
        batchNumber: 'CSY005',
        manufacturingDate: new Date('2024-01-30'),
        expiryDate: new Date('2025-12-30'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Drowsiness', 'Dizziness'],
        contraindications: ['Children under 2 years'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: 'Take 5-10ml every 4-6 hours as needed',
        status: 'active',
        taxRate: 18,
        rackLocation: 'D-3-1',
        vendor: 'Healthcare Suppliers',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Sample Employees
    const sampleEmployees = [
      {
        employeeId: 'EMP001',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@pharmacy.com',
        phone: '0771234567',
        role: 'pharmacist',
        permissions: ['view_medicines', 'sell_prescription', 'verify_sales', 'manage_inventory'],
        pharmacistLicense: 'PH001234',
        department: 'pharmacy',
        shift: 'day',
        salary: 75000,
        joiningDate: new Date('2023-01-15'),
        status: 'active',
        address: {
          street: '123 Medical Street',
          city: 'Colombo',
          state: 'Western',
          postalCode: '00100',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'John Johnson',
          phone: '0779876543',
          relationship: 'spouse'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        employeeId: 'EMP002',
        name: 'Michael Chen',
        email: 'michael.chen@pharmacy.com',
        phone: '0772345678',
        role: 'cashier',
        permissions: ['view_medicines', 'process_sales'],
        pharmacistLicense: '',
        department: 'pharmacy',
        shift: 'day',
        salary: 45000,
        joiningDate: new Date('2023-06-01'),
        status: 'active',
        address: {
          street: '456 Commerce Road',
          city: 'Kandy',
          state: 'Central',
          postalCode: '20000',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '0778765432',
          relationship: 'sister'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Sample Patients
    const samplePatients = [
      {
        name: 'John Doe',
        phoneNumber: '0771111111',
        alternatePhone: '',
        email: 'john.doe@email.com',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        address: {
          street: '789 Main Street',
          city: 'Colombo',
          state: 'Western',
          postalCode: '00200',
          country: 'Sri Lanka'
        },
        allergies: ['Penicillin'],
        medicalConditions: ['Hypertension'],
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '0772222222',
          relationship: 'spouse'
        },
        insuranceProvider: 'Lanka Insurance',
        insuranceNumber: 'LI123456789',
        insuranceCoverage: 80,
        totalPurchases: 1250.00,
        totalVisits: 15,
        lastVisit: serverTimestamp(),
        loyaltyPoints: 125,
        prescriptions: [],
        status: 'active',
        consentForMarketing: true,
        dataPrivacyConsent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Mary Smith',
        phoneNumber: '0773333333',
        alternatePhone: '0114567890',
        email: 'mary.smith@email.com',
        dateOfBirth: new Date('1990-08-20'),
        gender: 'Female',
        address: {
          street: '321 Garden Road',
          city: 'Galle',
          state: 'Southern',
          postalCode: '80000',
          country: 'Sri Lanka'
        },
        allergies: [],
        medicalConditions: ['Diabetes Type 2'],
        bloodGroup: 'A+',
        emergencyContact: {
          name: 'David Smith',
          phone: '0774444444',
          relationship: 'husband'
        },
        insuranceProvider: '',
        insuranceNumber: '',
        insuranceCoverage: 0,
        totalPurchases: 850.00,
        totalVisits: 8,
        lastVisit: serverTimestamp(),
        loyaltyPoints: 85,
        prescriptions: [],
        status: 'active',
        consentForMarketing: false,
        dataPrivacyConsent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Sample Pharmacy Registration
    const pharmacyRegistration = {
      registrationNumber: 'PH-2024-001',
      pharmacyName: 'CoreERP Pharmacy',
      ownerName: 'Dr. Sarah Johnson',
      licenseNumber: 'LIC123456',
      address: {
        street: '100 Health Avenue',
        city: 'Colombo',
        state: 'Western',
        postalCode: '00300',
        country: 'Sri Lanka'
      },
      phone: '0112345678',
      email: 'info@coreerp-pharmacy.com',
      status: 'active',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-12-31'),
      renewalDate: new Date('2024-01-01'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add medicines to Firestore
    console.log('Adding sample medicines...');
    for (const medicine of sampleMedicines) {
      await addDoc(collection(db, 'medicines'), medicine);
    }

    // Add employees to Firestore
    console.log('Adding sample employees...');
    for (const employee of sampleEmployees) {
      await addDoc(collection(db, 'employees'), employee);
    }

    // Add patients to Firestore
    console.log('Adding sample patients...');
    for (const patient of samplePatients) {
      await addDoc(collection(db, 'patients'), patient);
    }

    // Add pharmacy registration
    console.log('Adding pharmacy registration...');
    await setDoc(doc(db, 'pharmacyRegistrations', 'main'), pharmacyRegistration);

    // Initialize daily sales document for today
    const today = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'dailySales', today), {
      date: today,
      totalSales: 0,
      transactionCount: 0,
      prescriptionCount: 0,
      otcCount: 0,
      cashSales: 0,
      cardSales: 0,
      insuranceSales: 0,
      refundAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      topSellingMedicines: [],
      employeeSales: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Sample data initialization completed successfully!');
    return { success: true, message: 'Sample data initialized successfully' };

  } catch (error) {
    console.error('Error initializing sample data:', error);
    return { success: false, message: error.message };
  }
};

// Function to clear all data (for testing purposes)
export const clearAllData = async () => {
  try {
    console.log('This function would clear all data. Implementation depends on Firebase Admin SDK.');
    // Note: Clearing collections requires Firebase Admin SDK or manual deletion
    // This is just a placeholder for the structure
    return { success: true, message: 'Data clearing completed' };
  } catch (error) {
    console.error('Error clearing data:', error);
    return { success: false, message: error.message };
  }
};
