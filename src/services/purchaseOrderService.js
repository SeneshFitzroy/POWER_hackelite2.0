import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { supplierService } from './supplierService';

// Purchase Order Service
export const purchaseOrderService = {
  // Create a new purchase order
  createPurchaseOrder: async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'purchaseOrders'), {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...orderData };
    } catch (error) {
      throw new Error(`Error creating purchase order: ${error.message}`);
    }
  },

  // Create purchase order with supplier linking
  createPurchaseOrderWithSupplier: async (orderData, supplierId) => {
    try {
      const docRef = await addDoc(collection(db, 'purchaseOrders'), {
        ...orderData,
        supplierId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...orderData };
    } catch (error) {
      throw new Error(`Error creating purchase order with supplier: ${error.message}`);
    }
  },

  // Create multiple purchase orders for low stock items
  createBulkPurchaseOrders: async (lowStockItems) => {
    try {
      const batch = writeBatch(db);
      const createdOrders = [];

      for (const item of lowStockItems) {
        const orderData = {
          medicineId: item.id,
          medicineName: item.name,
          quantityOrdered: item.reorderQuantity || (item.maxStockLevel || 100),
          supplier: item.vendor || 'Unknown Supplier',
          status: 'pending',
          minStockLevel: item.minStockLevel || 10,
          reorderPoint: item.reorderPoint || 20,
          currentStock: item.stockQuantity || 0,
          unitCost: item.costPrice || 0,
          totalCost: (item.costPrice || 0) * (item.reorderQuantity || (item.maxStockLevel || 100)),
          priority: item.stockQuantity <= (item.minStockLevel || 10) ? 'high' : 'medium',
          notes: `Auto-generated for low stock. Current: ${item.stockQuantity || 0}, Min: ${item.minStockLevel || 10}`
        };

        const orderRef = doc(collection(db, 'purchaseOrders'));
        batch.set(orderRef, {
          ...orderData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        createdOrders.push({ id: orderRef.id, ...orderData });
      }

      await batch.commit();
      return createdOrders;
    } catch (error) {
      throw new Error(`Error creating bulk purchase orders: ${error.message}`);
    }
  },

  // Get all purchase orders
  getAllPurchaseOrders: async () => {
    try {
      const q = query(collection(db, 'purchaseOrders'));
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching purchase orders: ${error.message}`);
    }
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (orderId) => {
    try {
      const docRef = doc(db, 'purchaseOrders', orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error fetching purchase order: ${error.message}`);
    }
  },

  // Update purchase order status
  updatePurchaseOrderStatus: async (orderId, status, notes = '') => {
    try {
      const orderRef = doc(db, 'purchaseOrders', orderId);
      await updateDoc(orderRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating purchase order: ${error.message}`);
    }
  },

  // Update purchase order details
  updatePurchaseOrder: async (orderId, updateData) => {
    try {
      const orderRef = doc(db, 'purchaseOrders', orderId);
      await updateDoc(orderRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating purchase order: ${error.message}`);
    }
  },

  // Get purchase orders by status
  getPurchaseOrdersByStatus: async (status) => {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching purchase orders by status: ${error.message}`);
    }
  },

  // Get purchase orders by supplier
  getPurchaseOrdersBySupplier: async (supplier) => {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        where('supplier', '==', supplier)
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching purchase orders by supplier: ${error.message}`);
    }
  },

  // Get purchase orders by supplier ID
  getPurchaseOrdersBySupplierId: async (supplierId) => {
    try {
      const q = query(
        collection(db, 'purchaseOrders'),
        where('supplierId', '==', supplierId)
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      return orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      throw new Error(`Error fetching purchase orders by supplier ID: ${error.message}`);
    }
  },

  // Update purchase order with delivery information
  updatePurchaseOrderDelivery: async (orderId, deliveryData) => {
    try {
      const orderRef = doc(db, 'purchaseOrders', orderId);
      await updateDoc(orderRef, {
        ...deliveryData,
        status: 'delivered',
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error(`Error updating purchase order delivery: ${error.message}`);
    }
  },

  // Get purchase history (completed/delivered orders)
  getPurchaseHistory: async () => {
    try {
      const orders = await purchaseOrderService.getAllPurchaseOrders();
      
      // Filter for completed/delivered orders
      const history = orders.filter(order => 
        order.status === 'completed' || 
        order.status === 'delivered' || 
        order.status === 'received'
      );
      
      return history;
    } catch (error) {
      throw new Error(`Error fetching purchase history: ${error.message}`);
    }
  },

  // Get purchase history with supplier details
  getPurchaseHistoryWithSuppliers: async () => {
    try {
      const orders = await purchaseOrderService.getAllPurchaseOrders();
      const suppliers = await supplierService.getAllSuppliers();
      
      // Create supplier lookup map
      const supplierMap = suppliers.reduce((map, supplier) => {
        map[supplier.id] = supplier;
        return map;
      }, {});

      // Enhance orders with supplier details
      const ordersWithSuppliers = orders.map(order => ({
        ...order,
        supplierDetails: order.supplierId ? supplierMap[order.supplierId] : null
      }));

      return ordersWithSuppliers;
    } catch (error) {
      throw new Error(`Error fetching purchase history with suppliers: ${error.message}`);
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, 'purchaseOrders', orderId));
      return true;
    } catch (error) {
      throw new Error(`Error deleting purchase order: ${error.message}`);
    }
  },

  // Get purchase order statistics
  getPurchaseOrderStats: async () => {
    try {
      const orders = await purchaseOrderService.getAllPurchaseOrders();
      
      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        approvedOrders: orders.filter(o => o.status === 'approved').length,
        receivedOrders: orders.filter(o => o.status === 'received').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalValue: orders.reduce((total, order) => total + (order.totalCost || 0), 0),
        highPriorityOrders: orders.filter(o => o.priority === 'high').length
      };

      return stats;
    } catch (error) {
      throw new Error(`Error fetching purchase order stats: ${error.message}`);
    }
  },

  // Listen to purchase order changes in real-time
  subscribePurchaseOrders: (callback) => {
    const q = query(collection(db, 'purchaseOrders'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      const sortedOrders = orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
      
      callback(sortedOrders);
    });
  },

  // Listen to purchase orders by status
  subscribePurchaseOrdersByStatus: (status, callback) => {
    const q = query(
      collection(db, 'purchaseOrders'),
      where('status', '==', status)
    );
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt in JavaScript to avoid composite index requirement
      const sortedOrders = orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
      
      callback(sortedOrders);
    });
  },

  // Initialize with realistic Sri Lankan purchase order data
  initializeSriLankanPurchaseOrders: async () => {
    try {
      console.log('Initializing Sri Lankan purchase orders...');
      
      const sriLankanPurchaseOrders = [
        {
          orderNumber: 'PO-2024-001',
          medicineName: 'Paracetamol 500mg Tablets',
          medicineId: 'MED001',
          supplier: 'State Pharmaceuticals Corporation (SPC)',
          supplierCode: 'SPC001',
          quantityOrdered: 5000,
          unitCost: 2.50,
          totalCost: 12500.00,
          currency: 'LKR',
          status: 'received',
          priority: 'medium',
          orderDate: new Date('2024-01-15'),
          expectedDeliveryDate: new Date('2024-01-20'),
          actualDeliveryDate: new Date('2024-01-19'),
          paymentTerms: '30 days',
          notes: 'Bulk order for essential paracetamol tablets. Good quality as expected.',
          approvedBy: 'Dr. Priya Jayasinghe',
          requestedBy: 'Inventory Manager',
          batchNumber: 'PAR-SPC-240115',
          expiryDate: new Date('2026-01-15'),
          grnNumber: 'GRN-2024-001',
          invoiceNumber: 'SPC-INV-2024-001'
        },
        {
          orderNumber: 'PO-2024-002',
          medicineName: 'Amoxicillin 250mg Capsules',
          medicineId: 'MED002',
          supplier: 'Hemas Pharmaceuticals (Pvt) Ltd',
          supplierCode: 'HMS001',
          quantityOrdered: 2000,
          unitCost: 8.75,
          totalCost: 17500.00,
          currency: 'LKR',
          status: 'approved',
          priority: 'high',
          orderDate: new Date('2024-01-20'),
          expectedDeliveryDate: new Date('2024-01-25'),
          paymentTerms: '45 days',
          notes: 'Urgent requirement for antibiotic capsules. Hospital grade quality needed.',
          approvedBy: 'Dr. Nimal Perera',
          requestedBy: 'Pharmacy Head',
          minStockLevel: 50,
          currentStock: 25,
          reorderPoint: 100
        },
        {
          orderNumber: 'PO-2024-003',
          medicineName: 'Insulin Injection 100IU/ml',
          medicineId: 'MED003',
          supplier: 'Ceylon Cold Stores - Healthcare Division',
          supplierCode: 'CCS001',
          quantityOrdered: 500,
          unitCost: 450.00,
          totalCost: 225000.00,
          currency: 'LKR',
          status: 'pending',
          priority: 'high',
          orderDate: new Date('2024-01-25'),
          expectedDeliveryDate: new Date('2024-01-30'),
          paymentTerms: '30 days',
          notes: 'Temperature-controlled delivery required. Critical for diabetic patients.',
          approvedBy: 'Dr. Chaminda Silva',
          requestedBy: 'Cold Chain Manager',
          specialHandling: 'Refrigerated transport required (2-8°C)',
          currentStock: 15,
          minStockLevel: 20,
          criticalItem: true
        },
        {
          orderNumber: 'PO-2024-004',
          medicineName: 'Aspirin 75mg Tablets',
          medicineId: 'MED004',
          supplier: 'Multipharm (Pvt) Ltd',
          supplierCode: 'MTP001',
          quantityOrdered: 3000,
          unitCost: 1.25,
          totalCost: 3750.00,
          currency: 'LKR',
          status: 'received',
          priority: 'low',
          orderDate: new Date('2024-01-10'),
          expectedDeliveryDate: new Date('2024-01-16'),
          actualDeliveryDate: new Date('2024-01-15'),
          paymentTerms: '30 days',
          notes: 'Generic aspirin for cardiovascular patients. Cost-effective option.',
          approvedBy: 'Dr. Sunil Fernando',
          requestedBy: 'Purchase Manager',
          batchNumber: 'ASP-MTP-240110',
          expiryDate: new Date('2026-01-10'),
          grnNumber: 'GRN-2024-002',
          invoiceNumber: 'MTP-INV-2024-004'
        },
        {
          orderNumber: 'PO-2024-005',
          medicineName: 'Piriton Tablets 4mg',
          medicineId: 'MED005',
          supplier: 'Hemas Pharmaceuticals (Pvt) Ltd',
          supplierCode: 'HMS001',
          quantityOrdered: 1500,
          unitCost: 3.50,
          totalCost: 5250.00,
          currency: 'LKR',
          status: 'approved',
          priority: 'medium',
          orderDate: new Date('2024-01-22'),
          expectedDeliveryDate: new Date('2024-01-27'),
          paymentTerms: '45 days',
          notes: 'Antihistamine tablets for allergy treatment. Popular OTC medicine.',
          approvedBy: 'Dr. Malini Rathnayake',
          requestedBy: 'OTC Manager',
          currentStock: 45,
          minStockLevel: 30,
          reorderPoint: 75
        },
        {
          orderNumber: 'PO-2024-006',
          medicineName: 'Samahan Ayurvedic Tea',
          medicineId: 'MED006',
          supplier: 'Link Natural Products (Pvt) Ltd',
          supplierCode: 'LNK001',
          quantityOrdered: 1000,
          unitCost: 25.00,
          totalCost: 25000.00,
          currency: 'LKR',
          status: 'received',
          priority: 'medium',
          orderDate: new Date('2024-01-18'),
          expectedDeliveryDate: new Date('2024-01-22'),
          actualDeliveryDate: new Date('2024-01-21'),
          paymentTerms: '30 days',
          notes: 'Traditional Ayurvedic remedy for cold and flu. High demand product.',
          approvedBy: 'Dr. Roshan Wijewardena',
          requestedBy: 'Herbal Section Manager',
          batchNumber: 'SAM-LNK-240118',
          expiryDate: new Date('2025-12-18'),
          grnNumber: 'GRN-2024-003',
          invoiceNumber: 'LNK-INV-2024-006'
        },
        {
          orderNumber: 'PO-2024-007',
          medicineName: 'Omeprazole 20mg Capsules',
          medicineId: 'MED007',
          supplier: 'Avant Garde Maritime Services (Pharmaceuticals)',
          supplierCode: 'AGM001',
          quantityOrdered: 800,
          unitCost: 15.50,
          totalCost: 12400.00,
          currency: 'LKR',
          status: 'pending',
          priority: 'medium',
          orderDate: new Date('2024-01-28'),
          expectedDeliveryDate: new Date('2024-02-05'),
          paymentTerms: '60 days',
          notes: 'Imported PPI medication for gastric conditions. Premium quality.',
          approvedBy: 'Dr. Kavinda Jayasuriya',
          requestedBy: 'Prescription Manager',
          importLicense: 'IMP-LIC-2024-007',
          currentStock: 35,
          minStockLevel: 25,
          specialNotes: 'Imported from India with proper documentation'
        },
        {
          orderNumber: 'PO-2024-008',
          medicineName: 'Surgical Masks (50 pcs box)',
          medicineId: 'MED008',
          supplier: 'Asiri Surgical Hospital - Pharmacy Supplies',
          supplierCode: 'ASR001',
          quantityOrdered: 200,
          unitCost: 350.00,
          totalCost: 70000.00,
          currency: 'LKR',
          status: 'approved',
          priority: 'high',
          orderDate: new Date('2024-01-30'),
          expectedDeliveryDate: new Date('2024-02-01'),
          paymentTerms: '15 days',
          notes: 'Medical grade surgical masks for healthcare professionals.',
          approvedBy: 'Dr. Sandun Perera',
          requestedBy: 'Safety Equipment Manager',
          certification: 'CE Marked, ISO 13485',
          currentStock: 50,
          minStockLevel: 100,
          criticalItem: true
        },
        {
          orderNumber: 'PO-2024-009',
          medicineName: 'Vitamin C 500mg Tablets',
          medicineId: 'MED009',
          supplier: 'Osu Sala (Pvt) Ltd - Medical Division',
          supplierCode: 'OSU001',
          quantityOrdered: 2500,
          unitCost: 4.25,
          totalCost: 10625.00,
          currency: 'LKR',
          status: 'received',
          priority: 'low',
          orderDate: new Date('2024-01-12'),
          expectedDeliveryDate: new Date('2024-01-17'),
          actualDeliveryDate: new Date('2024-01-16'),
          paymentTerms: '45 days',
          notes: 'Popular vitamin supplement. Good margin product for retail.',
          approvedBy: 'Dr. Thilini Rajapakse',
          requestedBy: 'Supplement Manager',
          batchNumber: 'VTC-OSU-240112',
          expiryDate: new Date('2026-06-12'),
          grnNumber: 'GRN-2024-004',
          invoiceNumber: 'OSU-INV-2024-009'
        },
        {
          orderNumber: 'PO-2024-010',
          medicineName: 'Cough Syrup 100ml',
          medicineId: 'MED010',
          supplier: 'State Pharmaceuticals Corporation (SPC)',
          supplierCode: 'SPC001',
          quantityOrdered: 1200,
          unitCost: 35.75,
          totalCost: 42900.00,
          currency: 'LKR',
          status: 'approved',
          priority: 'medium',
          orderDate: new Date('2024-02-01'),
          expectedDeliveryDate: new Date('2024-02-06'),
          paymentTerms: '30 days',
          notes: 'Essential cough medication for winter season. High turnover product.',
          approvedBy: 'Dr. Anura Wickramasinghe',
          requestedBy: 'Seasonal Products Manager',
          currentStock: 180,
          minStockLevel: 150,
          reorderPoint: 300,
          seasonalDemand: true
        },
        {
          orderNumber: 'PO-2024-011',
          medicineName: 'Metformin 500mg Tablets',
          medicineId: 'MED011',
          supplier: 'Multipharm (Pvt) Ltd',
          supplierCode: 'MTP001',
          quantityOrdered: 4000,
          unitCost: 2.75,
          totalCost: 11000.00,
          currency: 'LKR',
          status: 'pending',
          priority: 'high',
          orderDate: new Date('2024-02-02'),
          expectedDeliveryDate: new Date('2024-02-08'),
          paymentTerms: '30 days',
          notes: 'Diabetes medication with high demand. Essential for chronic patients.',
          approvedBy: 'Dr. Kumara Dissanayake',
          requestedBy: 'Chronic Care Manager',
          currentStock: 95,
          minStockLevel: 200,
          chronicMedication: true,
          patientCount: 450
        },
        {
          orderNumber: 'PO-2024-012',
          medicineName: 'Bandages Elastic 75mm',
          medicineId: 'MED012',
          supplier: 'Asiri Surgical Hospital - Pharmacy Supplies',
          supplierCode: 'ASR001',
          quantityOrdered: 500,
          unitCost: 125.00,
          totalCost: 62500.00,
          currency: 'LKR',
          status: 'received',
          priority: 'medium',
          orderDate: new Date('2024-01-26'),
          expectedDeliveryDate: new Date('2024-01-28'),
          actualDeliveryDate: new Date('2024-01-27'),
          paymentTerms: '15 days',
          notes: 'Medical grade elastic bandages for wound care and support.',
          approvedBy: 'Dr. Lakmal Fernando',
          requestedBy: 'Medical Supplies Manager',
          batchNumber: 'BND-ASR-240126',
          grnNumber: 'GRN-2024-005',
          invoiceNumber: 'ASR-INV-2024-012',
          medicalDevice: true
        }
      ];

      // Add all purchase orders to Firestore
      for (const order of sriLankanPurchaseOrders) {
        await addDoc(collection(db, 'purchaseOrders'), {
          ...order,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log('Sri Lankan purchase orders initialized successfully');
      return { success: true, count: sriLankanPurchaseOrders.length };
    } catch (error) {
      console.error('Error initializing Sri Lankan purchase orders:', error);
      throw new Error(`Error initializing purchase orders: ${error.message}`);
    }
  }
};
