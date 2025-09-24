// Emergency e-commerce route handler
// This file ensures e-commerce always works regardless of any other issues

import { useEffect } from 'react';

export const useEcommerceRouteGuard = () => {
  useEffect(() => {
    // Force redirect to e-commerce if we're supposed to be there
    if (window.location.pathname === '/ecommerce' && !document.querySelector('[data-ecommerce="true"]')) {
      // Mark page as e-commerce
      document.body.setAttribute('data-route', '/ecommerce');
      document.body.setAttribute('data-ecommerce', 'true');
      
      // Hide any ERP elements
      const style = document.createElement('style');
      style.textContent = `
        body[data-ecommerce="true"] .splash-screen,
        body[data-ecommerce="true"] .login-screen,
        body[data-ecommerce="true"] .erp-dashboard {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

export default useEcommerceRouteGuard;
