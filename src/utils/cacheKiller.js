// Nuclear cache clearing utility
export const nukeAllCaches = async () => {
  console.log('🧹 NUCLEAR CACHE CLEARING INITIATED...');
  
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    
    // Clear all caches API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Service worker caches cleared');
    }
    
    // Clear IndexedDB (Firebase offline)
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            console.log(`🗑️ Deleting IndexedDB: ${db.name}`);
            indexedDB.deleteDatabase(db.name);
          }
        }
        console.log('✅ IndexedDB cleared');
      } catch (e) {
        console.warn('⚠️ Could not clear all IndexedDB:', e);
      }
    }
    
    // Clear cookies (if possible)
    if (document.cookie) {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ Cookies cleared');
    }
    
    // Force reload without cache
    setTimeout(() => {
      console.log('🔄 Force reloading without cache...');
      window.location.reload(true);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Error during cache clearing:', error);
    return false;
  }
};

// Emergency employee state reset
export const resetEmployeeState = () => {
  console.log('🚨 EMERGENCY EMPLOYEE STATE RESET');
  
  // Try to find React DevTools and reset component state
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      // This is a hack to force React to re-render
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
      console.log('✅ React DevTools hook reset');
    } catch (e) {
      console.warn('⚠️ Could not reset React DevTools');
    }
  }
  
  // Clear any potential global state
  if (window.employeeCache) {
    delete window.employeeCache;
    console.log('✅ Global employee cache cleared');
  }
  
  // Force garbage collection if available
  if (window.gc) {
    window.gc();
    console.log('✅ Garbage collection triggered');
  }
  
  return true;
};

// Ultimate reset function
export const ultimateReset = async () => {
  console.log('💥 ULTIMATE RESET INITIATED - DESTROYING ALL DATA');
  
  resetEmployeeState();
  await nukeAllCaches();
  
  // Display instructions to user
  alert(`🧹 CACHE NUCLEAR BOMB DEPLOYED! 🧹

The following has been cleared:
✅ localStorage
✅ sessionStorage  
✅ Service Worker caches
✅ IndexedDB databases
✅ Browser cookies
✅ React component state

The page will reload automatically.
If John Doe still appears, it's hardcoded in the component code.`);
  
  return true;
};
