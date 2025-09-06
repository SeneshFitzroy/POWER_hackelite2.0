# Pharmacy HR Backend API

Node.js/Express backend API for the Pharmacy HR Management System with Firebase integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## 📦 Dependencies

### Core Dependencies
- **express**: ^4.18.2 - Web application framework
- **firebase-admin**: ^11.5.0 - Firebase Admin SDK
- **cors**: ^2.8.5 - Cross-Origin Resource Sharing
- **helmet**: ^6.0.1 - Security middleware
- **dotenv**: ^16.0.3 - Environment variable management

### Authentication & Security
- **jsonwebtoken**: ^9.0.0 - JWT token handling
- **bcryptjs**: ^2.4.3 - Password hashing
- **express-rate-limit**: ^6.7.0 - Rate limiting middleware

### Validation & Utilities
- **express-validator**: ^6.14.3 - Input validation
- **morgan**: ^1.10.0 - HTTP request logging
- **node-cron**: ^3.0.2 - Scheduled tasks
- **nodemailer**: ^6.8.0 - Email notifications

## 🏗 Project Structure

```
backend/
├── config/              # Configuration files
│   └── firebase.js      # Firebase Admin SDK setup
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication middleware
│   └── errorHandler.js  # Global error handling
├── routes/              # API route definitions
│   ├── auth.js          # Authentication routes
│   ├── dashboard.js     # Dashboard statistics
│   ├── employees.js     # Employee management
│   ├── payroll.js       # Payroll processing
│   ├── attendance.js    # Attendance tracking
│   ├── licenses.js      # License management
│   └── performance.js   # Performance reviews
├── services/            # Business logic services
│   ├── emailService.js  # Email notification service
│   └── cronJobs.js      # Scheduled task management
├── server.js            # Main application entry point
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🔐 Authentication & Authorization

### Firebase Authentication Integration
```javascript
// Verify Firebase ID token
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decodedToken = await getAuth().verifyIdToken(token);
  req.user = decodedToken;
  next();
};
```

### Role-Based Access Control
```javascript
// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
```

### User Roles
- **Owner**: Full system access
- **Admin**: Administrative functions
- **Registered Pharmacist**: Senior staff permissions
- **Assistant Pharmacist**: Limited access
- **Cashier**: Basic employee functions
- **Delivery Driver**: Mobile-specific features

## 📊 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /verify              # Verify Firebase token
GET    /me                  # Get current user profile
POST   /create-user         # Create new user (Admin only)
PUT    /update-role/:uid    # Update user role (Admin only)
DELETE /delete-user/:uid    # Delete user (Admin only)
```

### Employee Routes (`/api/employees`)
```
GET    /                    # Get all employees (with filters)
GET    /:id                 # Get single employee
POST   /                    # Create new employee
PUT    /:id                 # Update employee
DELETE /:id                 # Delete employee
GET    /:id/probation       # Get probation status
PATCH  /:id/status          # Update employee status
```

### Payroll Routes (`/api/payroll`)
```
GET    /                    # Get payroll records (with filters)
GET    /:id                 # Get single payroll record
POST   /process             # Process payroll for month
PUT    /:id                 # Update payroll record
DELETE /:id                 # Delete payroll record
GET    /summary/:month      # Get payroll summary
GET    /:id/payslip         # Generate payslip
```

### Attendance Routes (`/api/attendance`)
```
GET    /                    # Get attendance records
POST   /                    # Mark attendance
PUT    /:id                 # Update attendance record
DELETE /:id                 # Delete attendance record
GET    /summary             # Get attendance summary
POST   /bulk                # Bulk mark attendance
```

### License Routes (`/api/licenses`)
```
GET    /                    # Get all licenses
GET    /:id                 # Get single license
POST   /                    # Create new license
PUT    /:id                 # Update license
DELETE /:id                 # Delete license
GET    /expiring/:days      # Get expiring licenses
GET    /expired             # Get expired licenses
POST   /:id/verify          # Verify license with NMRA
GET    /stats               # Get license statistics
```

### Performance Routes (`/api/performance`)
```
GET    /                    # Get performance reviews
GET    /:id                 # Get single review
POST   /                    # Create new review
PUT    /:id                 # Update review
DELETE /:id                 # Delete review
GET    /analytics/:employeeId # Get employee analytics
GET    /stats               # Get performance statistics
POST   /:id/self-assessment # Submit self-assessment
GET    /pending-employee-reviews # Get pending reviews
```

### Dashboard Routes (`/api/dashboard`)
```
GET    /stats               # Get dashboard statistics
GET    /employee-distribution # Get employee role distribution
GET    /attendance-trends   # Get attendance trends (7 days)
```

## 💾 Database Schema

### Collections Structure

