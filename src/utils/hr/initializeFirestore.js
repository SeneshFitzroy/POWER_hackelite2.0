import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Sample data for initializing collections
const sampleEmployees = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@pharmacy.com',
    phone: '+94771234567',
    employeeId: 'EMP001',
    role: 'registered_pharmacist',
    status: 'active',
    contractType: 'permanent',
    startDate: '2023-01-15',
    salary: 75000,
    dateOfBirth: '1985-06-15',
    nic: '198516712345',
    address: {
      permanent: '123 Main Street, Colombo 03',
      current: '123 Main Street, Colombo 03'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+94771234568'
    },
    education: 'Bachelor of Pharmacy, University of Colombo',
    certifications: 'Licensed Pharmacist - NMRA',
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    firstName: 'Sarah',
    lastName: 'Silva',
    email: 'sarah.silva@pharmacy.com',
    phone: '+94772345678',
    employeeId: 'EMP002',
    role: 'assistant_pharmacist',
    status: 'active',
    contractType: 'permanent',
    startDate: '2023-03-01',
    salary: 45000,
    dateOfBirth: '1990-08-22',
    nic: '199024512345',
    address: {
      permanent: '456 Galle Road, Mount Lavinia',
      current: '456 Galle Road, Mount Lavinia'
    },
    emergencyContact: {
      name: 'Maria Silva',
      relationship: 'Mother',
      phone: '+94772345679'
    },
    education: 'Diploma in Pharmacy, NIBM',
    certifications: 'Assistant Pharmacist License - NMRA',
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    firstName: 'Rajesh',
    lastName: 'Patel',
    email: 'rajesh.patel@pharmacy.com',
    phone: '+94773456789',
    employeeId: 'EMP003',
    role: 'cashier',
    status: 'probation',
    contractType: 'permanent',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
    salary: 35000,
    dateOfBirth: '1995-12-10',
    nic: '199535012345',
    address: {
      permanent: '789 Kandy Road, Kadawatha',
      current: '789 Kandy Road, Kadawatha'
    },
    emergencyContact: {
      name: 'Priya Patel',
      relationship: 'Sister',
      phone: '+94773456790'
    },
    education: 'A/L Commerce, Royal College',
    certifications: 'Basic Computer Skills Certificate',
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleLicenses = [
  {
    employeeId: '', // Will be set after employees are created
    employeeName: 'John Doe',
    licenseType: 'Pharmacist License',
    licenseNumber: 'PH2023001',
    issuedDate: '2023-01-01',
    expiryDate: '2025-12-31',
    issuingAuthority: 'NMRA (National Medicines Regulatory Authority)',
    verificationUrl: 'https://nmra.gov.lk/verify/PH2023001',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    employeeId: '', // Will be set after employees are created
    employeeName: 'Sarah Silva',
    licenseType: 'Assistant Pharmacist License',
    licenseNumber: 'AP2023002',
    issuedDate: '2023-02-15',
    expiryDate: '2024-02-14', // Expiring soon for testing
    issuingAuthority: 'NMRA (National Medicines Regulatory Authority)',
    verificationUrl: 'https://nmra.gov.lk/verify/AP2023002',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleAttendance = [
  // Today's attendance
  {
    employeeId: '',
    employeeName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    timeIn: '08:30',
    timeOut: '17:00',
    hoursWorked: 8.5,
    notes: '',
    markedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    employeeId: '',
    employeeName: 'Sarah Silva',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    timeIn: '09:00',
    timeOut: '17:30',
    hoursWorked: 8.5,
    notes: '',
    markedBy: 'system',
    createdAt: new Date().toISOString()
  },
  // Yesterday's attendance
  {
    employeeId: '',
    employeeName: 'John Doe',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'present',
    timeIn: '08:30',
    timeOut: '17:00',
    hoursWorked: 8.5,
    notes: '',
    markedBy: 'system',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

const samplePayroll = [
  {
    employeeId: '',
    employeeName: 'John Doe',
    employeeNumber: 'EMP001',
    month: new Date().toISOString().slice(0, 7), // Current month
    baseSalary: 75000,
    allowances: 5000,
    overtimeHours: 4,
    overtimePay: 1600, // 4 hours * 400 LKR per hour
    grossSalary: 81600,
    epfEmployee: 6000, // 8% of base salary
    epfEmployer: 9000, // 12% of base salary
    etf: 2250, // 3% of base salary
    totalDeductions: 6000,
    netSalary: 75600,
    status: 'processed',
    processedBy: 'system',
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

const samplePerformanceReviews = [
  {
    employeeId: '',
    employeeName: 'John Doe',
    reviewPeriod: new Date().toISOString().slice(0, 7), // Current month
    reviewType: 'quarterly',
    overallRating: 4,
    kpis: [
      { name: 'Customer Service', rating: 4, comments: 'Excellent patient interaction' },
      { name: 'Product Knowledge', rating: 5, comments: 'Outstanding pharmaceutical knowledge' },
      { name: 'Sales Performance', rating: 4, comments: 'Meets sales targets consistently' },
      { name: 'Teamwork', rating: 4, comments: 'Great collaboration with team' },
      { name: 'Punctuality', rating: 5, comments: 'Always on time' }
    ],
    strengths: 'Strong pharmaceutical knowledge, excellent customer service, reliable',
    areasForImprovement: 'Could improve sales techniques, leadership skills',
    goals: 'Complete advanced pharmacy certification, mentor junior staff',
    reviewerComments: 'John is a valuable team member with strong technical skills',
    employeeComments: '',
    status: 'pending',
    reviewerId: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Function to check if collection exists and has data
const checkCollectionExists = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return false;
  }
};

// Function to initialize a collection with sample data
const initializeCollection = async (collectionName, sampleData) => {
  try {
    console.log(`Initializing ${collectionName} collection...`);
    
    for (const item of sampleData) {
      await addDoc(collection(db, collectionName), item);
    }
    
    console.log(`✅ ${collectionName} collection initialized with ${sampleData.length} records`);
    return true;
  } catch (error) {
    console.error(`❌ Error initializing ${collectionName}:`, error);
    return false;
  }
};

// Main initialization function
export const initializeFirestore = async () => {
  console.log('🔥 Starting Firestore initialization...');
  
  try {
    // Check and initialize employees collection
    const employeesExist = await checkCollectionExists('employees');
    let employeeIds = [];
    
    if (!employeesExist) {
      await initializeCollection('employees', sampleEmployees);
      
      // Get the created employee IDs
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      employeeIds = employeesSnapshot.docs.map(doc => doc.id);
    } else {
      console.log('✅ Employees collection already exists');
      // Get existing employee IDs
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      employeeIds = employeesSnapshot.docs.map(doc => doc.id);
    }
    
    // Update sample data with actual employee IDs
    if (employeeIds.length >= 2) {
      // Update licenses
      sampleLicenses[0].employeeId = employeeIds[0];
      sampleLicenses[1].employeeId = employeeIds[1];
      
      // Update attendance
      sampleAttendance.forEach((record, index) => {
        if (index < employeeIds.length) {
          record.employeeId = employeeIds[index % employeeIds.length];
        }
      });
      
      // Update payroll
      samplePayroll[0].employeeId = employeeIds[0];
      
      // Update performance reviews
      samplePerformanceReviews[0].employeeId = employeeIds[0];
    }
    
    // Initialize other collections
    const collections = [
      { name: 'licenses', data: sampleLicenses },
      { name: 'attendance', data: sampleAttendance },
      { name: 'payrolls', data: samplePayroll },
      { name: 'performance_reviews', data: samplePerformanceReviews }
    ];
    
    for (const { name, data } of collections) {
      const exists = await checkCollectionExists(name);
      if (!exists) {
        await initializeCollection(name, data);
      } else {
        console.log(`✅ ${name} collection already exists`);
      }
    }
    
    console.log('🎉 Firestore initialization completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    return false;
  }
};

// Function to reset all collections (use with caution)
export const resetFirestore = async () => {
  console.log('⚠️ Resetting Firestore collections...');
  
  const collections = ['employees', 'licenses', 'attendance', 'payrolls', 'performance_reviews'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = [];
      
      snapshot.docs.forEach(doc => {
        batch.push(doc.ref.delete());
      });
      
      await Promise.all(batch);
      console.log(`🗑️ ${collectionName} collection cleared`);
    } catch (error) {
      console.error(`Error clearing ${collectionName}:`, error);
    }
  }
  
  // Re-initialize with fresh data
  return await initializeFirestore();
};