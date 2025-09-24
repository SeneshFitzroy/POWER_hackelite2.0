// Enhanced Sri Lankan Pharmacy Database - Complete Product Range
export const medicineCategories = [
  {
    id: 'pain-relief',
    name: 'Pain Relief & Analgesics',
    icon: '💊',
    description: 'Pain relief medications and fever reducers',
    subcategories: ['Headache Relief', 'Muscle Pain', 'Joint Pain', 'Fever Reducers']
  },
  {
    id: 'cold-flu',
    name: 'Cold, Cough & Flu',
    icon: '🤧',
    description: 'Cold, cough and flu remedies',
    subcategories: ['Cough Syrups', 'Throat Lozenges', 'Nasal Decongestants', 'Flu Relief']
  },
  {
    id: 'digestive',
    name: 'Digestive Health',
    icon: '🍃',
    description: 'Digestive aids and stomach care',
    subcategories: ['Antacids', 'Anti-diarrheal', 'Laxatives', 'Probiotics']
  },
  {
    id: 'vitamins',
    name: 'Vitamins & Supplements',
    icon: '🌟',
    description: 'Essential vitamins and dietary supplements',
    subcategories: ['Multivitamins', 'Vitamin C', 'Vitamin D', 'Calcium', 'Iron']
  },
  {
    id: 'skincare',
    name: 'Skin Care & Beauty',
    icon: '✨',
    description: 'Skin care and beauty products',
    subcategories: ['Acne Treatment', 'Anti-aging', 'Moisturizers', 'Sunscreens']
  },
  {
    id: 'baby-care',
    name: 'Baby & Mother Care',
    icon: '👶',
    description: 'Baby care and maternal health',
    subcategories: ['Baby Formula', 'Diapers', 'Baby Lotions', 'Prenatal Vitamins']
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '🧼',
    description: 'Personal hygiene and care products',
    subcategories: ['Oral Care', 'Hair Care', 'Body Care', 'Feminine Care']
  },
  {
    id: 'first-aid',
    name: 'First Aid & Medical',
    icon: '🩹',
    description: 'First aid and medical supplies',
    subcategories: ['Bandages', 'Antiseptics', 'Thermometers', 'Blood Pressure Monitors']
  }
];

export const sriLankanBrands = [
  'Link Natural Products', 'Hemas Pharmaceuticals', 'Astron Limited', 'Ceylon Pharmaceuticals',
  'State Pharmaceuticals', 'Sigma Pharmaceuticals', 'Kothalawala Pharmaceuticals', 'Panadol',
  'Brufen', 'Disprin', 'Piriton', 'Gaviscon', 'Berocca', 'Centrum', 'Johnson\'s', 'Nivea'
];

