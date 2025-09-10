// Regulatory Compliance Guidelines for Pharma ERP
export const complianceGuidelines = {
  sections: [
    {
      id: 'storage-conditions',
      title: 'Storage Conditions',
      icon: 'warehouse',
      description: 'Proper storage conditions are critical for maintaining medicine efficacy and safety.',
      guidelines: [
        'Store medicines in designated areas with appropriate temperature control',
        'Maintain temperature between 15°C to 25°C (59°F to 77°F) unless otherwise specified',
        'Protect medicines from direct sunlight and UV radiation',
        'Ensure adequate ventilation in storage areas',
        'Store in original packaging until dispensing',
        'Keep storage areas clean, dry, and free from pests',
        'Implement first-in, first-out (FIFO) inventory rotation',
        'Separate different medicine categories to prevent cross-contamination',
        'Maintain proper humidity levels (45-65% RH)',
        'Use appropriate shelving materials (non-reactive, easy to clean)'
      ],
      criticalPoints: [
        'Temperature monitoring is mandatory',
        'Document all temperature excursions',
        'Immediate action required for temperature violations'
      ]
    },
    {
      id: 'prescription-handling',
      title: 'Prescription Handling',
      icon: 'prescription',
      description: 'Proper prescription handling ensures patient safety and regulatory compliance.',
      guidelines: [
        'Verify prescription authenticity and prescriber credentials',
        'Check prescription completeness (patient details, medicine name, dosage, quantity)',
        'Validate prescription against patient medical history when available',
        'Ensure prescription is not expired or altered',
        'Maintain prescription records for minimum 2 years',
        'Implement secure prescription storage and disposal',
        'Follow controlled substance prescription requirements',
        'Verify patient identity before dispensing',
        'Provide appropriate counseling to patients',
        'Document all dispensing activities'
      ],
      criticalPoints: [
        'Prescription verification is mandatory',
        'Controlled substances require additional documentation',
        'Patient counseling must be documented'
      ]
    },
    {
      id: 'controlled-substances',
      title: 'Controlled Substances',
      icon: 'security',
      description: 'Special handling requirements for controlled and scheduled medicines.',
      guidelines: [
        'Maintain separate storage for controlled substances (Schedule I-V)',
        'Implement dual-lock security systems for controlled substances',
        'Conduct daily inventory counts of controlled substances',
        'Maintain detailed records of all controlled substance transactions',
        'Verify prescriber DEA registration for controlled substances',
        'Follow specific dispensing limits for controlled substances',
        'Implement secure disposal procedures for expired controlled substances',
        'Report suspicious orders or activities to authorities',
        'Maintain controlled substance logs for minimum 2 years',
        'Ensure only authorized personnel access controlled substances'
      ],
      criticalPoints: [
        'Controlled substances require special security measures',
        'Daily inventory counts are mandatory',
        'Suspicious activities must be reported immediately'
      ]
    },
    {
      id: 'temperature-humidity',
      title: 'Temperature & Humidity Guidelines',
      icon: 'thermostat',
      description: 'Specific temperature and humidity requirements for different medicine categories.',
      guidelines: [
        'Room temperature storage: 15°C to 25°C (59°F to 77°F)',
        'Refrigerated storage: 2°C to 8°C (36°F to 46°F)',
        'Frozen storage: -20°C to -10°C (-4°F to 14°F)',
        'Monitor temperature continuously with calibrated devices',
        'Maintain humidity between 45% to 65% RH',
        'Document temperature and humidity readings daily',
        'Calibrate monitoring equipment annually',
        'Implement alarm systems for temperature excursions',
        'Have backup power systems for refrigeration units',
        'Train staff on temperature monitoring procedures'
      ],
      criticalPoints: [
        'Temperature monitoring must be continuous',
        'Calibration records must be maintained',
        'Temperature excursions require immediate action'
      ]
    },
    {
      id: 'expired-medicines',
      title: 'Expired Medicines Handling',
      icon: 'warning',
      description: 'Proper procedures for handling and disposing of expired medicines.',
      guidelines: [
        'Regularly check medicine expiry dates (monthly minimum)',
        'Remove expired medicines from active inventory immediately',
        'Store expired medicines separately in designated quarantine area',
        'Document all expired medicine removals',
        'Follow proper disposal procedures for expired medicines',
        'Do not dispense expired medicines under any circumstances',
        'Implement automated expiry date alerts',
        'Train staff on expiry date recognition',
        'Maintain records of expired medicine disposal',
        'Follow environmental regulations for medicine disposal'
      ],
      criticalPoints: [
        'Expired medicines must be removed immediately',
        'Dispensing expired medicines is strictly prohibited',
        'Proper disposal is mandatory for environmental compliance'
      ]
    },
    {
      id: 'patient-counseling',
      title: 'Patient Counseling',
      icon: 'people',
      description: 'Essential patient counseling requirements for safe medicine use.',
      guidelines: [
        'Provide counseling for all new prescriptions',
        'Explain proper dosage and administration methods',
        'Discuss potential side effects and adverse reactions',
        'Provide information on drug interactions',
        'Explain storage requirements for medicines',
        'Discuss what to do if doses are missed',
        'Provide written information when appropriate',
        'Ensure patient understanding through teach-back method',
        'Document all counseling provided',
        'Offer counseling in patient\'s preferred language'
      ],
      criticalPoints: [
        'Counseling is mandatory for new prescriptions',
        'Patient understanding must be verified',
        'All counseling must be documented'
      ]
    },
    {
      id: 'inventory-management',
      title: 'Inventory Management',
      icon: 'inventory',
      description: 'Proper inventory management practices for regulatory compliance.',
      guidelines: [
        'Maintain accurate inventory records at all times',
        'Conduct regular physical inventory counts',
        'Implement proper stock rotation (FIFO)',
        'Monitor stock levels to prevent stockouts',
        'Maintain proper documentation of all inventory movements',
        'Implement security measures to prevent theft',
        'Regularly audit inventory for accuracy',
        'Maintain records of all purchases and sales',
        'Implement proper labeling and identification systems',
        'Train staff on inventory management procedures'
      ],
      criticalPoints: [
        'Inventory accuracy is critical for compliance',
        'Regular audits are mandatory',
        'All movements must be documented'
      ]
    },
    {
      id: 'quality-assurance',
      title: 'Quality Assurance',
      icon: 'verified',
      description: 'Quality assurance practices to ensure medicine safety and efficacy.',
      guidelines: [
        'Verify medicine authenticity and source',
        'Check medicine packaging for tampering or damage',
        'Ensure proper labeling and identification',
        'Maintain quality control records',
        'Implement proper handling procedures',
        'Regularly inspect storage conditions',
        'Train staff on quality assurance procedures',
        'Maintain supplier qualification records',
        'Implement recall procedures when necessary',
        'Document all quality control activities'
      ],
      criticalPoints: [
        'Quality checks are mandatory for all medicines',
        'Damaged or tampered medicines must be rejected',
        'Recall procedures must be ready for implementation'
      ]
    },
    {
      id: 'documentation',
      title: 'Documentation Requirements',
      icon: 'description',
      description: 'Essential documentation practices for regulatory compliance.',
      guidelines: [
        'Maintain all required records for minimum 2 years',
        'Ensure all documents are legible and complete',
        'Implement proper document storage and retrieval systems',
        'Regularly backup electronic records',
        'Maintain confidentiality of patient information',
        'Implement proper document disposal procedures',
        'Train staff on documentation requirements',
        'Regularly audit documentation for completeness',
        'Maintain proper document version control',
        'Ensure documents are accessible for inspections'
      ],
      criticalPoints: [
        'All records must be maintained for 2 years minimum',
        'Documentation must be complete and legible',
        'Patient confidentiality must be maintained'
      ]
    }
  ],
  
  // Quick reference for common violations
  commonViolations: [
    'Dispensing expired medicines',
    'Improper storage temperature',
    'Inadequate prescription verification',
    'Missing patient counseling documentation',
    'Incomplete inventory records',
    'Improper controlled substance handling',
    'Inadequate security measures',
    'Missing quality control documentation'
  ],
  
  // Emergency procedures
  emergencyProcedures: [
    {
      title: 'Temperature Excursion',
      steps: [
        'Immediately document the temperature reading',
        'Check all medicines in affected area',
        'Contact supplier for guidance on affected medicines',
        'Implement corrective actions',
        'Document all actions taken'
      ]
    },
    {
      title: 'Suspected Medicine Tampering',
      steps: [
        'Remove suspected medicine from inventory',
        'Document the incident immediately',
        'Contact authorities if necessary',
        'Notify supplier and manufacturer',
        'Implement additional security measures'
      ]
    },
    {
      title: 'Controlled Substance Theft',
      steps: [
        'Secure the area immediately',
        'Document the incident',
        'Contact law enforcement',
        'Notify DEA within 24 hours',
        'Conduct internal investigation'
      ]
    }
  ]
};

// Search functionality helper
export const searchGuidelines = (query) => {
  const searchTerm = query.toLowerCase();
  const results = [];
  
  complianceGuidelines.sections.forEach(section => {
    const sectionMatches = section.title.toLowerCase().includes(searchTerm) ||
                          section.description.toLowerCase().includes(searchTerm);
    
    const guidelineMatches = section.guidelines.filter(guideline => 
      guideline.toLowerCase().includes(searchTerm)
    );
    
    if (sectionMatches || guidelineMatches.length > 0) {
      results.push({
        section,
        matchedGuidelines: guidelineMatches,
        sectionMatch: sectionMatches
      });
    }
  });
  
  return results;
};
