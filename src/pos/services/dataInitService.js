import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Initialize sample data for pharmacy POS system
export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample pharmacy data...');

    // Sample Medicines - Real Sri Lankan Pharmacy Medicines
    const sampleMedicines = [
      // Common Pain Relief & Fever
      {
        name: 'Panadol Advance',
        genericName: 'Paracetamol',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580001',
        activeIngredient: 'paracetamol',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 200,
        minStockLevel: 50,
        maxStockLevel: 300,
        reorderPoint: 75,
        costPrice: 25.00,
        sellingPrice: 32.00,
        mrp: 35.00,
        discount: 0,
        batchNumber: 'PAN240901',
        manufacturingDate: new Date('2024-06-15'),
        expiryDate: new Date('2026-06-15'),
        storageConditions: 'Store below 30°C',
        sideEffects: ['Nausea', 'Stomach upset'],
        contraindications: ['Severe liver disease'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: '1-2 tablets every 4-6 hours. Max 8 tablets per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'A-1-1',
        vendor: 'Hemas Pharmaceuticals',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Disprin Regular',
        genericName: 'Aspirin',
        manufacturer: 'Reckitt Benckiser',
        barcode: '8999999580002',
        activeIngredient: 'aspirin',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '300mg',
        stockQuantity: 150,
        minStockLevel: 30,
        maxStockLevel: 200,
        reorderPoint: 50,
        costPrice: 18.00,
        sellingPrice: 24.00,
        mrp: 28.00,
        discount: 0,
        batchNumber: 'DIS240902',
        manufacturingDate: new Date('2024-07-01'),
        expiryDate: new Date('2026-07-01'),
        storageConditions: 'Store in cool, dry place',
        sideEffects: ['Stomach irritation', 'Bleeding risk'],
        contraindications: ['Peptic ulcer', 'Children under 16'],
        interactions: [{ ingredient: 'warfarin', severity: 'high' }],
        prescriptionRequired: false,
        dosageInstructions: '1-2 tablets every 4 hours. Max 8 tablets per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'A-1-2',
        vendor: 'Link Natural Products',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Antibiotics
      {
        name: 'Amoxil',
        genericName: 'Amoxicillin',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580003',
        activeIngredient: 'amoxicillin',
        category: 'Antibiotics',
        type: 'Prescription',
        dosageForm: 'Capsule',
        strength: '250mg',
        stockQuantity: 80,
        minStockLevel: 20,
        maxStockLevel: 120,
        reorderPoint: 35,
        costPrice: 85.00,
        sellingPrice: 110.00,
        mrp: 125.00,
        discount: 0,
        batchNumber: 'AMX240903',
        manufacturingDate: new Date('2024-05-20'),
        expiryDate: new Date('2026-05-20'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Diarrhea', 'Nausea', 'Skin rash'],
        contraindications: ['Penicillin allergy'],
        interactions: [{ ingredient: 'warfarin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 capsule 3 times daily for 7 days',
        status: 'active',
        taxRate: 0,
        rackLocation: 'B-2-1',
        vendor: 'State Pharmaceuticals Corporation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Augmentin',
        genericName: 'Amoxicillin + Clavulanic Acid',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580004',
        activeIngredient: 'amoxicillin + clavulanic acid',
        category: 'Antibiotics',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '625mg',
        stockQuantity: 60,
        minStockLevel: 15,
        maxStockLevel: 90,
        reorderPoint: 25,
        costPrice: 145.00,
        sellingPrice: 185.00,
        mrp: 210.00,
        discount: 0,
        batchNumber: 'AUG240904',
        manufacturingDate: new Date('2024-04-10'),
        expiryDate: new Date('2026-04-10'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
        contraindications: ['Penicillin allergy', 'Previous hepatic dysfunction'],
        interactions: [{ ingredient: 'warfarin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 tablet twice daily with meals for 7 days',
        status: 'active',
        taxRate: 0,
        rackLocation: 'B-2-2',
        vendor: 'State Pharmaceuticals Corporation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Stomach & Digestive
      {
        name: 'Omez',
        genericName: 'Omeprazole',
        manufacturer: 'Dr. Reddy\'s Laboratories',
        barcode: '8999999580005',
        activeIngredient: 'omeprazole',
        category: 'Antacids',
        type: 'Prescription',
        dosageForm: 'Capsule',
        strength: '20mg',
        stockQuantity: 100,
        minStockLevel: 25,
        maxStockLevel: 150,
        reorderPoint: 40,
        costPrice: 45.00,
        sellingPrice: 58.00,
        mrp: 65.00,
        discount: 0,
        batchNumber: 'OMZ240905',
        manufacturingDate: new Date('2024-08-05'),
        expiryDate: new Date('2026-08-05'),
        storageConditions: 'Store below 25°C, protect from moisture',
        sideEffects: ['Headache', 'Nausea', 'Diarrhea'],
        contraindications: ['Hypersensitivity to omeprazole'],
        interactions: [{ ingredient: 'clopidogrel', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 capsule daily before breakfast',
        status: 'active',
        taxRate: 0,
        rackLocation: 'C-1-1',
        vendor: 'Cipla Pharmaceuticals',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Eno',
        genericName: 'Sodium Bicarbonate + Citric Acid',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580006',
        activeIngredient: 'sodium bicarbonate',
        category: 'Antacids',
        type: 'OTC',
        dosageForm: 'Powder',
        strength: '5g sachet',
        stockQuantity: 120,
        minStockLevel: 30,
        maxStockLevel: 180,
        reorderPoint: 50,
        costPrice: 12.00,
        sellingPrice: 18.00,
        mrp: 22.00,
        discount: 0,
        batchNumber: 'ENO240906',
        manufacturingDate: new Date('2024-06-30'),
        expiryDate: new Date('2026-06-30'),
        storageConditions: 'Store in dry place',
        sideEffects: ['Bloating', 'Gas'],
        contraindications: ['Severe kidney disease'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: '1 sachet in glass of water when symptoms occur',
        status: 'active',
        taxRate: 0,
        rackLocation: 'C-1-2',
        vendor: 'Link Natural Products',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Cough & Cold
      {
        name: 'Benadryl Cough Formula',
        genericName: 'Dextromethorphan + Phenylephrine',
        manufacturer: 'Johnson & Johnson',
        barcode: '8999999580007',
        activeIngredient: 'dextromethorphan',
        category: 'Cough & Cold',
        type: 'OTC',
        dosageForm: 'Syrup',
        strength: '100ml',
        stockQuantity: 45,
        minStockLevel: 10,
        maxStockLevel: 70,
        reorderPoint: 20,
        costPrice: 65.00,
        sellingPrice: 85.00,
        mrp: 95.00,
        discount: 0,
        batchNumber: 'BEN240907',
        manufacturingDate: new Date('2024-07-15'),
        expiryDate: new Date('2025-12-15'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Drowsiness', 'Dizziness'],
        contraindications: ['Children under 2 years', 'MAOI therapy'],
        interactions: [{ ingredient: 'alcohol', severity: 'moderate' }],
        prescriptionRequired: false,
        dosageInstructions: '5-10ml every 4-6 hours. Max 4 doses per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'D-1-1',
        vendor: 'Hemas Pharmaceuticals',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Panadol Cold & Flu',
        genericName: 'Paracetamol + Phenylephrine + Caffeine',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580008',
        activeIngredient: 'paracetamol + phenylephrine',
        category: 'Cough & Cold',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '500mg + 5mg + 25mg',
        stockQuantity: 75,
        minStockLevel: 20,
        maxStockLevel: 120,
        reorderPoint: 35,
        costPrice: 42.00,
        sellingPrice: 55.00,
        mrp: 62.00,
        discount: 0,
        batchNumber: 'PCF240908',
        manufacturingDate: new Date('2024-05-25'),
        expiryDate: new Date('2026-05-25'),
        storageConditions: 'Store below 30°C',
        sideEffects: ['Drowsiness', 'Dry mouth', 'Nervousness'],
        contraindications: ['Severe heart disease', 'Children under 12'],
        interactions: [{ ingredient: 'MAOIs', severity: 'high' }],
        prescriptionRequired: false,
        dosageInstructions: '1-2 tablets every 4-6 hours. Max 8 tablets per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'D-1-2',
        vendor: 'Link Natural Products',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Vitamins & Supplements
      {
        name: 'Centrum Multivitamin',
        genericName: 'Multivitamin & Mineral Supplement',
        manufacturer: 'Pfizer',
        barcode: '8999999580009',
        activeIngredient: 'multivitamin complex',
        category: 'Vitamins',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '30 tablets',
        stockQuantity: 50,
        minStockLevel: 10,
        maxStockLevel: 80,
        reorderPoint: 20,
        costPrice: 185.00,
        sellingPrice: 245.00,
        mrp: 275.00,
        discount: 0,
        batchNumber: 'CEN240909',
        manufacturingDate: new Date('2024-03-12'),
        expiryDate: new Date('2026-03-12'),
        storageConditions: 'Store in cool, dry place',
        sideEffects: ['Mild nausea if taken on empty stomach'],
        contraindications: ['Iron overload conditions'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: '1 tablet daily with breakfast',
        status: 'active',
        taxRate: 0,
        rackLocation: 'E-1-1',
        vendor: 'Pfizer Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Vitamin C 1000mg',
        genericName: 'Ascorbic Acid',
        manufacturer: 'Blackmores',
        barcode: '8999999580010',
        activeIngredient: 'ascorbic acid',
        category: 'Vitamins',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '1000mg',
        stockQuantity: 80,
        minStockLevel: 15,
        maxStockLevel: 120,
        reorderPoint: 30,
        costPrice: 95.00,
        sellingPrice: 125.00,
        mrp: 145.00,
        discount: 0,
        batchNumber: 'VTC240910',
        manufacturingDate: new Date('2024-04-18'),
        expiryDate: new Date('2026-04-18'),
        storageConditions: 'Store below 25°C, protect from light',
        sideEffects: ['Stomach upset in high doses'],
        contraindications: ['Kidney stones history'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: '1 tablet daily with meal',
        status: 'active',
        taxRate: 0,
        rackLocation: 'E-1-2',
        vendor: 'Hemas Pharmaceuticals',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Diabetes & Blood Pressure
      {
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        manufacturer: 'Cipla',
        barcode: '8999999580011',
        activeIngredient: 'metformin',
        category: 'Diabetes',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 120,
        minStockLevel: 30,
        maxStockLevel: 200,
        reorderPoint: 50,
        costPrice: 38.00,
        sellingPrice: 48.00,
        mrp: 55.00,
        discount: 0,
        batchNumber: 'MET240911',
        manufacturingDate: new Date('2024-07-08'),
        expiryDate: new Date('2026-07-08'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        contraindications: ['Severe kidney disease', 'Diabetic ketoacidosis'],
        interactions: [{ ingredient: 'alcohol', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1-2 tablets twice daily with meals',
        status: 'active',
        taxRate: 0,
        rackLocation: 'F-1-1',
        vendor: 'State Pharmaceuticals Corporation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate',
        manufacturer: 'Pfizer',
        barcode: '8999999580012',
        activeIngredient: 'amlodipine',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '5mg',
        stockQuantity: 90,
        minStockLevel: 25,
        maxStockLevel: 150,
        reorderPoint: 40,
        costPrice: 28.00,
        sellingPrice: 38.00,
        mrp: 45.00,
        discount: 0,
        batchNumber: 'AML240912',
        manufacturingDate: new Date('2024-06-22'),
        expiryDate: new Date('2026-06-22'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Ankle swelling', 'Dizziness', 'Fatigue'],
        contraindications: ['Cardiogenic shock', 'Severe aortic stenosis'],
        interactions: [{ ingredient: 'simvastatin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 tablet daily, preferably at same time',
        status: 'active',
        taxRate: 0,
        rackLocation: 'F-1-2',
        vendor: 'Pfizer Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Skin Care
      {
        name: 'Betnovate Cream',
        genericName: 'Betamethasone Valerate',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580013',
        activeIngredient: 'betamethasone',
        category: 'Topical',
        type: 'Prescription',
        dosageForm: 'Cream',
        strength: '0.1% w/w',
        stockQuantity: 40,
        minStockLevel: 10,
        maxStockLevel: 60,
        reorderPoint: 15,
        costPrice: 75.00,
        sellingPrice: 95.00,
        mrp: 110.00,
        discount: 0,
        batchNumber: 'BET240913',
        manufacturingDate: new Date('2024-05-15'),
        expiryDate: new Date('2026-05-15'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Skin thinning with prolonged use', 'Local irritation'],
        contraindications: ['Viral skin infections', 'Rosacea'],
        interactions: [],
        prescriptionRequired: true,
        dosageInstructions: 'Apply thin layer 2-3 times daily for maximum 2 weeks',
        status: 'active',
        taxRate: 0,
        rackLocation: 'G-1-1',
        vendor: 'Link Natural Products',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Eye Care
      {
        name: 'Refresh Tears',
        genericName: 'Carboxymethylcellulose Sodium',
        manufacturer: 'Allergan',
        barcode: '8999999580014',
        activeIngredient: 'carboxymethylcellulose',
        category: 'Eye Care',
        type: 'OTC',
        dosageForm: 'Eye Drops',
        strength: '0.5% w/v',
        stockQuantity: 35,
        minStockLevel: 8,
        maxStockLevel: 50,
        reorderPoint: 12,
        costPrice: 145.00,
        sellingPrice: 185.00,
        mrp: 210.00,
        discount: 0,
        batchNumber: 'REF240914',
        manufacturingDate: new Date('2024-08-10'),
        expiryDate: new Date('2025-12-10'),
        storageConditions: 'Store below 25°C, do not freeze',
        sideEffects: ['Temporary blurred vision', 'Mild eye irritation'],
        contraindications: ['Hypersensitivity to any component'],
        interactions: [],
        prescriptionRequired: false,
        dosageInstructions: '1-2 drops in affected eye(s) as needed',
        status: 'active',
        taxRate: 0,
        rackLocation: 'H-1-1',
        vendor: 'Hemas Pharmaceuticals',
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