export const medicineProducts = [
  // Pain Relief & Analgesics (Enhanced)
  {
    id: 'paracetamol-500mg',
    name: 'Paracetamol 500mg Tablets',
    category: 'pain-relief',
    subcategory: 'Fever Reducers',
    brand: 'Link Natural Products',
    price: 195.00,
    originalPrice: 240.00,
    inStock: true,
    stockCount: 250,
    rating: 4.8,
    reviewCount: 1847,
    image: '/images/medicines/paracetamol-500mg.jpg',
    description: 'Fast-acting pain relief and fever reducer. Safe for adults and children over 12 years. Made in Sri Lanka.',
    longDescription: 'Paracetamol is one of the most widely used pain relievers and fever reducers. It works by blocking the production of prostaglandins, chemicals that cause pain and fever. This formulation is specifically designed for the Sri Lankan market with optimal dosing.',
    dosage: '1-2 tablets every 4-6 hours, maximum 8 tablets in 24 hours',
    activeIngredient: 'Paracetamol 500mg',
    packSize: '20 tablets',
    manufacturer: 'Link Natural Products (Pvt) Ltd',
    countryOfOrigin: 'Sri Lanka',
    expiryMonths: 36,
    prescription: false,
    features: ['Fast Acting', 'Fever Reducer', 'Pain Relief', 'Headache Relief', 'Local Brand'],
    tags: ['pain', 'fever', 'headache', 'safe', 'tablets'],
    sizes: ['10 tablets - Rs. 98', '20 tablets - Rs. 195', '50 tablets - Rs. 450']
  },
  {
    id: 'ibuprofen-400mg',
    name: 'Ibuprofen 400mg Tablets',
    category: 'pain-relief',
    subcategory: 'Muscle Pain',
    brand: 'Brufen',
    price: 650.00,
    originalPrice: 720.00,
    inStock: true,
    stockCount: 189,
    rating: 4.7,
    reviewCount: 1256,
    image: '/images/medicines/ibuprofen-400mg.jpg',
    description: 'Anti-inflammatory pain reliever for muscle aches, headaches, and joint pain.',
    longDescription: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that reduces inflammation, pain, and fever. Excellent for sports injuries, muscle strains, and arthritis pain.',
    dosage: '1 tablet every 6-8 hours with food, maximum 3 tablets daily',
    activeIngredient: 'Ibuprofen 400mg',
    packSize: '20 tablets',
    manufacturer: 'Abbott Healthcare',
    countryOfOrigin: 'Singapore',
    expiryMonths: 24,
    prescription: false,
    features: ['Anti-inflammatory', 'Muscle Pain', 'Joint Pain', 'Sports Injuries'],
    tags: ['muscle', 'joint', 'inflammation', 'sports', 'nsaid'],
    sizes: ['10 tablets - Rs. 350', '20 tablets - Rs. 650', '30 tablets - Rs. 900']
  },
  {
    id: 'aspirin-300mg',
    name: 'Aspirin 300mg Dispersible',
    category: 'pain-relief',
    subcategory: 'Headache Relief',
    brand: 'Disprin',
    price: 380.00,
    originalPrice: 420.00,
    inStock: true,
    stockCount: 303,
    rating: 4.6,
    reviewCount: 874,
    image: '/images/medicines/aspirin-300mg.jpg',
    description: 'Dispersible aspirin for quick pain relief and fever reduction.',
    longDescription: 'Fast-dissolving aspirin tablets that work quickly to relieve pain and reduce fever. The dispersible format ensures faster absorption and gentler on the stomach.',
    dosage: '1-2 tablets dissolved in water every 4 hours as needed',
    activeIngredient: 'Aspirin 300mg',
    packSize: '20 tablets',
    manufacturer: 'Reckitt Benckiser',
    countryOfOrigin: 'UK',
    expiryMonths: 48,
    prescription: false,
    features: ['Fast Dissolving', 'Pain Relief', 'Fever Reducer', 'Quick Action'],
    tags: ['aspirin', 'dispersible', 'fast', 'headache', 'fever'],
    sizes: ['10 tablets - Rs. 200', '20 tablets - Rs. 380', '40 tablets - Rs. 720']
  },

  // Cold, Cough & Flu (Enhanced)
  {
    id: 'cough-syrup-honey',
    name: 'Honey & Lemon Cough Syrup',
    category: 'cold-flu',
    subcategory: 'Cough Syrups',
    brand: 'Piriton',
    price: 850.00,
    originalPrice: 950.00,
    inStock: true,
    stockCount: 147,
    rating: 4.5,
    reviewCount: 632,
    image: '/images/medicines/cough-syrup-honey.jpg',
    description: 'Natural honey and lemon cough syrup for dry and productive coughs.',
    longDescription: 'Soothing cough syrup with natural honey and lemon extract. Effective for both dry and chesty coughs. The honey coats the throat while the active ingredients suppress the cough reflex.',
    dosage: '10ml (2 teaspoons) 3-4 times daily',
    activeIngredient: 'Dextromethorphan HBr 15mg/10ml',
    packSize: '100ml bottle',
    manufacturer: 'GSK Consumer Healthcare',
    countryOfOrigin: 'India',
    expiryMonths: 36,
    prescription: false,
    features: ['Natural Honey', 'Lemon Extract', 'Dry & Wet Cough', 'Soothing'],
    tags: ['cough', 'honey', 'lemon', 'natural', 'syrup'],
    sizes: ['60ml - Rs. 520', '100ml - Rs. 850', '200ml - Rs. 1580']
  },
  {
    id: 'throat-lozenges',
    name: 'Menthol Throat Lozenges',
    category: 'cold-flu',
    subcategory: 'Throat Lozenges',
    brand: 'Strepsils',
    price: 285.00,
    originalPrice: 320.00,
    inStock: true,
    stockCount: 412,
    rating: 4.4,
    reviewCount: 928,
    image: '/images/medicines/throat-lozenges.jpg',
    description: 'Antiseptic throat lozenges with menthol for sore throat relief.',
    longDescription: 'Fast-acting throat lozenges that provide antiseptic action against bacteria and viruses. The menthol provides cooling relief while the active ingredients fight infection.',
    dosage: '1 lozenge every 2-3 hours, maximum 8 per day',
    activeIngredient: 'Amylmetacresol 0.6mg, Dichlorobenzyl alcohol 1.2mg',
    packSize: '16 lozenges',
    manufacturer: 'Reckitt Benckiser',
    countryOfOrigin: 'UK',
    expiryMonths: 60,
    prescription: false,
    features: ['Antiseptic', 'Menthol Cooling', 'Sore Throat', 'Fast Acting'],
    tags: ['throat', 'lozenges', 'menthol', 'antiseptic', 'sore'],
    sizes: ['8 lozenges - Rs. 150', '16 lozenges - Rs. 285', '24 lozenges - Rs. 420']
  },

  // Digestive Health (Enhanced)
  {
    id: 'gaviscon-liquid',
    name: 'Gaviscon Liquid Antacid',
    category: 'digestive',
    subcategory: 'Antacids',
    brand: 'Gaviscon',
    price: 1250.00,
    originalPrice: 1380.00,
    inStock: true,
    stockCount: 78,
    rating: 4.7,
    reviewCount: 456,
    image: '/images/medicines/gaviscon-liquid.jpg',
    description: 'Fast-acting liquid antacid for heartburn and indigestion relief.',
    longDescription: 'Advanced liquid antacid that forms a protective barrier on top of stomach contents, preventing acid reflux. Provides fast and long-lasting relief from heartburn and indigestion.',
    dosage: '10-20ml after meals and at bedtime',
    activeIngredient: 'Sodium Alginate, Sodium Bicarbonate, Calcium Carbonate',
    packSize: '150ml bottle',
    manufacturer: 'GSK Consumer Healthcare',
    countryOfOrigin: 'India',
    expiryMonths: 24,
    prescription: false,
    features: ['Fast Acting', 'Long Lasting', 'Barrier Formation', 'Liquid Formula'],
    tags: ['antacid', 'heartburn', 'indigestion', 'liquid', 'fast'],
    sizes: ['75ml - Rs. 650', '150ml - Rs. 1250', '300ml - Rs. 2200']
  },
  {
    id: 'ors-sachets',
    name: 'ORS Oral Rehydration Salts',
    category: 'digestive',
    subcategory: 'Anti-diarrheal',
    brand: 'State Pharmaceuticals',
    price: 45.00,
    originalPrice: 55.00,
    inStock: true,
    stockCount: 567,
    rating: 4.9,
    reviewCount: 1234,
    image: '/images/medicines/ors-sachets.jpg',
    description: 'WHO formula oral rehydration salts for dehydration treatment.',
    longDescription: 'World Health Organization approved formula for treating dehydration caused by diarrhea, vomiting, or excessive sweating. Essential for every household, especially during monsoon season.',
    dosage: '1 sachet dissolved in 200ml clean water, drink immediately',
    activeIngredient: 'Sodium Chloride 2.6g, Glucose 13.5g, Potassium Chloride 1.5g',
    packSize: '10 sachets',
    manufacturer: 'State Pharmaceuticals Corporation',
    countryOfOrigin: 'Sri Lanka',
    expiryMonths: 60,
    prescription: false,
    features: ['WHO Formula', 'Local Product', 'Essential Medicine', 'Dehydration Treatment'],
    tags: ['ors', 'dehydration', 'diarrhea', 'local', 'essential'],
    sizes: ['5 sachets - Rs. 25', '10 sachets - Rs. 45', '20 sachets - Rs. 85']
  },

  // Vitamins & Supplements (Enhanced)
  {
    id: 'vitamin-c-1000mg',
    name: 'Vitamin C 1000mg Tablets',
    category: 'vitamins',
    subcategory: 'Vitamin C',
    brand: 'Berocca',
    price: 1850.00,
    originalPrice: 2100.00,
    inStock: true,
    stockCount: 92,
    rating: 4.6,
    reviewCount: 743,
    image: '/images/medicines/vitamin-c-1000mg.jpg',
    description: 'High-potency Vitamin C for immune system support and antioxidant protection.',
    longDescription: 'Premium quality Vitamin C supplement that supports immune function, collagen synthesis, and provides powerful antioxidant protection. Essential during flu season and for overall health maintenance.',
    dosage: '1 tablet daily with meals',
    activeIngredient: 'Ascorbic Acid 1000mg',
    packSize: '30 tablets',
    manufacturer: 'Bayer Consumer Care',
    countryOfOrigin: 'Germany',
    expiryMonths: 36,
    prescription: false,
    features: ['High Potency', 'Immune Support', 'Antioxidant', 'Premium Quality'],
    tags: ['vitamin c', 'immune', 'antioxidant', 'health', 'premium'],
    sizes: ['15 tablets - Rs. 950', '30 tablets - Rs. 1850', '60 tablets - Rs. 3500']
  },
  {
    id: 'multivitamin-adult',
    name: 'Adult Multivitamin Complete',
    category: 'vitamins',
    subcategory: 'Multivitamins',
    brand: 'Centrum',
    price: 2450.00,
    originalPrice: 2800.00,
    inStock: true,
    stockCount: 134,
    rating: 4.5,
    reviewCount: 892,
    image: '/images/medicines/multivitamin-adult.jpg',
    description: 'Complete multivitamin and mineral supplement for daily nutritional support.',
    longDescription: 'Comprehensive multivitamin formula with 23 essential vitamins and minerals. Specially formulated for adults to fill nutritional gaps in the diet and support overall health and energy levels.',
    dosage: '1 tablet daily with breakfast',
    activeIngredient: '23 Vitamins & Minerals including A, C, D, E, B-Complex, Iron, Calcium',
    packSize: '30 tablets',
    manufacturer: 'Pfizer Consumer Healthcare',
    countryOfOrigin: 'USA',
    expiryMonths: 48,
    prescription: false,
    features: ['23 Nutrients', 'Energy Support', 'Immune Health', 'Complete Formula'],
    tags: ['multivitamin', 'complete', 'energy', 'health', 'daily'],
    sizes: ['15 tablets - Rs. 1250', '30 tablets - Rs. 2450', '60 tablets - Rs. 4650']
  },

  // Skin Care & Beauty (Enhanced)
  {
    id: 'acne-treatment-gel',
    name: 'Acne Treatment Gel 2.5%',
    category: 'skincare',
    subcategory: 'Acne Treatment',
    brand: 'Neutrogena',
    price: 1680.00,
    originalPrice: 1950.00,
    inStock: true,
    stockCount: 67,
    rating: 4.3,
    reviewCount: 534,
    image: '/images/medicines/acne-treatment-gel.jpg',
    description: 'Benzoyl peroxide gel for effective acne treatment and prevention.',
    longDescription: 'Clinically proven acne treatment gel that kills acne-causing bacteria and helps prevent new breakouts. Gentle formula suitable for daily use on face and body acne.',
    dosage: 'Apply thin layer to affected areas once daily, gradually increase to twice daily',
    activeIngredient: 'Benzoyl Peroxide 2.5%',
    packSize: '50g tube',
    manufacturer: 'Johnson & Johnson',
    countryOfOrigin: 'USA',
    expiryMonths: 36,
    prescription: false,
    features: ['Clinically Proven', 'Bacteria Killing', 'Prevents Breakouts', 'Gentle Formula'],
    tags: ['acne', 'benzoyl peroxide', 'treatment', 'skin', 'gel'],
    sizes: ['25g - Rs. 890', '50g - Rs. 1680', '75g - Rs. 2350']
  },
  {
    id: 'sunscreen-spf50',
    name: 'Sunscreen Lotion SPF 50+',
    category: 'skincare',
    subcategory: 'Sunscreens',
    brand: 'Nivea',
    price: 1350.00,
    originalPrice: 1580.00,
    inStock: true,
    stockCount: 198,
    rating: 4.7,
    reviewCount: 1156,
    image: '/images/medicines/sunscreen-spf50.jpg',
    description: 'Broad spectrum sunscreen with SPF 50+ protection for all skin types.',
    longDescription: 'High protection sunscreen that provides broad spectrum UVA/UVB protection. Water-resistant formula perfect for Sri Lankan tropical climate. Non-greasy and suitable for daily use.',
    dosage: 'Apply liberally 15 minutes before sun exposure, reapply every 2 hours',
    activeIngredient: 'Zinc Oxide, Titanium Dioxide, Chemical UV Filters',
    packSize: '100ml bottle',
    manufacturer: 'Beiersdorf AG',
    countryOfOrigin: 'Germany',
    expiryMonths: 36,
    prescription: false,
    features: ['SPF 50+', 'Water Resistant', 'Broad Spectrum', 'Non-greasy'],
    tags: ['sunscreen', 'spf50', 'protection', 'water resistant', 'daily'],
    sizes: ['50ml - Rs. 750', '100ml - Rs. 1350', '200ml - Rs. 2450']
  },

  // Baby & Mother Care (Enhanced)
  {
    id: 'baby-lotion-gentle',
    name: 'Baby Gentle Daily Lotion',
    category: 'baby-care',
    subcategory: 'Baby Lotions',
    brand: 'Johnson\'s Baby',
    price: 850.00,
    originalPrice: 980.00,
    inStock: true,
    stockCount: 276,
    rating: 4.8,
    reviewCount: 1687,
    image: '/images/medicines/baby-lotion-gentle.jpg',
    description: 'Gentle daily moisturizing lotion for baby\'s delicate skin.',
    longDescription: 'Pediatrician-tested gentle lotion that moisturizes baby\'s skin for 24 hours. Hypoallergenic formula with natural ingredients, free from parabens, sulfates, and dyes.',
    dosage: 'Apply gently all over baby\'s body after bath or as needed',
    activeIngredient: 'Natural moisturizers, Vitamin E, Chamomile extract',
    packSize: '200ml bottle',
    manufacturer: 'Johnson & Johnson',
    countryOfOrigin: 'India',
    expiryMonths: 36,
    prescription: false,
    features: ['Pediatrician Tested', 'Hypoallergenic', 'Natural Ingredients', '24hr Moisture'],
    tags: ['baby', 'lotion', 'gentle', 'moisturizer', 'natural'],
    sizes: ['100ml - Rs. 450', '200ml - Rs. 850', '400ml - Rs. 1580']
  },
  {
    id: 'prenatal-vitamins',
    name: 'Prenatal Vitamins with Folic Acid',
    category: 'baby-care',
    subcategory: 'Prenatal Vitamins',
    brand: 'Hemas Pharmaceuticals',
    price: 1950.00,
    originalPrice: 2200.00,
    inStock: true,
    stockCount: 89,
    rating: 4.6,
    reviewCount: 432,
    image: '/images/medicines/prenatal-vitamins.jpg',
    description: 'Complete prenatal vitamin formula for expecting and nursing mothers.',
    longDescription: 'Specially formulated multivitamin for pregnant and breastfeeding women. Contains essential nutrients including folic acid, iron, calcium, and DHA for mother and baby\'s health.',
    dosage: '1 tablet daily with meals or as directed by healthcare provider',
    activeIngredient: 'Folic Acid 800mcg, Iron 27mg, Calcium 200mg, DHA 200mg, Multivitamins',
    packSize: '30 tablets',
    manufacturer: 'Hemas Pharmaceuticals (Pvt) Ltd',
    countryOfOrigin: 'Sri Lanka',
    expiryMonths: 24,
    prescription: false,
    features: ['Local Product', 'Complete Formula', 'Folic Acid', 'Iron & Calcium'],
    tags: ['prenatal', 'pregnancy', 'folic acid', 'local', 'vitamins'],
    sizes: ['15 tablets - Rs. 1050', '30 tablets - Rs. 1950', '60 tablets - Rs. 3650']
  },

  // Personal Care (Enhanced)
  {
    id: 'toothpaste-whitening',
    name: 'Whitening Toothpaste with Fluoride',
    category: 'personal-care',
    subcategory: 'Oral Care',
    brand: 'Signal',
    price: 420.00,
    originalPrice: 480.00,
    inStock: true,
    stockCount: 345,
    rating: 4.4,
    reviewCount: 2156,
    image: '/images/medicines/toothpaste-whitening.jpg',
    description: 'Advanced whitening toothpaste with fluoride protection against cavities.',
    longDescription: 'Professional whitening formula that removes surface stains while providing cavity protection. Contains fluoride for strong teeth and fresh breath protection for up to 12 hours.',
    dosage: 'Brush twice daily for 2 minutes',
    activeIngredient: 'Sodium Fluoride 1450ppm, Whitening agents',
    packSize: '100g tube',
    manufacturer: 'Unilever',
    countryOfOrigin: 'Sri Lanka',
    expiryMonths: 36,
    prescription: false,
    features: ['Whitening Formula', 'Cavity Protection', 'Fresh Breath', 'Local Product'],
    tags: ['toothpaste', 'whitening', 'fluoride', 'oral care', 'local'],
    sizes: ['50g - Rs. 220', '100g - Rs. 420', '150g - Rs. 590']
  },
  {
    id: 'antiseptic-mouthwash',
    name: 'Antiseptic Mouthwash',
    category: 'personal-care',
    subcategory: 'Oral Care',
    brand: 'Listerine',
    price: 780.00,
    originalPrice: 890.00,
    inStock: true,
    stockCount: 156,
    rating: 4.5,
    reviewCount: 876,
    image: '/images/medicines/antiseptic-mouthwash.jpg',
    description: 'Antiseptic mouthwash that kills 99.9% of germs and freshens breath.',
    longDescription: 'Clinical strength antiseptic mouthwash that kills germs that cause bad breath, plaque, and gingivitis. Provides 24-hour protection when used twice daily.',
    dosage: 'Rinse with 20ml for 30 seconds twice daily',
    activeIngredient: 'Eucalyptol, Menthol, Methyl salicylate, Thymol',
    packSize: '250ml bottle',
    manufacturer: 'Johnson & Johnson',
    countryOfOrigin: 'Thailand',
    expiryMonths: 36,
    prescription: false,
    features: ['Kills 99.9% Germs', '24hr Protection', 'Freshens Breath', 'Clinical Strength'],
    tags: ['mouthwash', 'antiseptic', 'germs', 'breath', 'protection'],
    sizes: ['100ml - Rs. 350', '250ml - Rs. 780', '500ml - Rs. 1450']
  },

  // First Aid & Medical (Enhanced)
  {
    id: 'digital-thermometer',
    name: 'Digital Fever Thermometer',
    category: 'first-aid',
    subcategory: 'Thermometers',
    brand: 'Omron',
    price: 1850.00,
    originalPrice: 2100.00,
    inStock: true,
    stockCount: 45,
    rating: 4.7,
    reviewCount: 234,
    image: '/images/medicines/digital-thermometer.jpg',
    description: 'Fast and accurate digital thermometer for fever monitoring.',
    longDescription: 'Clinically accurate digital thermometer with 10-second reading time. Features fever alarm, memory recall, and waterproof design. Essential for every household.',
    dosage: 'Place under tongue, in armpit, or rectally as appropriate',
    activeIngredient: 'Digital sensor technology',
    packSize: '1 thermometer with case',
    manufacturer: 'Omron Healthcare',
    countryOfOrigin: 'Japan',
    expiryMonths: 0, // No expiry for devices
    prescription: false,
    features: ['10 Second Reading', 'Fever Alarm', 'Memory Recall', 'Waterproof'],
    tags: ['thermometer', 'digital', 'fever', 'accurate', 'fast'],
    sizes: ['Standard - Rs. 1850']
  },
  {
    id: 'antiseptic-solution',
    name: 'Antiseptic Solution (Povidone Iodine)',
    category: 'first-aid',
    subcategory: 'Antiseptics',
    brand: 'Betadine',
    price: 450.00,
    originalPrice: 520.00,
    inStock: true,
    stockCount: 198,
    rating: 4.8,
    reviewCount: 567,
    image: '/images/medicines/antiseptic-solution.jpg',
    description: 'Broad-spectrum antiseptic for wound cleaning and infection prevention.',
    longDescription: 'Trusted antiseptic solution that kills bacteria, viruses, and fungi. Essential for wound care, cuts, scrapes, and minor infections. Safe for regular use.',
    dosage: 'Apply directly to affected area or dilute 1:10 for wound irrigation',
    activeIngredient: 'Povidone Iodine 10%',
    packSize: '60ml bottle',
    manufacturer: 'Mundipharma',
    countryOfOrigin: 'India',
    expiryMonths: 60,
    prescription: false,
    features: ['Broad Spectrum', 'Kills Bacteria & Viruses', 'Wound Care', 'Trusted Brand'],
    tags: ['antiseptic', 'wound care', 'iodine', 'infection', 'first aid'],
    sizes: ['30ml - Rs. 250', '60ml - Rs. 450', '120ml - Rs. 820']
  }
];

