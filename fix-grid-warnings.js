const fs = require('fs');
const path = require('path');

// Function to fix Grid deprecation warnings
function fixGridWarnings(filePath) {
  console.log(`Fixing Grid warnings in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix various Grid item patterns
  const patterns = [
    // Pattern: <Grid item xs={12} sm={6} md={4} lg={3}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}\s+lg=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1, sm: $2, md: $3, lg: $4 }}'
    },
    // Pattern: <Grid item xs={12} md={6}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1, md: $2 }}'
    },
    // Pattern: <Grid item xs={12} sm={6}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1, sm: $2 }}'
    },
    // Pattern: <Grid item xs={12} sm={8}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1, sm: $2 }}'
    },
    // Pattern: <Grid item xs={12} sm={4}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1, sm: $2 }}'
    },
    // Pattern: <Grid item xs={12}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1 }}'
    },
    // Pattern: <Grid item xs={6}
    {
      regex: /<Grid\s+item\s+xs=\{(\d+)\}/g,
      replacement: '<Grid size={{ xs: $1 }}'
    }
  ];
  
  let modified = false;
  patterns.forEach(pattern => {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed Grid warnings in: ${filePath}`);
  } else {
    console.log(`ℹ️  No Grid warnings found in: ${filePath}`);
  }
}

// Fix the main ecommerce file
const ecommerceFile = path.join(__dirname, 'src', 'components', 'ecommerce', 'ProfessionalPharmacyEcommerce.js');
if (fs.existsSync(ecommerceFile)) {
  fixGridWarnings(ecommerceFile);
} else {
  console.log('❌ Ecommerce file not found');
}

console.log('Grid warning fixes completed!');
