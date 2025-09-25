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
  },

  // Initialize with realistic Sri Lankan supplier data
  initializeSriLankanSuppliers: async () => {
    try {
      console.log('Initializing Sri Lankan suppliers...');
      
      const sriLankanSuppliers = [
        {
          name: 'State Pharmaceuticals Corporation (SPC)',
          contactInfo: {
            email: 'procurement@spc.lk',
            phone: '+94-11-2693411',
            address: '75, Sir Chittampalam A Gardiner Mawatha, Colombo 02',
            contactPerson: 'Mr. Samantha Perera'
          },
          category: 'government_distributor',
          specialization: ['generic_medicines', 'vaccines', 'essential_medicines'],
          rating: 4.8,
          status: 'active',
          paymentTerms: '30 days',
          minimumOrderValue: 50000.00,
          currency: 'LKR',
          deliveryTime: '3-5 business days',
          certifications: ['GMP', 'WHO-PQ', 'NMRA'],
          bankDetails: {
            bank: 'Bank of Ceylon',
            accountNumber: '7001234567',
            branch: 'Colombo Main'
          },
          notes: 'Primary government supplier for essential medicines and vaccines. Reliable for bulk orders.',
          establishedYear: 1971,
          website: 'www.spc.lk',
          supplierCode: 'SPC001'
        },
        {
          name: 'Hemas Pharmaceuticals (Pvt) Ltd',
          contactInfo: {
            email: 'sales@hemas.com',
            phone: '+94-11-2741741',
            address: 'Hemas House, 75, Braybrooke Place, Colombo 02',
            contactPerson: 'Dr. Nimal Silva'
          },
          category: 'private_pharmaceutical',
          specialization: ['branded_medicines', 'otc_products', 'medical_equipment'],
          rating: 4.6,
          status: 'active',
          paymentTerms: '45 days',
          minimumOrderValue: 25000.00,
          currency: 'LKR',
          deliveryTime: '2-4 business days',
          certifications: ['GMP', 'ISO 9001', 'HACCP'],
          bankDetails: {
            bank: 'Commercial Bank of Ceylon',
            accountNumber: '8001234567',
            branch: 'Colombo 02'
          },
          notes: 'Leading pharmaceutical company with strong OTC and prescription medicine portfolio.',
          establishedYear: 1948,
          website: 'www.hemas.com',
          supplierCode: 'HMS001'
        },
        {
          name: 'Avant Garde Maritime Services (Pharmaceuticals)',
          contactInfo: {
            email: 'pharma@avantgarde.lk',
            phone: '+94-11-2445445',
            address: 'Maritime House, 3-5, Fleming Place, Colombo 02',
            contactPerson: 'Ms. Chamari Fernando'
          },
          category: 'import_distributor',
          specialization: ['imported_medicines', 'specialty_drugs', 'medical_devices'],
          rating: 4.3,
          status: 'active',
          paymentTerms: '60 days',
          minimumOrderValue: 75000.00,
          currency: 'LKR',
          deliveryTime: '5-7 business days',
          certifications: ['GDP', 'ISO 13485'],
          bankDetails: {
            bank: 'Hatton National Bank',
            accountNumber: '9001234567',
            branch: 'Colombo Fort'
          },
          notes: 'Specialized in importing high-quality international pharmaceutical products.',
          establishedYear: 2003,
          website: 'www.avantgarde.lk',
          supplierCode: 'AGM001'
        },
        {
          name: 'Link Natural Products (Pvt) Ltd',
          contactInfo: {
            email: 'orders@linknatural.lk',
            phone: '+94-11-2505050',
            address: '138, Vauxhall Street, Colombo 02',
            contactPerson: 'Mr. Roshan Jayawardena'
          },
          category: 'herbal_ayurvedic',
          specialization: ['ayurvedic_medicines', 'herbal_products', 'natural_supplements'],
          rating: 4.4,
          status: 'active',
          paymentTerms: '30 days',
          minimumOrderValue: 15000.00,
          currency: 'LKR',
          deliveryTime: '2-3 business days',
          certifications: ['Ayurvedic Department Approval', 'GMP'],
          bankDetails: {
            bank: 'Peoples Bank',
            accountNumber: '6001234567',
            branch: 'Pettah'
          },
          notes: 'Leading supplier of traditional Ayurvedic and herbal medicine products.',
          establishedYear: 1982,
          website: 'www.linknatural.lk',
          supplierCode: 'LNK001'
        },
        {
          name: 'Asiri Surgical Hospital - Pharmacy Supplies',
          contactInfo: {
            email: 'pharmacy.procurement@asiri.lk',
            phone: '+94-11-4665500',
            address: '21, Kirimandala Mawatha, Narahenpita, Colombo 05',
            contactPerson: 'Dr. Sunil Wijeratne'
          },
          category: 'hospital_supplier',
          specialization: ['hospital_medicines', 'surgical_supplies', 'emergency_medicines'],
          rating: 4.7,
          status: 'active',
          paymentTerms: '15 days',
          minimumOrderValue: 35000.00,
          currency: 'LKR',
          deliveryTime: '1-2 business days',
          certifications: ['Hospital Grade', 'Emergency Supply Certified'],
          bankDetails: {
            bank: 'Sampath Bank',
            accountNumber: '5001234567',
            branch: 'Narahenpita'
          },
          notes: 'Hospital-grade medicines and emergency supplies. Fast delivery for urgent orders.',
          establishedYear: 1987,
          website: 'www.asiri.lk',
          supplierCode: 'ASR001'
        },
        {
          name: 'Ceylon Cold Stores - Healthcare Division',
          contactInfo: {
            email: 'healthcare@ccs.lk',
            phone: '+94-11-2421421',
            address: 'CCS Towers, 299, Union Place, Colombo 02',
            contactPerson: 'Mr. Dinesh Rodrigo'
          },
          category: 'cold_chain_supplier',
          specialization: ['refrigerated_medicines', 'vaccines', 'biologics'],
          rating: 4.5,
          status: 'active',
          paymentTerms: '30 days',
          minimumOrderValue: 40000.00,
          currency: 'LKR',
          deliveryTime: '2-3 business days',
          certifications: ['Cold Chain Management', 'WHO Temperature Control'],
          bankDetails: {
            bank: 'National Development Bank',
            accountNumber: '4001234567',
            branch: 'Union Place'
          },
          notes: 'Specialized in temperature-controlled pharmaceutical storage and distribution.',
          establishedYear: 1866,
          website: 'www.ccs.lk',
          supplierCode: 'CCS001'
        },
        {
          name: 'Osu Sala (Pvt) Ltd - Medical Division',
          contactInfo: {
            email: 'medical@osusala.lk',
            phone: '+94-11-2691691',
            address: '29, R.A. De Mel Mawatha, Colombo 03',
            contactPerson: 'Ms. Malini Wickramasinghe'
          },
          category: 'retail_chain_supplier',
          specialization: ['otc_medicines', 'consumer_healthcare', 'pharmacy_retail'],
          rating: 4.2,
          status: 'active',
          paymentTerms: '45 days',
          minimumOrderValue: 20000.00,
          currency: 'LKR',
          deliveryTime: '3-4 business days',
          certifications: ['Retail Pharmacy Standards', 'Consumer Safety'],
          bankDetails: {
            bank: 'Seylan Bank',
            accountNumber: '3001234567',
            branch: 'Bambalapitiya'
          },
          notes: 'Major pharmacy chain supplier with extensive OTC and consumer healthcare products.',
          establishedYear: 1990,
          website: 'www.osusala.lk',
          supplierCode: 'OSU001'
        },
        {
          name: 'Multipharm (Pvt) Ltd',
          contactInfo: {
            email: 'sales@multipharm.lk',
            phone: '+94-11-2872872',
            address: '120, Galle Road, Mount Lavinia, Colombo',
            contactPerson: 'Dr. Chandana Rathnayake'
          },
          category: 'generic_manufacturer',
          specialization: ['generic_medicines', 'bulk_pharmaceuticals', 'api_ingredients'],
          rating: 4.4,
          status: 'active',
          paymentTerms: '30 days',
          minimumOrderValue: 30000.00,
          currency: 'LKR',
          deliveryTime: '4-6 business days',
          certifications: ['GMP', 'FDA Approved Facility'],
          bankDetails: {
            bank: 'Nations Trust Bank',
            accountNumber: '2001234567',
            branch: 'Mount Lavinia'
          },
          notes: 'Local manufacturer of high-quality generic medicines with competitive pricing.',
          establishedYear: 1995,
          website: 'www.multipharm.lk',
          supplierCode: 'MTP001'
        }
      ];

      // Add all suppliers to Firestore
      for (const supplier of sriLankanSuppliers) {
        await addDoc(collection(db, 'suppliers'), {
          ...supplier,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log('Sri Lankan suppliers initialized successfully');
      return { success: true, count: sriLankanSuppliers.length };
    } catch (error) {
      console.error('Error initializing Sri Lankan suppliers:', error);
      throw new Error(`Error initializing suppliers: ${error.message}`);
    }
  }
};
