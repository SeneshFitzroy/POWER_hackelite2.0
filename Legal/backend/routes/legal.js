const express = require('express');
const router = express.Router();

// Sample legal data
const legalData = {
  pharmacyName: "New Pharmacy Kalutara",
  address: "212 Galle Rd, Kalutara 12000",
  ownerName: "Nimal Perera",
  ownerNIC: "851234567V",
  pharmacistName: "Dr. Kamala Fernando",
  pharmacistRegNo: "PHL-789456",
  licenseRenewalDate: "2026-09-07"
};

// Get all legal information
router.get('/', (req, res) => {
  res.json(legalData);
});

// Update legal information
router.post('/', (req, res) => {
  const updatedData = req.body;
  // In a real application, you would save this to a database
  Object.assign(legalData, updatedData);
  res.json({ message: 'Legal information updated successfully', data: legalData });
});

module.exports = router;