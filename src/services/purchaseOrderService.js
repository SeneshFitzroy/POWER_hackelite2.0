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
  }
};