#### Employees Collection
```javascript
{
  id: "auto-generated",
  firstName: "string",
  lastName: "string",
  email: "string",
  phone: "string",
  employeeId: "string",
  role: "enum",
  status: "enum", // active, inactive, probation
  contractType: "enum", // permanent, temporary
  startDate: "date",
  salary: "number",
  address: {
    permanent: "string",
    current: "string"
  },
  emergencyContact: {
    name: "string",
    relationship: "string",
    phone: "string"
  },
  documents: "array",
  profileImageUrl: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### Payroll Collection
```javascript
{
  id: "auto-generated",
  employeeId: "string",
  employeeName: "string",
  month: "string", // YYYY-MM format
  baseSalary: "number",
  allowances: "number",
  overtimeHours: "number",
  overtimePay: "number",
  grossSalary: "number",
  epfEmployee: "number", // 8%
  epfEmployer: "number", // 12%
  etf: "number", // 3%
  totalDeductions: "number",
  netSalary: "number",
  status: "string",
  processedBy: "string",
  createdAt: "timestamp"
}
```

#### Attendance Collection
```javascript
{
  id: "auto-generated",
  employeeId: "string",
  employeeName: "string",
  date: "string", // YYYY-MM-DD format
  status: "enum", // present, absent, late, half-day
  timeIn: "string", // HH:MM format
  timeOut: "string", // HH:MM format
  hoursWorked: "number",
  notes: "string",
  markedBy: "string",
  createdAt: "timestamp"
}
```

#### Licenses Collection
```javascript
{
  id: "auto-generated",
  employeeId: "string",
  employeeName: "string",
  licenseType: "string",
  licenseNumber: "string",
  issuedDate: "date",
  expiryDate: "date",
  issuingAuthority: "string",
  verificationUrl: "string",
  status: "enum", // active, inactive, suspended
  lastVerified: "timestamp",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### Performance Reviews Collection
```javascript
{
  id: "auto-generated",
  employeeId: "string",
  employeeName: "string",
  reviewPeriod: "string", // YYYY-MM format
  reviewType: "enum", // quarterly, annual, probation, promotion
  overallRating: "number", // 1-5
  kpis: "array", // Key Performance Indicators
  strengths: "string",
  areasForImprovement: "string",
  goals: "string",
  reviewerComments: "string",
  employeeComments: "string",
  status: "enum", // draft, pending, completed
  reviewerId: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## ⚙️ Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DATABASE_URL=your_database_url

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Firebase Setup
```javascript
// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  // ... other config
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
```

## 🔄 Automated Services

### Cron Jobs
```javascript
// Daily license expiry check (9 AM)
cron.schedule('0 9 * * *', async () => {
  await checkExpiringLicenses();
});

// Daily probation period check (10 AM)
cron.schedule('0 10 * * *', async () => {
  await checkProbationPeriods();
});

// Monthly report generation (1st of month, 8 AM)
cron.schedule('0 8 1 * *', async () => {
  await generateMonthlyReports();
});

// Weekly backup (Sunday, 2 AM)
cron.schedule('0 2 * * 0', async () => {
  await createWeeklyBackup();
});
```

### Email Notifications
```javascript
// License expiry notification
await sendLicenseExpiryNotification(
  employeeEmail,
  employeeName,
  licenseType,
  expiryDate
);

// Probation completion notification
await sendProbationCompletionNotification(
  managerEmail,
  employeeName,
  startDate
);

// Payslip email
await sendPayslipEmail(
  employeeEmail,
  employeeName,
  payslipData
);
```

## 💰 Payroll Calculations

### Sri Lankan Compliance
```javascript
// EPF/ETF calculations
const epfEmployee = baseSalary * 0.08; // 8% employee contribution
const epfEmployer = baseSalary * 0.12; // 12% employer contribution
const etf = baseSalary * 0.03; // 3% ETF

// Overtime calculation
const overtimePay = overtimeHours * (200 / 0.5); // 200 LKR per 30 minutes

// Net salary calculation
const grossSalary = baseSalary + overtimePay + allowances;
const totalDeductions = epfEmployee + otherDeductions;
const netSalary = grossSalary - totalDeductions;
```

### Payroll Processing
```javascript
// Process monthly payroll
POST /api/payroll/process
{
  "month": "2024-03",
  "employeeIds": ["emp1", "emp2"] // Optional: specific employees
}
```

## 🔒 Security Features

### Input Validation
```javascript
// Express Validator usage
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
  body('startDate').isISO8601().withMessage('Valid date required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

### Rate Limiting
```javascript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
```

### Security Headers
```javascript
// Helmet security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📊 Monitoring & Logging

### Request Logging
```javascript
// Morgan HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
```

### Error Handling
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## 🧪 Testing

### Test Structure
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### API Testing
```javascript
// Example test with Supertest
const request = require('supertest');
const app = require('../server');

describe('Employee API', () => {
  test('GET /api/employees should return employee list', async () => {
    const response = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 🚀 Deployment

### Production Setup
```bash
# Set environment to production
export NODE_ENV=production

# Install production dependencies only
npm ci --only=production

# Start with PM2 (recommended)
pm2 start server.js --name "pharmacy-hr-api"
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   ```bash
   # Check Firebase credentials
   # Verify project ID and service account
   # Check network connectivity
   ```

2. **Authentication Failures**
   ```bash
   # Verify JWT secret
   # Check token expiration
   # Validate Firebase token format
   ```

3. **Database Query Issues**
   ```bash
   # Check Firestore indexes
   # Verify collection names
   # Review query constraints
   ```

### Debug Mode
```javascript
// Enable debug logging
process.env.DEBUG = 'pharmacy-hr:*';

// Firebase debug mode
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
```

## 📚 API Documentation

### Response Format
```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error response
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}

// Paginated response
{
  "success": true,
  "data": [ /* items */ ],
  "count": 25,
  "total": 100,
  "page": 1,
  "pages": 4
}
```

### Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

**API Documentation & Support: [Link to detailed API docs]**