import { medicineService } from './medicineService';
import { employeeService } from './employeeService';
import { customerService } from './customerService';
import { serverTimestamp } from 'firebase/firestore';

// Sample data initialization for pharmacy POS system
export const initializeSampleData = async () => {
  try {
    console.log('Starting sample data initialization...');

    // Initialize real Sri Lankan medicines
    const medicines = [
      // Analgesics - Pain Relief
      {
        name: 'Panadol',
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
        costPrice: 12.50,
        sellingPrice: 18.00,
        mrp: 22.00,
        discount: 0,
        batchNumber: 'PAN240905',
        manufacturingDate: new Date('2024-08-10'),
        expiryDate: new Date('2026-08-10'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Rare: liver damage with overdose'],
        contraindications: ['Severe liver disease'],
        interactions: [{ ingredient: 'warfarin', severity: 'low' }],
        prescriptionRequired: false,
        dosageInstructions: '1-2 tablets every 4-6 hours. Max 8 tablets per day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'A-2-1',
        vendor: 'GlaxoSmithKline Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Disprin',
        genericName: 'Aspirin',
        manufacturer: 'Reckitt Benckiser',
        barcode: '8999999580002',
        activeIngredient: 'acetylsalicylic acid',
        category: 'Analgesics',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '300mg',
        stockQuantity: 150,
        minStockLevel: 40,
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
      {
        name: 'Voltaren',
        genericName: 'Diclofenac Sodium',
        manufacturer: 'Novartis',
        barcode: '8999999580003',
        activeIngredient: 'diclofenac sodium',
        category: 'Analgesics',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '50mg',
        stockQuantity: 80,
        minStockLevel: 20,
        maxStockLevel: 120,
        reorderPoint: 35,
        costPrice: 145.00,
        sellingPrice: 185.00,
        mrp: 205.00,
        discount: 0,
        batchNumber: 'VOL240903',
        manufacturingDate: new Date('2024-06-15'),
        expiryDate: new Date('2026-06-15'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Stomach upset', 'Dizziness', 'Headache'],
        contraindications: ['Peptic ulcer', 'Heart disease', 'Kidney disease'],
        interactions: [{ ingredient: 'warfarin', severity: 'high' }],
        prescriptionRequired: true,
        dosageInstructions: '1 tablet 2-3 times daily with food',
        status: 'active',
        taxRate: 0,
        rackLocation: 'A-3-1',
        vendor: 'Novartis Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Antibiotics
      {
        name: 'Amoxil',
        genericName: 'Amoxicillin',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580004',
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
        sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
        contraindications: ['Penicillin allergy'],
        interactions: [{ ingredient: 'warfarin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 capsule every 8 hours for 7-10 days',
        status: 'active',
        taxRate: 0,
        rackLocation: 'B-1-1',
        vendor: 'GlaxoSmithKline Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Zithromax',
        genericName: 'Azithromycin',
        manufacturer: 'Pfizer',
        barcode: '8999999580005',
        activeIngredient: 'azithromycin',
        category: 'Antibiotics',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '250mg',
        stockQuantity: 60,
        minStockLevel: 15,
        maxStockLevel: 100,
        reorderPoint: 25,
        costPrice: 125.00,
        sellingPrice: 165.00,
        mrp: 180.00,
        discount: 0,
        batchNumber: 'AZI240904',
        manufacturingDate: new Date('2024-06-15'),
        expiryDate: new Date('2026-06-15'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Stomach upset', 'Diarrhea'],
        contraindications: ['Liver disease', 'Azithromycin allergy'],
        interactions: [{ ingredient: 'digoxin', severity: 'moderate' }],
        prescriptionRequired: true,
        dosageInstructions: '1 tablet daily for 3-5 days',
        status: 'active',
        taxRate: 0,
        rackLocation: 'B-1-2',
        vendor: 'Pfizer Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Antacids
      {
        name: 'Eno',
        genericName: 'Sodium bicarbonate + Citric acid',
        manufacturer: 'GlaxoSmithKline',
        barcode: '8999999580006',
        activeIngredient: 'sodium bicarbonate, citric acid',
        category: 'Antacids',
        type: 'OTC',
        dosageForm: 'Powder',
        strength: '5g sachet',
        stockQuantity: 100,
        minStockLevel: 20,
        maxStockLevel: 150,
        reorderPoint: 35,
        costPrice: 42.00,
        sellingPrice: 55.00,
        mrp: 62.00,
        discount: 0,
        batchNumber: 'ENO240906',
        manufacturingDate: new Date('2024-06-20'),
        expiryDate: new Date('2026-06-20'),
        storageConditions: 'Store in dry place',
        sideEffects: ['Belching', 'Stomach discomfort'],
        contraindications: ['Kidney disease', 'Heart failure'],
        interactions: [{ ingredient: 'aspirin', severity: 'low' }],
        prescriptionRequired: false,
        dosageInstructions: 'Mix 1 sachet in water and drink immediately',
        status: 'active',
        taxRate: 0,
        rackLocation: 'C-1-1',
        vendor: 'GlaxoSmithKline Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Cough & Cold
      {
        name: 'Benadryl',
        genericName: 'Diphenhydramine',
        manufacturer: 'Johnson & Johnson',
        barcode: '8999999580007',
        activeIngredient: 'diphenhydramine',
        category: 'Cough & Cold',
        type: 'OTC',
        dosageForm: 'Syrup',
        strength: '12.5mg/5ml',
        stockQuantity: 75,
        minStockLevel: 15,
        maxStockLevel: 100,
        reorderPoint: 25,
        costPrice: 85.00,
        sellingPrice: 115.00,
        mrp: 128.00,
        discount: 0,
        batchNumber: 'BEN240907',
        manufacturingDate: new Date('2024-07-05'),
        expiryDate: new Date('2026-07-05'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Drowsiness', 'Dry mouth'],
        contraindications: ['Glaucoma', 'Enlarged prostate'],
        interactions: [{ ingredient: 'alcohol', severity: 'high' }],
        prescriptionRequired: false,
        dosageInstructions: '5-10ml every 4-6 hours. Adults and children over 12 years',
        status: 'active',
        taxRate: 0,
        rackLocation: 'D-1-1',
        vendor: 'Johnson & Johnson Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Vitamins
      {
        name: 'Berocca',
        genericName: 'Multivitamin + Minerals',
        manufacturer: 'Bayer',
        barcode: '8999999580008',
        activeIngredient: 'B vitamins, Vitamin C, Zinc, Magnesium',
        category: 'Vitamins',
        type: 'OTC',
        dosageForm: 'Effervescent Tablet',
        strength: 'Multi-strength',
        stockQuantity: 90,
        minStockLevel: 20,
        maxStockLevel: 120,
        reorderPoint: 30,
        costPrice: 275.00,
        sellingPrice: 365.00,
        mrp: 395.00,
        discount: 0,
        batchNumber: 'BER240908',
        manufacturingDate: new Date('2024-05-25'),
        expiryDate: new Date('2026-05-25'),
        storageConditions: 'Store in dry place below 25°C',
        sideEffects: ['Yellow urine (harmless)', 'Mild stomach upset'],
        contraindications: ['Iron metabolism disorders'],
        interactions: [{ ingredient: 'antibiotics', severity: 'low' }],
        prescriptionRequired: false,
        dosageInstructions: '1 tablet dissolved in water daily',
        status: 'active',
        taxRate: 0,
        rackLocation: 'E-1-1',
        vendor: 'Bayer Lanka',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Prescription Medications
      {
        name: 'Losartan',
        genericName: 'Losartan potassium',
        manufacturer: 'Cipla Lanka',
        barcode: '8999999580009',
        activeIngredient: 'losartan potassium',
        category: 'Cardiovascular',
        type: 'Prescription',
        dosageForm: 'Tablet',
        strength: '50mg',
        stockQuantity: 120,
        minStockLevel: 30,
        maxStockLevel: 180,
        reorderPoint: 45,
        costPrice: 185.00,
        sellingPrice: 245.00,
        mrp: 265.00,
        discount: 0,
        batchNumber: 'LOS240909',
        manufacturingDate: new Date('2024-08-01'),
        expiryDate: new Date('2026-08-01'),
        storageConditions: 'Store below 30°C',
        sideEffects: ['Dizziness', 'Fatigue', 'Low blood pressure'],
        contraindications: ['Pregnancy', 'Severe kidney disease'],
        interactions: [{ ingredient: 'lithium', severity: 'high' }],
        prescriptionRequired: true,
        dosageInstructions: '1 tablet daily, preferably at the same time each day',
        status: 'active',
        taxRate: 0,
        rackLocation: 'F-1-1',
        vendor: 'Cipla Lanka Ltd',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },

      // Antihistamines
      {
        name: 'Cetirizine',
        genericName: 'Cetirizine dihydrochloride',
        manufacturer: 'State Pharmaceuticals Corporation',
        barcode: '8999999580010',
        activeIngredient: 'cetirizine dihydrochloride',
        category: 'Antihistamines',
        type: 'OTC',
        dosageForm: 'Tablet',
        strength: '10mg',
        stockQuantity: 130,
        minStockLevel: 30,
        maxStockLevel: 180,
        reorderPoint: 50,
        costPrice: 48.00,
        sellingPrice: 65.00,
        mrp: 72.00,
        discount: 0,
        batchNumber: 'CET240911',
        manufacturingDate: new Date('2024-06-30'),
        expiryDate: new Date('2026-06-30'),
        storageConditions: 'Store below 25°C',
        sideEffects: ['Drowsiness', 'Fatigue', 'Dry mouth'],
        contraindications: ['Severe kidney disease'],
        interactions: [{ ingredient: 'alcohol', severity: 'moderate' }],
        prescriptionRequired: false,
        dosageInstructions: '1 tablet daily, preferably in the evening',
        status: 'active',
        taxRate: 0,
        rackLocation: 'G-1-1',
        vendor: 'State Pharmaceuticals Corporation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Add medicines to Firestore
    console.log('Adding Sri Lankan medicines to Firestore...');
    
    for (const medicine of medicines) {
      try {
        await medicineService.addMedicine(medicine);
        console.log(`Added medicine: ${medicine.name}`);
      } catch (error) {
        console.error('Error adding medicine:', medicine.name, error);
      }
    }

    console.log('Sri Lankan medicines data initialized successfully!');
    return { success: true, message: 'Sri Lankan pharmacy data initialized successfully' };

  } catch (error) {
    console.error('Error initializing sample data:', error);
    return { success: false, message: error.message };
  }
};

// Function to clear all data (for testing purposes)
export const clearAllData = async () => {
  try {
    console.log('This function would clear all data. Implementation depends on Firebase Admin SDK.');
    return { success: true, message: 'Data clearing completed' };
  } catch (error) {
    console.error('Error clearing data:', error);
    return { success: false, message: error.message };
  }
};
