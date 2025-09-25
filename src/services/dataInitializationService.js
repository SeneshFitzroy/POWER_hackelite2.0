import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  serverTimestamp,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Real medicine data with various stock statuses
const realMedicineData = [
  // LOW STOCK MEDICINES
  {
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Analgesic",
    manufacturer: "Johnson & Johnson",
    batchNumber: "PAR500-2024-001",
    stockQuantity: 8,
    minStockLevel: 50,
    reorderPoint: 25,
    maxStockLevel: 200,
    unitPrice: 0.25,
    costPrice: 0.15,
    sellingPrice: 0.30,
    expiryDate: "2025-12-15",
    manufacturingDate: "2024-01-15",
    supplier: "MedSupply Corp",
    location: "A-01-15",
    status: "active",
    dosageForm: "Tablet",
    strength: "500mg",
    packSize: 100,
    barcode: "8901030871234",
    storageConditions: "Store below 25°C"
  },
  {
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    manufacturer: "Pfizer",
    batchNumber: "AMX250-2024-003",
    stockQuantity: 12,
    minStockLevel: 30,
    reorderPoint: 20,
    maxStockLevel: 150,
    unitPrice: 0.45,
    costPrice: 0.30,
    sellingPrice: 0.55,
    expiryDate: "2025-08-20",
    manufacturingDate: "2024-02-20",
    supplier: "Pharma Distributors Ltd",
    location: "B-02-08",
    status: "active",
    dosageForm: "Capsule",
    strength: "250mg",
    packSize: 50,
    barcode: "8901030871245",
    storageConditions: "Store in cool, dry place"
  },
  {
    name: "Insulin Glargine 100IU/ml",
    genericName: "Insulin Glargine",
    category: "Antidiabetic",
    manufacturer: "Sanofi",
    batchNumber: "INS100-2024-007",
    stockQuantity: 3,
    minStockLevel: 20,
    reorderPoint: 10,
    maxStockLevel: 60,
    unitPrice: 25.50,
    costPrice: 20.00,
    sellingPrice: 30.00,
    expiryDate: "2025-11-30",
    manufacturingDate: "2024-03-10",
    supplier: "Diabetes Care Supplies",
    location: "C-03-02",
    status: "active",
    dosageForm: "Injection",
    strength: "100IU/ml",
    packSize: 10,
    barcode: "8901030871256",
    storageConditions: "Refrigerate 2-8°C"
  },

  // EXPIRING SOON MEDICINES
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Proton Pump Inhibitor",
    manufacturer: "AstraZeneca",
    batchNumber: "OME20-2024-012",
    stockQuantity: 85,
    minStockLevel: 40,
    reorderPoint: 30,
    maxStockLevel: 200,
    unitPrice: 0.75,
    costPrice: 0.50,
    sellingPrice: 0.90,
    expiryDate: "2025-10-15", // Expiring in ~3 weeks
    manufacturingDate: "2023-10-15",
    supplier: "Generic Pharma Inc",
    location: "A-02-20",
    status: "active",
    dosageForm: "Capsule",
    strength: "20mg",
    packSize: 30,
    barcode: "8901030871267",
    storageConditions: "Store below 30°C"
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    category: "Antidiabetic",
    manufacturer: "Teva",
    batchNumber: "MET500-2024-008",
    stockQuantity: 120,
    minStockLevel: 50,
    reorderPoint: 40,
    maxStockLevel: 300,
    unitPrice: 0.35,
    costPrice: 0.25,
    sellingPrice: 0.45,
    expiryDate: "2025-10-08", // Expiring soon
    manufacturingDate: "2023-10-08",
    supplier: "Diabetes Care Supplies",
    location: "B-01-12",
    status: "active",
    dosageForm: "Tablet",
    strength: "500mg",
    packSize: 100,
    barcode: "8901030871278",
    storageConditions: "Store in dry place"
  },

  // EXPIRED MEDICINES
  {
    name: "Aspirin 75mg",
    genericName: "Acetylsalicylic Acid",
    category: "Antiplatelet",
    manufacturer: "Bayer",
    batchNumber: "ASP75-2023-015",
    stockQuantity: 45,
    minStockLevel: 30,
    reorderPoint: 20,
    maxStockLevel: 150,
    unitPrice: 0.20,
    costPrice: 0.12,
    sellingPrice: 0.25,
    expiryDate: "2025-09-10", // Expired
    manufacturingDate: "2023-09-10",
    supplier: "Cardio Meds Ltd",
    location: "A-03-05",
    status: "expired",
    dosageForm: "Tablet",
    strength: "75mg",
    packSize: 100,
    barcode: "8901030871289",
    storageConditions: "Store below 25°C"
  },
  {
    name: "Cough Syrup 100ml",
    genericName: "Dextromethorphan",
    category: "Antitussive",
    manufacturer: "Local Pharma",
    batchNumber: "COU100-2023-020",
    stockQuantity: 28,
    minStockLevel: 25,
    reorderPoint: 15,
    maxStockLevel: 80,
    unitPrice: 3.50,
    costPrice: 2.50,
    sellingPrice: 4.50,
    expiryDate: "2025-08-15", // Expired
    manufacturingDate: "2023-08-15",
    supplier: "Respiratory Care Inc",
    location: "B-03-18",
    status: "expired",
    dosageForm: "Syrup",
    strength: "15mg/5ml",
    packSize: 1,
    barcode: "8901030871290",
    storageConditions: "Store below 25°C"
  },

  // QUARANTINED MEDICINES
  {
    name: "Vitamin D3 1000IU",
    genericName: "Cholecalciferol",
    category: "Vitamin",
    manufacturer: "Nature's Bounty",
    batchNumber: "VTD1000-2024-005",
    stockQuantity: 60,
    minStockLevel: 40,
    reorderPoint: 30,
    maxStockLevel: 200,
    unitPrice: 0.85,
    costPrice: 0.60,
    sellingPrice: 1.00,
    expiryDate: "2026-03-20",
    manufacturingDate: "2024-03-20",
    supplier: "Vitamin Wholesalers",
    location: "C-01-08",
    status: "quarantined",
    dosageForm: "Tablet",
    strength: "1000IU",
    packSize: 60,
    barcode: "8901030871301",
    storageConditions: "Store in cool, dry place",
    quarantineReason: "Quality control pending"
  },
  {
    name: "Antibiotic Eye Drops",
    genericName: "Chloramphenicol",
    category: "Antibiotic",
    manufacturer: "Eye Care Ltd",
    batchNumber: "EYE10-2024-011",
    stockQuantity: 25,
    minStockLevel: 15,
    reorderPoint: 10,
    maxStockLevel: 50,
    unitPrice: 8.75,
    costPrice: 6.50,
    sellingPrice: 10.50,
    expiryDate: "2025-12-10",
    manufacturingDate: "2024-06-10",
    supplier: "Ophthalmic Supplies",
    location: "C-02-15",
    status: "quarantined",
    dosageForm: "Eye Drops",
    strength: "0.5%",
    packSize: 1,
    barcode: "8901030871312",
    storageConditions: "Refrigerate after opening",
    quarantineReason: "Suspected contamination - awaiting lab results"
  },

  // NORMAL STOCK MEDICINES
  {
    name: "Lisinopril 10mg",
    genericName: "Lisinopril",
    category: "ACE Inhibitor",
    manufacturer: "Merck",
    batchNumber: "LIS10-2024-009",
    stockQuantity: 150,
    minStockLevel: 50,
    reorderPoint: 40,
    maxStockLevel: 250,
    unitPrice: 0.65,
    costPrice: 0.45,
    sellingPrice: 0.80,
    expiryDate: "2026-06-15",
    manufacturingDate: "2024-06-15",
    supplier: "Cardiac Care Distributors",
    location: "A-04-10",
    status: "active",
    dosageForm: "Tablet",
    strength: "10mg",
    packSize: 30,
    barcode: "8901030871323",
    storageConditions: "Store below 25°C"
  },
  {
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    category: "Statin",
    manufacturer: "Pfizer",
    batchNumber: "ATO20-2024-013",
    stockQuantity: 200,
    minStockLevel: 60,
    reorderPoint: 50,
    maxStockLevel: 300,
    unitPrice: 1.25,
    costPrice: 0.90,
    sellingPrice: 1.50,
    expiryDate: "2026-08-30",
    manufacturingDate: "2024-08-30",
    supplier: "Cardio Meds Ltd",
    location: "B-04-22",
    status: "active",
    dosageForm: "Tablet",
    strength: "20mg",
    packSize: 30,
    barcode: "8901030871334",
    storageConditions: "Store below 30°C"
  }
];

