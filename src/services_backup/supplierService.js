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

// Supplier Service
export const supplierService = {
  // Create a new supplier
  createSupplier: async (supplierData) => {
    try {
      const supplierRef = await addDoc(collection(db, 'suppliers'), {
        ...supplierData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { 
        success: true, 
        supplierId: supplierRef.id,
        message: 'Supplier created successfully' 
      };
    } catch (error) {
      throw new Error(`Error creating supplier: ${error.message}`);
    }
  },

  // Get all suppliers
  getAllSuppliers: async () => {
    try {
      const q = query(
        collection(db, 'suppliers'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching suppliers: ${error.message}`);
    }
  },

  // Get active suppliers only
  getActiveSuppliers: async () => {
    try {
      const q = query(
        collection(db, 'suppliers'),
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching active suppliers: ${error.message}`);
    }
  },

  // Get supplier by ID
  getSupplierById: async (supplierId) => {
    try {
      const supplierRef = doc(db, 'suppliers', supplierId);
      const supplierSnap = await getDoc(supplierRef);
      
      if (supplierSnap.exists()) {
        return {
          id: supplierSnap.id,
          ...supplierSnap.data()
        };
      } else {
        throw new Error('Supplier not found');
      }
    } catch (error) {
      throw new Error(`Error fetching supplier: ${error.message}`);
    }
  },

  // Update supplier
  updateSupplier: async (supplierId, updateData) => {
    try {
      const supplierRef = doc(db, 'suppliers', supplierId);
      await updateDoc(supplierRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { 
        success: true, 
        message: 'Supplier updated successfully' 
      };
    } catch (error) {
      throw new Error(`Error updating supplier: ${error.message}`);
    }
  },

  // Delete supplier (soft delete by setting status to inactive)
  deleteSupplier: async (supplierId) => {
    try {
      const supplierRef = doc(db, 'suppliers', supplierId);
      await updateDoc(supplierRef, {
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return { 
        success: true, 
        message: 'Supplier deactivated successfully' 
      };
    } catch (error) {
      throw new Error(`Error deleting supplier: ${error.message}`);
    }
  },

  // Get supplier performance metrics
  getSupplierPerformance: async (supplierId) => {
    try {
      // Get all purchase orders for this supplier
      const q = query(
        collection(db, 'purchaseOrders'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate performance metrics
      const totalOrders = orders.length;
      const fulfilledOrders = orders.filter(order => order.status === 'delivered').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

      // Calculate average delivery time
      const deliveredOrders = orders.filter(order => 
        order.status === 'delivered' && 
        order.deliveredAt && 
        order.createdAt
      );

      let avgDeliveryTime = 0;
      if (deliveredOrders.length > 0) {
        const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
          const created = order.createdAt?.toDate?.() || new Date(order.createdAt);
          const delivered = order.deliveredAt?.toDate?.() || new Date(order.deliveredAt);
          return sum + (delivered - created);
        }, 0);
        avgDeliveryTime = totalDeliveryTime / deliveredOrders.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      // Calculate fulfillment rate
      const fulfillmentRate = totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0;

      // Calculate total value
      const totalValue = orders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      return {
        totalOrders,
        fulfilledOrders,
        pendingOrders,
        cancelledOrders,
        fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
        avgDeliveryTime: Math.round(avgDeliveryTime * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100,
        recentOrders: orders.slice(0, 5) // Last 5 orders
      };
    } catch (error) {
      throw new Error(`Error fetching supplier performance: ${error.message}`);
    }
  },

  // Get all suppliers with performance metrics
  getAllSuppliersWithPerformance: async () => {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      const suppliersWithPerformance = await Promise.all(
        suppliers.map(async (supplier) => {
          const performance = await supplierService.getSupplierPerformance(supplier.id);
          return {
            ...supplier,
            performance
          };
        })
      );
      return suppliersWithPerformance;
    } catch (error) {
      throw new Error(`Error fetching suppliers with performance: ${error.message}`);
    }
  },

  // Search suppliers
  searchSuppliers: async (searchTerm) => {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      const searchLower = searchTerm.toLowerCase();
      
      return suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.email?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.phone?.toLowerCase().includes(searchLower) ||
        supplier.contactInfo?.address?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      throw new Error(`Error searching suppliers: ${error.message}`);
    }
  },

  // Listen to suppliers changes in real-time
  subscribeSuppliers: (callback) => {
    const q = query(
      collection(db, 'suppliers'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(suppliers);
    });
  },

  // Listen to active suppliers changes in real-time
  subscribeActiveSuppliers: (callback) => {
    const q = query(
      collection(db, 'suppliers'),
      where('status', '==', 'active'),
      orderBy('name', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const suppliers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(suppliers);
    });
  },

  // Bulk update supplier status
  bulkUpdateSupplierStatus: async (supplierIds, status) => {
    try {
      const batch = writeBatch(db);
      
      for (const supplierId of supplierIds) {
        const supplierRef = doc(db, 'suppliers', supplierId);
        batch.update(supplierRef, {
          status,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      return { 
        success: true, 
        message: `${supplierIds.length} suppliers updated successfully` 
      };
    } catch (error) {
      throw new Error(`Error bulk updating suppliers: ${error.message}`);
    }
  },

  // Get supplier statistics
  getSupplierStats: async () => {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
      const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length;
      
      // Get recent suppliers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSuppliers = suppliers.filter(supplier => {
        const createdAt = supplier.createdAt?.toDate?.() || new Date(supplier.createdAt);
        return createdAt > thirtyDaysAgo;
      }).length;

      return {
        totalSuppliers: suppliers.length,
        activeSuppliers,
        inactiveSuppliers,
        recentSuppliers
      };
    } catch (error) {
      throw new Error(`Error fetching supplier statistics: ${error.message}`);
    }
  }
};
