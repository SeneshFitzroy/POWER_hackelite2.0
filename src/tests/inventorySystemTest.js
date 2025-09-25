import { dataInitializationService } from '../services/dataInitializationService';
import { inventoryService } from '../services/inventoryService';

// Test script to verify the inventory system works with real Firebase data
export const testInventorySystem = async () => {
  console.log('🧪 Testing Inventory System...');
  
  try {
    // Test 1: Check if Firebase is connected
    console.log('1. Testing Firebase connection...');
    const dataExists = await dataInitializationService.checkIfDataExists();
    console.log(`   Data exists: ${dataExists}`);
    
    // Test 2: Initialize data if needed
    if (!dataExists) {
      console.log('2. Initializing real medicine data...');
      await dataInitializationService.initializeAllData();
      console.log('   ✅ Data initialized successfully');
    } else {
      console.log('2. Data already exists, skipping initialization');
    }
    
    // Test 3: Get all medicines
    console.log('3. Fetching all medicines...');
    const allMedicines = await inventoryService.getAllMedicines();
    console.log(`   ✅ Found ${allMedicines.length} medicines`);
    
    // Test 4: Get low stock medicines
    console.log('4. Fetching low stock medicines...');
    const lowStock = await inventoryService.getLowStockMedicines(20);
    console.log(`   ✅ Found ${lowStock.length} low stock medicines`);
    lowStock.forEach(med => {
      console.log(`      - ${med.name}: ${med.stockQuantity} units (min: ${med.minStockLevel})`);
    });
    
    // Test 5: Get expiring medicines
    console.log('5. Fetching expiring medicines...');
    const expiring = await inventoryService.getExpiringMedicines(30);
    console.log(`   ✅ Found ${expiring.length} medicines expiring in 30 days`);
    expiring.forEach(med => {
      console.log(`      - ${med.name}: expires ${med.expiryDate}`);
    });
    
    // Test 6: Get expired medicines
    console.log('6. Fetching expired medicines...');
    const expired = await inventoryService.getExpiredMedicines();
    console.log(`   ✅ Found ${expired.length} expired medicines`);
    expired.forEach(med => {
      console.log(`      - ${med.name}: expired ${med.expiryDate}`);
    });
    
    // Test 7: Get quarantined medicines
    console.log('7. Fetching quarantined medicines...');
    const quarantined = await inventoryService.getQuarantinedMedicines();
    console.log(`   ✅ Found ${quarantined.length} quarantined medicines`);
    quarantined.forEach(med => {
      console.log(`      - ${med.name}: ${med.quarantineReason || 'No reason specified'}`);
    });
    
    // Test 8: Get medicines requiring reorder
    console.log('8. Fetching medicines requiring reorder...');
    const reorder = await inventoryService.getMedicinesRequiringReorder();
    console.log(`   ✅ Found ${reorder.length} medicines requiring reorder`);
    reorder.forEach(med => {
      console.log(`      - ${med.name}: ${med.stockQuantity} units (reorder at: ${med.reorderPoint})`);
    });
    
    // Test 9: Get inventory statistics
    console.log('9. Calculating inventory statistics...');
    const stats = await inventoryService.getInventoryStats();
    console.log('   ✅ Inventory Statistics:');
    console.log(`      - Total Medicines: ${stats.totalMedicines}`);
    console.log(`      - Active Medicines: ${stats.activeMedicines}`);
    console.log(`      - Low Stock: ${stats.lowStockMedicines}`);
    console.log(`      - Expiring Soon: ${stats.expiringMedicines}`);
    console.log(`      - Expired: ${stats.expiredMedicines}`);
    console.log(`      - Total Stock Value: $${stats.totalStockValue.toFixed(2)}`);
    
    console.log('\n🎉 All tests passed! Inventory system is working with real Firebase data.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Test function available for manual testing if needed
// Call testInventorySystem() in console to run tests manually