// Service for initializing database with real data
export const dataInitializationService = {
  // Check if data collections exist
  checkIfDataExists: async () => {
    try {
      const medicinesRef = collection(db, 'medicines');
      const medicinesSnapshot = await getDocs(medicinesRef);
      
      const purchaseOrdersRef = collection(db, 'purchaseOrders');
      const ordersSnapshot = await getDocs(purchaseOrdersRef);
      
      const suppliersRef = collection(db, 'suppliers');
      const suppliersSnapshot = await getDocs(suppliersRef);
      
      // Return true if any of the main collections have data
      return !medicinesSnapshot.empty || !ordersSnapshot.empty || !suppliersSnapshot.empty;
    } catch (error) {
      console.error('Error checking data existence:', error);
      return false;
    }
  },

  // Initialize medicines with real data
  initializeMedicines: async () => {
    try {
      const batch = writeBatch(db);
      const medicinesRef = collection(db, 'medicines');

      realMedicineData.forEach((medicine) => {
        const docRef = doc(medicinesRef);
        batch.set(docRef, {
          ...medicine,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log('Successfully initialized medicines data');
      return true;
    } catch (error) {
      console.error('Error initializing medicines:', error);
      throw error;
    }
  },

  // Initialize quarantine records for quarantined medicines
  initializeQuarantineRecords: async () => {
    try {
      const quarantinedMedicines = realMedicineData.filter(med => med.status === 'quarantined');
      
      for (const medicine of quarantinedMedicines) {
        await addDoc(collection(db, 'quarantine_records'), {
          medicineId: medicine.batchNumber, // Using batchNumber as reference
          medicineName: medicine.name,
          batchNumber: medicine.batchNumber,
          reason: medicine.quarantineReason,
          quantityQuarantined: medicine.stockQuantity,
          quarantineDate: serverTimestamp(),
          status: 'active',
          inspectorNotes: 'Automated quarantine entry',
          expectedResolutionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdAt: serverTimestamp()
        });
      }

      console.log('Successfully initialized quarantine records');
      return true;
    } catch (error) {
      console.error('Error initializing quarantine records:', error);
      throw error;
    }
  },

  // Initialize stock transaction history
  initializeStockTransactions: async () => {
    try {
      const transactions = [
        {
          medicineId: "PAR500-2024-001",
          medicineName: "Paracetamol 500mg",
          quantityChange: -42,
          reason: "Sales",
          type: "out",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          performedBy: "Pharmacist John"
        },
        {
          medicineId: "AMX250-2024-003",
          medicineName: "Amoxicillin 250mg",
          quantityChange: -18,
          reason: "Prescription fulfillment",
          type: "out",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          performedBy: "Pharmacist Sarah"
        },
        {
          medicineId: "INS100-2024-007",
          medicineName: "Insulin Glargine 100IU/ml",
          quantityChange: -7,
          reason: "Patient prescription",
          type: "out",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          performedBy: "Pharmacist Mike"
        }
      ];

      for (const transaction of transactions) {
        await addDoc(collection(db, 'stock_transactions'), {
          ...transaction,
          createdAt: serverTimestamp()
        });
      }

      console.log('Successfully initialized stock transactions');
      return true;
    } catch (error) {
      console.error('Error initializing stock transactions:', error);
      throw error;
    }
  },

  // Initialize purchase orders with real data
  initializePurchaseOrders: async () => {
    try {
      console.log('Initializing purchase orders...');
      
      // Check if purchase orders already exist
      const purchaseOrdersRef = collection(db, 'purchaseOrders');
      const snapshot = await getDocs(purchaseOrdersRef);
      
      if (!snapshot.empty) {
        console.log('Purchase orders already exist, skipping initialization');
        return;
      }

      const realPurchaseOrderData = [
        {
          medicineId: "med001",
          medicineName: "Paracetamol 500mg",
          quantityOrdered: 500,
          supplier: "MedSupply Corp",
          supplierId: "sup001",
          status: "pending",
          priority: "high",
          unitCost: 0.15,
          totalCost: 75.00,
          orderDate: new Date('2025-01-20'),
          expectedDeliveryDate: new Date('2025-01-27'),
          notes: "Urgent reorder - critically low stock",
          orderNumber: "PO-2025-001",
          approvedBy: "Dr. Smith",
          department: "Pharmacy"
        },
        {
          medicineId: "med002",
          medicineName: "Amoxicillin 250mg",
          quantityOrdered: 300,
          supplier: "Pharma Distributors Ltd",
          supplierId: "sup002",
          status: "approved",
          priority: "high",
          unitCost: 0.30,
          totalCost: 90.00,
          orderDate: new Date('2025-01-18'),
          expectedDeliveryDate: new Date('2025-01-25'),
          approvedDate: new Date('2025-01-19'),
          notes: "Low stock - antibiotic restocking",
          orderNumber: "PO-2025-002",
          approvedBy: "Dr. Johnson",
          department: "Pharmacy"
        },
        {
          medicineId: "med003",
          medicineName: "Insulin Glargine 100IU/ml",
          quantityOrdered: 100,
          supplier: "Diabetes Care Supplies",
          supplierId: "sup003",
          status: "received",
          priority: "critical",
          unitCost: 20.00,
          totalCost: 2000.00,
          orderDate: new Date('2025-01-10'),
          expectedDeliveryDate: new Date('2025-01-17'),
          receivedDate: new Date('2025-01-17'),
          notes: "Critical diabetes medication - emergency restock",
          orderNumber: "PO-2025-003",
          approvedBy: "Dr. Wilson",
          receivedBy: "Pharmacist Brown",
          department: "Pharmacy"
        },
        {
          medicineId: "med004",
          medicineName: "Omeprazole 20mg",
          quantityOrdered: 400,
          supplier: "GastroMed Supplies",
          supplierId: "sup004",
          status: "pending",
          priority: "medium",
          unitCost: 0.60,
          totalCost: 240.00,
          orderDate: new Date('2025-01-22'),
          expectedDeliveryDate: new Date('2025-01-30'),
          notes: "Routine restock - expiring soon batch replacement",
          orderNumber: "PO-2025-004",
          approvedBy: "Dr. Davis",
          department: "Pharmacy"
        },
        {
          medicineId: "med005",
          medicineName: "Atorvastatin 20mg",
          quantityOrdered: 250,
          supplier: "CardioPharm Ltd",
          supplierId: "sup005",
          status: "cancelled",
          priority: "low",
          unitCost: 0.85,
          totalCost: 212.50,
          orderDate: new Date('2025-01-15'),
          cancelledDate: new Date('2025-01-20'),
          notes: "Cancelled - found alternative supplier with better pricing",
          orderNumber: "PO-2025-005",
          approvedBy: "Dr. Miller",
          cancelledBy: "Procurement Manager",
          department: "Pharmacy"
        },
        {
          medicineId: "med006",
          medicineName: "Metformin 500mg",
          quantityOrdered: 600,
          supplier: "DiabetesCare Plus",
          supplierId: "sup006",
          status: "shipped",
          priority: "medium",
          unitCost: 0.20,
          totalCost: 120.00,
          orderDate: new Date('2025-01-16'),
          expectedDeliveryDate: new Date('2025-01-24'),
          shippedDate: new Date('2025-01-23'),
          trackingNumber: "TRK123456789",
          notes: "Standard restock - tracking available",
          orderNumber: "PO-2025-006",
          approvedBy: "Dr. Anderson",
          department: "Pharmacy"
        }
      ];

      // Add purchase orders to Firestore using batch
      const batch = writeBatch(db);
      let count = 0;

      for (const orderData of realPurchaseOrderData) {
        const docRef = doc(collection(db, 'purchaseOrders'));
        batch.set(docRef, {
          ...orderData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }

      await batch.commit();
      console.log(`Successfully initialized ${count} purchase orders`);
      
    } catch (error) {
      console.error('Error initializing purchase orders:', error);
      throw error;
    }
  },

  // Initialize suppliers data
  initializeSuppliers: async () => {
    try {
      console.log('Initializing suppliers...');
      
      // Check if suppliers already exist
      const suppliersRef = collection(db, 'suppliers');
      const snapshot = await getDocs(suppliersRef);
      
      if (!snapshot.empty) {
        console.log('Suppliers already exist, skipping initialization');
        return;
      }

      const realSupplierData = [
        {
          id: "sup001",
          name: "MedSupply Corp",
          contactPerson: "John Anderson",
          email: "john@medsupply.com",
          phone: "+1-800-MED-SUPP",
          address: "123 Medical District, Healthcare City, HC 12345",
          category: "General Pharmaceuticals",
          rating: 4.5,
          paymentTerms: "Net 30",
          deliveryTime: "5-7 business days",
          minimumOrder: 1000,
          isActive: true,
          specialties: ["Analgesics", "Antibiotics", "General Medicine"]
        },
        {
          id: "sup002",
          name: "Pharma Distributors Ltd",
          contactPerson: "Sarah Wilson",
          email: "sarah@pharmadist.com",
          phone: "+1-800-PHARMA-1",
          address: "456 Distribution Ave, Medical Hub, MH 54321",
          category: "Prescription Drugs",
          rating: 4.2,
          paymentTerms: "Net 45",
          deliveryTime: "3-5 business days",
          minimumOrder: 500,
          isActive: true,
          specialties: ["Antibiotics", "Cardiovascular", "Respiratory"]
        },
        {
          id: "sup003",
          name: "Diabetes Care Supplies",
          contactPerson: "Dr. Michael Chen",
          email: "michael@diabetescare.com",
          phone: "+1-800-DIABETES",
          address: "789 Endocrine Way, Specialty Medical Plaza, SMP 98765",
          category: "Specialized Medicine",
          rating: 4.8,
          paymentTerms: "Net 15",
          deliveryTime: "2-3 business days",
          minimumOrder: 100,
          isActive: true,
          specialties: ["Antidiabetic", "Insulin", "Blood Glucose Monitors"]
        },
        {
          id: "sup004",
          name: "GastroMed Supplies",
          contactPerson: "Lisa Rodriguez",
          email: "lisa@gastromed.com",
          phone: "+1-800-GASTRO-1",
          address: "321 Digestive Health Blvd, Medical Center, MC 13579",
          category: "Gastrointestinal",
          rating: 4.3,
          paymentTerms: "Net 30",
          deliveryTime: "4-6 business days",
          minimumOrder: 250,
          isActive: true,
          specialties: ["Proton Pump Inhibitors", "Antacids", "Digestive Health"]
        },
        {
          id: "sup005",
          name: "CardioPharm Ltd",
          contactPerson: "Robert Johnson",
          email: "robert@cardiopharm.com",
          phone: "+1-800-CARDIO-1",
          address: "654 Heart Health Street, Cardiac Center, CC 24680",
          category: "Cardiovascular",
          rating: 4.6,
          paymentTerms: "Net 30",
          deliveryTime: "3-5 business days",
          minimumOrder: 200,
          isActive: true,
          specialties: ["Statins", "ACE Inhibitors", "Beta Blockers"]
        },
        {
          id: "sup006",
          name: "DiabetesCare Plus",
          contactPerson: "Emma Thompson",
          email: "emma@diabetescareplus.com",
          phone: "+1-800-DIAB-PLUS",
          address: "987 Metabolic Medicine Ave, Endocrine District, ED 11223",
          category: "Endocrine & Metabolic",
          rating: 4.4,
          paymentTerms: "Net 30",
          deliveryTime: "4-7 business days",
          minimumOrder: 300,
          isActive: true,
          specialties: ["Metformin", "Diabetic Supplies", "Metabolic Disorders"]
        }
      ];

      // Add suppliers to Firestore using batch
      const batch = writeBatch(db);
      let count = 0;

      for (const supplierData of realSupplierData) {
        const docRef = doc(collection(db, 'suppliers'), supplierData.id);
        batch.set(docRef, {
          ...supplierData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }

      await batch.commit();
      console.log(`Successfully initialized ${count} suppliers`);
      
    } catch (error) {
      console.error('Error initializing suppliers:', error);
      throw error;
    }
  },

  // Initialize all data
  initializeAllData: async () => {
    try {
      console.log('Starting data initialization...');
      
      // Check if data already exists
      const dataExists = await dataInitializationService.checkIfDataExists();
      if (dataExists) {
        console.log('Data already exists, skipping initialization');
        return true;
      }

      // Initialize all data
      await dataInitializationService.initializeMedicines();
      await dataInitializationService.initializeQuarantineRecords();
      await dataInitializationService.initializeStockTransactions();
      await dataInitializationService.initializePurchaseOrders();
      await dataInitializationService.initializeSuppliers();
      
      console.log('All data initialized successfully!');
      return true;
    } catch (error) {
      console.error('Error during data initialization:', error);
      throw error;
    }
  },

  // Force reinitialize (clear and recreate)
  forceReinitialize: async () => {
    try {
      console.log('Force reinitializing data...');
      
      // Clear existing data
      const collections = ['medicines', 'quarantine_records', 'stock_transactions', 'purchaseOrders', 'suppliers'];
      
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        if (!snapshot.empty) {
          await batch.commit();
        }
      }
      
      // Reinitialize with fresh data
      await dataInitializationService.initializeMedicines();
      await dataInitializationService.initializeQuarantineRecords();
      await dataInitializationService.initializeStockTransactions();
      await dataInitializationService.initializePurchaseOrders();
      await dataInitializationService.initializeSuppliers();
      
      console.log('Force reinitialization completed!');
      return true;
    } catch (error) {
      console.error('Error during force reinitialization:', error);
      throw error;
    }
  }
};
