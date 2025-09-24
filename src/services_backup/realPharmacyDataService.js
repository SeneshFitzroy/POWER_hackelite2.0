import { collection, addDoc, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * COMPREHENSIVE REAL PHARMACY ERP DATA SERVICE
 * 
 * This service replaces ALL hardcoded data with realistic Sri Lankan pharmacy data
 * Includes: Inventory, POS, Sales, HR, Finance, Suppliers, Customers
 * 
 * @author CoreERP Development Team
 * @version 2.0
 * @date September 2024
 */

// Real Pharmacy ERP Data Initialization Service
export const initializeRealPharmacyData = async () => {
  try {
    console.log('🏥 Initializing Comprehensive Real Pharmacy ERP Data...');
    
    const batch = writeBatch(db);
    let batchCount = 0;
    
    // Helper function to manage batch writes safely
    const addToBatch = async (ref, data) => {
      batch.set(ref, data);
      batchCount++;
      
      if (batchCount >= 450) { // Firebase batch limit is 500, keeping buffer
        await batch.commit();
        console.log(`✅ Committed batch of ${batchCount} records`);
        batchCount = 0;
      }
    };

    // 1. COMPREHENSIVE REAL MEDICINES DATABASE (Sri Lankan Pharmacy Standards)
    const realMedicines = [
      // === CARDIOVASCULAR MEDICATIONS ===
      {
        name: 'Amlodipine Besylate 5mg',
        genericName: 'Amlodipine',
        manufacturer: 'State Pharmaceuticals Corporation',
        barcode: '4710001234567',
        activeIngredient: 'Amlodipine Besylate 5mg',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '5mg',
        stockQuantity: 1250,
        minStockLevel: 150,
        maxStockLevel: 2000,
        reorderPoint: 300,
        costPrice: 3.25,
        sellingPrice: 5.50,
        mrp: 6.50,
        discount: 0,
        batchNumber: 'AML2024001',
        manufacturingDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        storageConditions: 'Store below 30°C, protect from light and moisture',
        sideEffects: ['Peripheral edema', 'Dizziness', 'Fatigue', 'Flushing', 'Palpitations'],
        contraindications: ['Cardiogenic shock', 'Severe aortic stenosis', 'Unstable angina'],
        interactions: [
          { ingredient: 'simvastatin', severity: 'moderate', description: 'May increase simvastatin plasma levels' },
          { ingredient: 'digoxin', severity: 'mild', description: 'Monitor digoxin levels' },
          { ingredient: 'cyclosporine', severity: 'moderate', description: 'May increase cyclosporine levels' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take one tablet daily, preferably at the same time each day, with or without food',
        status: 'active',
        taxRate: 0, // Essential medicines are VAT exempt in Sri Lanka
        rackLocation: 'CV-A1-05',
        vendor: 'State Pharmaceuticals Corporation',
        supplierCode: 'SPC001',
        regulatoryInfo: {
          nmraRegistration: 'MD24568',
          scheduledDrug: false,
          controlledSubstance: false,
          importLicense: 'IL2024001'
        },
        pharmacokinetics: {
          absorption: 'Slowly absorbed after oral administration',
          bioavailability: '64-90%',
          halfLife: '30-50 hours',
          metabolism: 'Hepatic'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        name: 'Atorvastatin Calcium 20mg',
        genericName: 'Atorvastatin',
        manufacturer: 'Pfizer (Pvt) Ltd',
        barcode: '4710001234568',
        activeIngredient: 'Atorvastatin Calcium 20mg',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '20mg',
        stockQuantity: 850,
        minStockLevel: 100,
        maxStockLevel: 1200,
        reorderPoint: 200,
        costPrice: 12.75,
        sellingPrice: 18.50,
        mrp: 22.00,
        discount: 0,
        batchNumber: 'ATO2024002',
        manufacturingDate: new Date('2024-02-10'),
        expiryDate: new Date('2026-02-10'),
        storageConditions: 'Store below 25°C, protect from moisture and light',
        sideEffects: ['Muscle pain', 'Headache', 'Gastrointestinal upset', 'Fatigue', 'Liver enzyme elevation'],
        contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding', 'Unexplained persistent elevations of serum transaminases'],
        interactions: [
          { ingredient: 'warfarin', severity: 'high', description: 'May increase bleeding risk - monitor INR' },
          { ingredient: 'cyclosporine', severity: 'high', description: 'Increases risk of myopathy and rhabdomyolysis' },
          { ingredient: 'gemfibrozil', severity: 'high', description: 'Increased risk of muscle toxicity' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take one tablet daily in the evening with or without food. Avoid grapefruit juice.',
        status: 'active',
        taxRate: 15,
        rackLocation: 'CV-A2-03',
        vendor: 'Pfizer Lanka (Pvt) Ltd',
        supplierCode: 'PFZ001',
        regulatoryInfo: {
          nmraRegistration: 'MD25469',
          scheduledDrug: false,
          controlledSubstance: false,
          importLicense: 'IL2024002'
        },
        pharmacokinetics: {
          absorption: 'Rapidly absorbed',
          bioavailability: '14%',
          halfLife: '14 hours',
          metabolism: 'Hepatic via CYP3A4'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        name: 'Losartan Potassium 50mg',
        genericName: 'Losartan',
        manufacturer: 'Cipla Limited',
        barcode: '4710001234569',
        activeIngredient: 'Losartan Potassium 50mg',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '50mg',
        stockQuantity: 950,
        minStockLevel: 120,
        maxStockLevel: 1500,
        reorderPoint: 250,
        costPrice: 8.50,
        sellingPrice: 13.75,
        mrp: 16.00,
        discount: 0,
        batchNumber: 'LOS2024003',
        manufacturingDate: new Date('2024-03-05'),
        expiryDate: new Date('2026-03-05'),
        storageConditions: 'Store below 30°C, protect from moisture',
        sideEffects: ['Dizziness', 'Upper respiratory tract infection', 'Fatigue', 'Hyperkalemia'],
        contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Severe hepatic impairment'],
        interactions: [
          { ingredient: 'lithium', severity: 'moderate', description: 'May increase lithium levels' },
          { ingredient: 'potassium supplements', severity: 'moderate', description: 'Risk of hyperkalemia' },
          { ingredient: 'NSAIDs', severity: 'moderate', description: 'May reduce antihypertensive effect' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take once daily with or without food, preferably at the same time each day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'CV-A3-08',
        vendor: 'Cipla Lanka (Pvt) Ltd',
        supplierCode: 'CIP001',
        regulatoryInfo: {
          nmraRegistration: 'MD26789',
          scheduledDrug: false,
          controlledSubstance: false,
          importLicense: 'IL2024003'
        },
        pharmacokinetics: {
          absorption: 'Well absorbed',
          bioavailability: '33%',
          halfLife: '2 hours (6-9 hours for active metabolite)',
          metabolism: 'Hepatic'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // === ANTIDIABETIC MEDICATIONS ===
      {
        name: 'Metformin HCl 500mg',
        genericName: 'Metformin Hydrochloride',
        manufacturer: 'Link Natural Products (Pvt) Ltd',
        barcode: '4710001234570',
        activeIngredient: 'Metformin Hydrochloride 500mg',
        category: 'Antidiabetic',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 2400,
        minStockLevel: 300,
        maxStockLevel: 3000,
        reorderPoint: 600,
        costPrice: 1.85,
        sellingPrice: 3.25,
        mrp: 4.00,
        discount: 0,
        batchNumber: 'MET2024004',
        manufacturingDate: new Date('2024-03-05'),
        expiryDate: new Date('2026-03-05'),
        storageConditions: 'Store below 30°C, protect from moisture',
        sideEffects: ['Gastrointestinal upset', 'Diarrhea', 'Nausea', 'Metallic taste', 'Lactic acidosis (rare)'],
        contraindications: ['Renal impairment (eGFR <30)', 'Liver disease', 'Heart failure', 'Severe dehydration'],
        interactions: [
          { ingredient: 'contrast agents', severity: 'high', description: 'Risk of lactic acidosis - discontinue before procedure' },
          { ingredient: 'alcohol', severity: 'moderate', description: 'Increased risk of lactic acidosis' },
          { ingredient: 'furosemide', severity: 'moderate', description: 'May increase metformin levels' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take with meals to reduce gastrointestinal side effects. Start with low dose and gradually increase.',
        status: 'active',
        taxRate: 0,
        rackLocation: 'DM-B1-08',
        vendor: 'Link Natural Products (Pvt) Ltd',
        supplierCode: 'LNP001',
        regulatoryInfo: {
          nmraRegistration: 'MD20145',
          scheduledDrug: false,
          controlledSubstance: false,
          importLicense: 'IL2024004'
        },
        pharmacokinetics: {
          absorption: 'Slowly and incompletely absorbed',
          bioavailability: '50-60%',
          halfLife: '6.2 hours',
          metabolism: 'Not metabolized'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        name: 'Glimepiride 2mg',
        genericName: 'Glimepiride',
        manufacturer: 'Sanofi-Aventis',
        barcode: '4710001234571',
        activeIngredient: 'Glimepiride 2mg',
        category: 'Antidiabetic',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '2mg',
        stockQuantity: 680,
        minStockLevel: 80,
        maxStockLevel: 1000,
        reorderPoint: 160,
        costPrice: 6.25,
        sellingPrice: 9.75,
        mrp: 12.00,
        discount: 0,
        batchNumber: 'GLI2024005',
        manufacturingDate: new Date('2024-01-20'),
        expiryDate: new Date('2025-12-20'),
        storageConditions: 'Store below 25°C, protect from moisture and light',
        sideEffects: ['Hypoglycemia', 'Weight gain', 'Nausea', 'Dizziness', 'Skin reactions'],
        contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis', 'Severe renal/hepatic impairment'],
        interactions: [
          { ingredient: 'warfarin', severity: 'moderate', description: 'May enhance anticoagulant effect' },
          { ingredient: 'fluconazole', severity: 'moderate', description: 'May increase glimepiride levels' },
          { ingredient: 'rifampin', severity: 'moderate', description: 'May decrease glimepiride effectiveness' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take once daily with breakfast or first main meal. Monitor blood glucose regularly.',
        status: 'active',
        taxRate: 0,
        rackLocation: 'DM-B2-05',
        vendor: 'Sanofi Lanka (Pvt) Ltd',
        supplierCode: 'SNF001',
        regulatoryInfo: {
          nmraRegistration: 'MD22456',
          scheduledDrug: false,
          controlledSubstance: false,
          importLicense: 'IL2024005'
        },
        pharmacokinetics: {
          absorption: 'Completely absorbed',
          bioavailability: '100%',
          halfLife: '5-8 hours',
          metabolism: 'Hepatic'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      
      {
        name: 'Atorvastatin Calcium',
        genericName: 'Atorvastatin',
        manufacturer: 'Cipla Limited',
        barcode: '4710001234568',
        activeIngredient: 'atorvastatin calcium',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '20mg',
        stockQuantity: 300,
        minStockLevel: 40,
        maxStockLevel: 600,
        reorderPoint: 80,
        costPrice: 8.75,
        sellingPrice: 15.50,
        mrp: 18.00,
        discount: 0,
        batchNumber: 'ATO2024002',
        manufacturingDate: new Date('2024-02-10'),
        expiryDate: new Date('2026-02-10'),
        storageConditions: 'Store below 25°C, protect from moisture',
        sideEffects: ['Muscle pain', 'Headache', 'Gastrointestinal upset', 'Fatigue'],
        contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding'],
        interactions: [
          { ingredient: 'warfarin', severity: 'high', description: 'May increase bleeding risk' },
          { ingredient: 'cyclosporine', severity: 'high', description: 'Increases risk of myopathy' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take one tablet daily in the evening with or without food',
        status: 'active',
        taxRate: 15,
        rackLocation: 'CV-A2-03',
        vendor: 'Cipla Lanka (Pvt) Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD25469',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Diabetes Medicines
      {
        name: 'Metformin Hydrochloride',
        genericName: 'Metformin HCl',
        manufacturer: 'Link Natural Products (Pvt) Ltd',
        barcode: '4710001234569',
        activeIngredient: 'metformin hydrochloride',
        category: 'Antidiabetic',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 800,
        minStockLevel: 100,
        maxStockLevel: 1500,
        reorderPoint: 200,
        costPrice: 1.25,
        sellingPrice: 2.50,
        mrp: 3.00,
        discount: 0,
        batchNumber: 'MET2024003',
        manufacturingDate: new Date('2024-03-05'),
        expiryDate: new Date('2026-03-05'),
        storageConditions: 'Store below 30°C, protect from moisture',
        sideEffects: ['Gastrointestinal upset', 'Diarrhea', 'Nausea', 'Metallic taste'],
        contraindications: ['Renal impairment', 'Liver disease', 'Heart failure'],
        interactions: [
          { ingredient: 'contrast agents', severity: 'high', description: 'Risk of lactic acidosis' },
          { ingredient: 'alcohol', severity: 'moderate', description: 'Increased risk of lactic acidosis' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take with meals to reduce gastrointestinal side effects',
        status: 'active',
        taxRate: 0,
        rackLocation: 'DM-B1-08',
        vendor: 'Link Natural Products (Pvt) Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD20145',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Antibiotics
      {
        name: 'Amoxicillin + Clavulanic Acid',
        genericName: 'Co-amoxiclav',
        manufacturer: 'GlaxoSmithKline',
        barcode: '4710001234570',
        activeIngredient: 'amoxicillin + clavulanic acid',
        category: 'Antibiotics',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '625mg',
        stockQuantity: 200,
        minStockLevel: 30,
        maxStockLevel: 400,
        reorderPoint: 60,
        costPrice: 18.50,
        sellingPrice: 28.75,
        mrp: 32.00,
        discount: 0,
        batchNumber: 'AUG2024004',
        manufacturingDate: new Date('2024-01-20'),
        expiryDate: new Date('2025-12-20'),
        storageConditions: 'Store below 25°C, protect from moisture',
        sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Abdominal pain'],
        contraindications: ['Penicillin allergy', 'History of cholestatic jaundice'],
        interactions: [
          { ingredient: 'warfarin', severity: 'moderate', description: 'May enhance anticoagulant effect' },
          { ingredient: 'oral contraceptives', severity: 'mild', description: 'May reduce contraceptive efficacy' }
        ],
        prescriptionRequired: true,
        dosageInstructions: 'Take with food every 8-12 hours as prescribed',
        status: 'active',
        taxRate: 15,
        rackLocation: 'AB-C1-12',
        vendor: 'GlaxoSmithKline Lanka Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD18567',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Pain Relief
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        manufacturer: 'Hemas Pharmaceuticals (Pvt) Ltd',
        barcode: '4710001234571',
        activeIngredient: 'paracetamol',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '500mg',
        stockQuantity: 1000,
        minStockLevel: 150,
        maxStockLevel: 2000,
        reorderPoint: 300,
        costPrice: 0.75,
        sellingPrice: 1.50,
        mrp: 2.00,
        discount: 0,
        batchNumber: 'PCM2024005',
        manufacturingDate: new Date('2024-04-01'),
        expiryDate: new Date('2026-04-01'),
        storageConditions: 'Store below 30°C, protect from moisture',
        sideEffects: ['Rare: Skin rash', 'Hepatotoxicity with overdose'],
        contraindications: ['Severe liver disease', 'Acute hepatic failure'],
        interactions: [
          { ingredient: 'warfarin', severity: 'moderate', description: 'May enhance anticoagulant effect with prolonged use' },
          { ingredient: 'alcohol', severity: 'moderate', description: 'Increased risk of hepatotoxicity' }
        ],
        prescriptionRequired: false,
        dosageInstructions: 'Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours',
        status: 'active',
        taxRate: 15,
        rackLocation: 'AN-A1-01',
        vendor: 'Hemas Pharmaceuticals (Pvt) Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD10234',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Respiratory
      {
        name: 'Salbutamol Inhaler',
        genericName: 'Salbutamol',
        manufacturer: 'Astra Zeneca',
        barcode: '4710001234572',
        activeIngredient: 'salbutamol sulfate',
        category: 'Respiratory',
        type: 'Prescription',
        dosageForm: 'MDI',
        strength: '100mcg/dose',
        stockQuantity: 75,
        minStockLevel: 15,
        maxStockLevel: 150,
        reorderPoint: 30,
        costPrice: 285.00,
        sellingPrice: 420.00,
        mrp: 450.00,
        discount: 0,
        batchNumber: 'VEN2024006',
        manufacturingDate: new Date('2024-02-15'),
        expiryDate: new Date('2025-11-15'),
        storageConditions: 'Store below 30°C, do not freeze, protect from direct sunlight',
        sideEffects: ['Tremor', 'Palpitations', 'Headache', 'Muscle cramps'],
        contraindications: ['Hypersensitivity to salbutamol'],
        interactions: [
          { ingredient: 'beta-blockers', severity: 'high', description: 'May antagonize bronchodilator effect' },
          { ingredient: 'digoxin', severity: 'moderate', description: 'May reduce digoxin levels' }
        ],
        prescriptionRequired: true,
        dosageInstructions: '1-2 puffs as needed for bronchospasm, maximum 8 puffs per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'RS-D1-05',
        vendor: 'AstraZeneca Lanka (Pvt) Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD22345',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Vitamins & Supplements
      {
        name: 'Vitamin D3',
        genericName: 'Cholecalciferol',
        manufacturer: 'Softlogic Pharmaceuticals',
        barcode: '4710001234573',
        activeIngredient: 'cholecalciferol',
        category: 'Vitamins',
        type: 'OTC',
        dosageForm: 'Capsule',
        strength: '1000 IU',
        stockQuantity: 250,
        minStockLevel: 40,
        maxStockLevel: 500,
        reorderPoint: 80,
        costPrice: 4.25,
        sellingPrice: 7.50,
        mrp: 9.00,
        discount: 0,
        batchNumber: 'VTD2024007',
        manufacturingDate: new Date('2024-03-10'),
        expiryDate: new Date('2026-03-10'),
        storageConditions: 'Store below 25°C, protect from light and moisture',
        sideEffects: ['Rare: Hypercalcemia with excessive doses'],
        contraindications: ['Hypercalcemia', 'Kidney stones'],
        interactions: [
          { ingredient: 'thiazide diuretics', severity: 'moderate', description: 'May increase calcium levels' }
        ],
        prescriptionRequired: false,
        dosageInstructions: 'Take one capsule daily with food',
        status: 'active',
        taxRate: 15,
        rackLocation: 'VT-E1-03',
        vendor: 'Softlogic Pharmaceuticals (Pvt) Ltd',
        regulatoryInfo: {
          nmraRegistration: 'MD19876',
          scheduledDrug: false,
          controlledSubstance: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // 2. REAL EMPLOYEES DATA (Typical Sri Lankan Pharmacy Staff)
    const realEmployees = [
      {
        employeeId: 'PH001',
        name: 'Dr. Niranjala Wickramasinghe',
        email: 'niranjala.w@coreerp-pharmacy.lk',
        phone: '+94771234567',
        role: 'chief_pharmacist',
        permissions: [
          'view_medicines', 'sell_prescription', 'verify_sales', 'manage_inventory',
          'manage_employees', 'financial_reports', 'regulatory_compliance'
        ],
        pharmacistLicense: 'NMRA/PH/2019/1234',
        licenseExpiry: new Date('2025-12-31'),
        department: 'pharmacy',
        shift: 'day',
        baseSalary: 125000,
        allowances: {
          transport: 15000,
          medical: 5000,
          professional: 10000
        },
        joiningDate: new Date('2019-03-15'),
        status: 'active',
        qualifications: [
          'B.Pharm - University of Colombo',
          'Certificate in Clinical Pharmacy'
        ],
        address: {
          street: '45/7 Galle Road',
          city: 'Colombo 03',
          district: 'Colombo',
          province: 'Western',
          postalCode: '00300',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Sunil Wickramasinghe',
          phone: '+94712345678',
          relationship: 'Husband'
        },
        bankDetails: {
          bank: 'Commercial Bank of Ceylon',
          branch: 'Kollupitiya',
          accountNumber: '8001234567',
          accountName: 'Dr. Niranjala Wickramasinghe'
        },
        taxInfo: {
          tinNumber: 'T123456789',
          payeeTaxRate: 18
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        employeeId: 'PH002',
        name: 'Kasun Perera',
        email: 'kasun.p@coreerp-pharmacy.lk',
        phone: '+94772345678',
        role: 'pharmacist',
        permissions: [
          'view_medicines', 'sell_prescription', 'verify_sales', 'manage_inventory'
        ],
        pharmacistLicense: 'NMRA/PH/2021/5678',
        licenseExpiry: new Date('2025-08-31'),
        department: 'pharmacy',
        shift: 'evening',
        baseSalary: 85000,
        allowances: {
          transport: 12000,
          medical: 5000,
          shift: 8000
        },
        joiningDate: new Date('2021-08-01'),
        status: 'active',
        qualifications: [
          'B.Pharm - University of Peradeniya'
        ],
        address: {
          street: '123 Kandy Road',
          city: 'Maharagama',
          district: 'Colombo',
          province: 'Western',
          postalCode: '10280',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Mangala Perera',
          phone: '+94773456789',
          relationship: 'Mother'
        },
        bankDetails: {
          bank: 'Bank of Ceylon',
          branch: 'Maharagama',
          accountNumber: '7001234567',
          accountName: 'K M Kasun Perera'
        },
        taxInfo: {
          tinNumber: 'T234567890',
          payeeTaxRate: 12
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        employeeId: 'CS001',
        name: 'Sanduni Fernando',
        email: 'sanduni.f@coreerp-pharmacy.lk',
        phone: '+94773456789',
        role: 'cashier',
        permissions: [
          'view_medicines', 'process_sales', 'handle_payments'
        ],
        pharmacistLicense: '',
        licenseExpiry: null,
        department: 'sales',
        shift: 'day',
        baseSalary: 45000,
        allowances: {
          transport: 8000,
          medical: 3000
        },
        joiningDate: new Date('2022-11-15'),
        status: 'active',
        qualifications: [
          'Diploma in Pharmaceutical Technology - NIBM'
        ],
        address: {
          street: '67 Temple Road',
          city: 'Nugegoda',
          district: 'Colombo',
          province: 'Western',
          postalCode: '10250',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Chaminda Fernando',
          phone: '+94774567890',
          relationship: 'Father'
        },
        bankDetails: {
          bank: 'Hatton National Bank',
          branch: 'Nugegoda',
          accountNumber: '9001234567',
          accountName: 'W A Sanduni Fernando'
        },
        taxInfo: {
          tinNumber: 'T345678901',
          payeeTaxRate: 6
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        employeeId: 'ST001',
        name: 'Ravindu Silva',
        email: 'ravindu.s@coreerp-pharmacy.lk',
        phone: '+94774567890',
        role: 'store_keeper',
        permissions: [
          'view_medicines', 'manage_inventory', 'receive_stock', 'stock_adjustments'
        ],
        pharmacistLicense: '',
        licenseExpiry: null,
        department: 'inventory',
        shift: 'day',
        baseSalary: 40000,
        allowances: {
          transport: 7000,
          medical: 3000
        },
        joiningDate: new Date('2023-02-01'),
        status: 'active',
        qualifications: [
          'Certificate in Inventory Management'
        ],
        address: {
          street: '234 High Level Road',
          city: 'Kottawa',
          district: 'Colombo',
          province: 'Western',
          postalCode: '10230',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Kumari Silva',
          phone: '+94775678901',
          relationship: 'Wife'
        },
        bankDetails: {
          bank: 'Sampath Bank',
          branch: 'Kottawa',
          accountNumber: '6001234567',
          accountName: 'R P Ravindu Silva'
        },
        taxInfo: {
          tinNumber: 'T456789012',
          payeeTaxRate: 6
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // 3. REAL CUSTOMERS/PATIENTS DATA
    const realCustomers = [
      {
        customerId: 'CUS001',
        name: 'Mrs. Kamala Jayasekara',
        phoneNumber: '+94771111111',
        alternatePhone: '+94112345678',
        email: 'kamala.j@gmail.com',
        dateOfBirth: new Date('1975-08-15'),
        gender: 'Female',
        address: {
          street: '15/3 Baseline Road',
          city: 'Colombo 09',
          district: 'Colombo',
          province: 'Western',
          postalCode: '00900',
          country: 'Sri Lanka'
        },
        allergies: ['Sulfonamides', 'Aspirin'],
        medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
        bloodGroup: 'B+',
        emergencyContact: {
          name: 'Sunil Jayasekara',
          phone: '+94772222222',
          relationship: 'Husband'
        },
        insuranceProvider: 'Ceylinco Healthcare',
        insuranceNumber: 'CH123456789',
        insuranceCoverage: 75,
        totalPurchases: 28500.00,
        totalVisits: 42,
        lastVisit: serverTimestamp(),
        loyaltyPoints: 285,
        prescriptions: [],
        status: 'active',
        customerType: 'regular',
        creditLimit: 10000.00,
        consentForMarketing: true,
        dataPrivacyConsent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        customerId: 'CUS002',
        name: 'Mr. Pradeep Kumara',
        phoneNumber: '+94773333333',
        alternatePhone: '',
        email: 'pradeep.k@yahoo.com',
        dateOfBirth: new Date('1982-12-03'),
        gender: 'Male',
        address: {
          street: '78 Ward Place',
          city: 'Colombo 07',
          district: 'Colombo',
          province: 'Western',
          postalCode: '00700',
          country: 'Sri Lanka'
        },
        allergies: [],
        medicalConditions: ['Asthma'],
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Dilanthi Kumara',
          phone: '+94774444444',
          relationship: 'Wife'
        },
        insuranceProvider: 'AIA Insurance',
        insuranceNumber: 'AIA987654321',
        insuranceCoverage: 80,
        totalPurchases: 15750.00,
        totalVisits: 23,
        lastVisit: serverTimestamp(),
        loyaltyPoints: 157,
        prescriptions: [],
        status: 'active',
        customerType: 'premium',
        creditLimit: 15000.00,
        consentForMarketing: false,
        dataPrivacyConsent: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // 4. REAL SUPPLIERS DATA
    const realSuppliers = [
      {
        supplierId: 'SUP001',
        name: 'State Pharmaceuticals Corporation',
        contactPerson: 'Mr. Chandana Perera',
        email: 'orders@spc.lk',
        phone: '+94112691111',
        address: {
          street: '75 Sir Chittampalam A. Gardiner Mawatha',
          city: 'Colombo 02',
          district: 'Colombo',
          province: 'Western',
          postalCode: '00200',
          country: 'Sri Lanka'
        },
        category: 'pharmaceutical_manufacturer',
        status: 'active',
        creditTerms: 30,
        creditLimit: 500000.00,
        taxRegistration: 'VAT123456789',
        bankDetails: {
          bank: 'Bank of Ceylon',
          branch: 'Pettah',
          accountNumber: '1234567890',
          accountName: 'State Pharmaceuticals Corporation'
        },
        certifications: ['GMP', 'ISO 9001:2015'],
        totalPurchases: 2500000.00,
        lastOrderDate: new Date('2024-09-01'),
        rating: 4.8,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      {
        supplierId: 'SUP002',
        name: 'Hemas Pharmaceuticals (Pvt) Ltd',
        contactPerson: 'Ms. Nayomi Rathnayake',
        email: 'supply@hemas.com',
        phone: '+94112300300',
        address: {
          street: 'Hemas House, 75 Braybrooke Place',
          city: 'Colombo 02',
          district: 'Colombo',
          province: 'Western',
          postalCode: '00200',
          country: 'Sri Lanka'
        },
        category: 'pharmaceutical_distributor',
        status: 'active',
        creditTerms: 45,
        creditLimit: 750000.00,
        taxRegistration: 'VAT234567890',
        bankDetails: {
          bank: 'Commercial Bank',
          branch: 'Fort',
          accountNumber: '2345678901',
          accountName: 'Hemas Pharmaceuticals (Pvt) Ltd'
        },
        certifications: ['GDP', 'ISO 13485'],
        totalPurchases: 1800000.00,
        lastOrderDate: new Date('2024-08-28'),
        rating: 4.6,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // 5. PHARMACY REGISTRATION & SETTINGS
    const pharmacyRegistration = {
      registrationNumber: 'NMRA/PH/WP/2024/001',
      pharmacyName: 'CoreERP Community Pharmacy',
      ownerName: 'Dr. Niranjala Wickramasinghe',
      licenseNumber: 'NMRA/PH/2019/1234',
      address: {
        street: '125 Galle Road',
        city: 'Colombo 03',
        district: 'Colombo',
        province: 'Western',
        postalCode: '00300',
        country: 'Sri Lanka'
      },
      phone: '+94112345678',
      email: 'info@coreerp-pharmacy.lk',
      website: 'www.coreerp-pharmacy.lk',
      status: 'active',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-12-31'),
      renewalDate: new Date('2024-01-01'),
      operatingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: { open: '09:00', close: '17:00' }
      },
      services: [
        'Prescription Dispensing',
        'OTC Sales',
        'Health Consultations',
        'Blood Pressure Monitoring',
        'Diabetes Screening',
        'Medicine Home Delivery'
      ],
      vatRegistration: 'VAT345678901',
      businessRegistration: 'PV123456789',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 6. FINANCIAL ACCOUNTS & CATEGORIES
    const accountsData = [
      {
        accountCode: '1001',
        accountName: 'Cash on Hand',
        accountType: 'Asset',
        category: 'Current Assets',
        balance: 25000.00,
        status: 'active'
      },
      {
        accountCode: '1002',
        accountName: 'Bank - Commercial Bank',
        accountType: 'Asset',
        category: 'Current Assets',
        balance: 450000.00,
        status: 'active'
      },
      {
        accountCode: '1101',
        accountName: 'Inventory - Medicines',
        accountType: 'Asset',
        category: 'Current Assets',
        balance: 1250000.00,
        status: 'active'
      },
      {
        accountCode: '4001',
        accountName: 'Sales Revenue',
        accountType: 'Revenue',
        category: 'Operating Revenue',
        balance: 0.00,
        status: 'active'
      },
      {
        accountCode: '5001',
        accountName: 'Cost of Goods Sold',
        accountType: 'Expense',
        category: 'Cost of Sales',
        balance: 0.00,
        status: 'active'
      }
    ];

    console.log('💊 Adding real medicines to database...');
    for (const medicine of realMedicines) {
      await addDoc(collection(db, 'medicines'), medicine);
    }

    console.log('👥 Adding real employees to database...');
    for (const employee of realEmployees) {
      await addDoc(collection(db, 'employees'), employee);
    }

    console.log('🏥 Adding real customers to database...');
    for (const customer of realCustomers) {
      await addDoc(collection(db, 'customers'), customer);
    }

    console.log('🚚 Adding real suppliers to database...');
    for (const supplier of realSuppliers) {
      await addDoc(collection(db, 'suppliers'), supplier);
    }

    console.log('📋 Adding pharmacy registration...');
    await setDoc(doc(db, 'pharmacyRegistrations', 'main'), pharmacyRegistration);

    console.log('💰 Adding financial accounts...');
    for (const account of accountsData) {
      await addDoc(collection(db, 'accounts'), account);
    }

    // Initialize system settings
    const systemSettings = {
      currency: 'LKR',
      timezone: 'Asia/Colombo',
      dateFormat: 'DD/MM/YYYY',
      language: 'English',
      taxSettings: {
        vatRate: 15,
        withholdingTaxRate: 5,
        exemptCategories: ['essential_medicines']
      },
      inventorySettings: {
        autoReorder: true,
        lowStockThreshold: 20,
        expiryAlertDays: 90
      },
      posSettings: {
        receiptTemplate: 'standard',
        printAfterSale: true,
        allowPartialPayments: true
      },
      lastUpdated: serverTimestamp()
    };

    await setDoc(doc(db, 'settings', 'system'), systemSettings);

    // Commit any remaining batch operations
    if (batchCount > 0) {
      await batchWrite.commit();
    }

    console.log('✅ Real Pharmacy ERP Data initialization completed successfully!');
    return { 
      success: true, 
      message: 'Real pharmacy data initialized successfully',
      counts: {
        medicines: realMedicines.length,
        employees: realEmployees.length,
        customers: realCustomers.length,
        suppliers: realSuppliers.length
      }
    };

  } catch (error) {
    console.error('❌ Error initializing real pharmacy data:', error);
    return { success: false, message: error.message };
  }
};

// Function to initialize daily operational data
export const initializeDailyOperations = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Daily sales tracking
    await setDoc(doc(db, 'dailySales', today), {
      date: today,
      totalSales: 0,
      transactionCount: 0,
      prescriptionCount: 0,
      otcCount: 0,
      cashSales: 0,
      cardSales: 0,
      digitalPayments: 0,
      insuranceSales: 0,
      refundAmount: 0,
      discountAmount: 0,
      taxAmount: 0,
      grossProfit: 0,
      topSellingMedicines: [],
      employeeSales: {},
      peakHours: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Daily inventory snapshot
    await setDoc(doc(db, 'dailyInventory', today), {
      date: today,
      totalStockValue: 0,
      lowStockItems: [],
      expiringSoonItems: [],
      receivedStock: [],
      soldItems: [],
      adjustments: [],
      createdAt: serverTimestamp()
    });

    return { success: true, message: 'Daily operations initialized' };
  } catch (error) {
    console.error('Error initializing daily operations:', error);
    return { success: false, message: error.message };
  }
};

export default { initializeRealPharmacyData, initializeDailyOperations };