// Enhanced product recommendations system
export const getProductRecommendations = (currentProduct, allProducts, count = 4) => {
  const recommendations = allProducts
    .filter(product => 
      product.id !== currentProduct.id && 
      (product.category === currentProduct.category || 
       product.brand === currentProduct.brand ||
       product.tags.some(tag => currentProduct.tags.includes(tag)))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
  
  return recommendations;
};

// Recently viewed products management
export const recentlyViewedManager = {
  add: (productId) => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(id => id !== productId);
    const updated = [productId, ...filtered].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  },
  
  get: () => {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  },
  
  getProducts: (allProducts) => {
    const recentIds = recentlyViewedManager.get();
    return recentIds
      .map(id => allProducts.find(product => product.id === id))
      .filter(Boolean);
  }
};

// Price filter options
export const priceRanges = [
  { label: 'Under Rs. 500', min: 0, max: 500 },
  { label: 'Rs. 500 - Rs. 1,000', min: 500, max: 1000 },
  { label: 'Rs. 1,000 - Rs. 2,000', min: 1000, max: 2000 },
  { label: 'Rs. 2,000 - Rs. 5,000', min: 2000, max: 5000 },
  { label: 'Above Rs. 5,000', min: 5000, max: Infinity }
];

// Sort options
export const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' }
];

export default { medicineCategories, medicineProducts, sriLankanBrands };
