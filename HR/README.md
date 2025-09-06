# Pharmacy HR Management System

A comprehensive HR management system designed specifically for pharmacy operations in Sri Lanka, built with React.js frontend and Node.js backend using Firebase as the database.

## 🏥 Features

### 1. Employee Information Management
- **Personal Details**: Full name, DOB, addresses, contact information
- **Work & Personal Email**: Multiple contact methods
- **Profile Pictures**: Photo upload and management
- **Identification Records**: NIC/Passport, Driving License, Employee ID
- **Educational & Professional Qualifications**: Degree and certification tracking
- **Emergency Contacts**: Multiple emergency contact support

### 2. Employment & HR Records
- **Employment History**: Complete work history tracking
- **Contract Management**: Permanent/Temporary contract handling
- **Probation Tracking**: 3-month probation period with automatic alerts
- **Shift & Roster Management**: Work schedule assignments
- **Attendance & Leave Records**: Comprehensive time tracking
- **Notifications & Alerts**: License expiry, probation completion reminders

### 3. Payroll & Compensation
- **Salary Management**: Owner/admin controlled salary settings
- **Payroll Processing**: Automated monthly payroll generation
- **Overtime Calculations**: 200 LKR per 30-minute overtime rule
- **Sri Lankan Compliance**: EPF/ETF/Provident Fund calculations
- **Payslip Generation**: Digital payslip creation and distribution
- **Allowances & Deductions**: Flexible compensation components

### 4. Performance & Growth
- **KPI/OKR Tracking**: Performance metrics with dashboard analytics
- **Performance Reviews**: Quarterly and annual review cycles
- **Appraisals & Promotions**: Career progression tracking
- **Training Programs**: Development opportunity management
- **Strengths vs Improvement Areas**: Structured feedback system
- **Goal Setting**: Future objective planning

### 5. Employee Self-Service Portal
- **Payslip Downloads**: Self-service payslip access
- **Leave Applications**: Digital leave request system
- **Profile Updates**: Self-managed contact information
- **Document Management**: Personal document uploads

### 6. Licenses & Compliance
- **Professional License Tracking**: Pharmacist and assistant licenses
- **NMRA Integration**: License verification capabilities
- **Expiry Alerts**: Automated renewal reminders
- **Compliance Documentation**: FDA, WHO, GMP policy tracking
- **Background Screening**: Police report and legal document management

### 7. User Roles & Access Control
- **Owner**: Full system access and control
- **Registered Pharmacist**: Senior staff permissions
- **Assistant Pharmacist**: Limited administrative access
- **Cashier**: Basic employee functions
- **Delivery Driver**: Mobile-friendly interface
- **Admin**: System administration capabilities

## 🛠 Technology Stack

### Frontend
- **React.js 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Hook Form**: Form management
- **Firebase SDK**: Authentication and database
- **Lucide React**: Modern icon library
- **React Hot Toast**: Notification system
- **Date-fns**: Date manipulation utilities

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web application framework
- **Firebase Admin SDK**: Server-side Firebase integration
- **JWT**: Authentication tokens
- **Node-cron**: Scheduled task management
- **Nodemailer**: Email notifications
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **Morgan**: HTTP request logging

### Database
- **Firebase Firestore**: NoSQL document database
- **Firebase Storage**: File and image storage
- **Firebase Authentication**: User management

## 📁 Project Structure

```
HR/
├── frontend/                 # React.js frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── Employee/    # Employee management
│   │   │   ├── Payroll/     # Payroll components
│   │   │   ├── Attendance/  # Attendance tracking
│   │   │   ├── License/     # License management
│   │   │   ├── Performance/ # Performance reviews
│   │   │   └── Layout/      # Layout components
│   │   ├── contexts/        # React contexts
│   │   ├── firebase/        # Firebase configuration
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tailwind.config.js
└── backend/                 # Node.js backend API
    ├── config/              # Configuration files
    ├── middleware/          # Express middleware
    ├── routes/              # API routes
    ├── services/            # Business logic services
    ├── server.js            # Main server file
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HR
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure Environment Variables**
   
   Frontend (.env):
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   Backend (.env):
   ```env
   PORT=5000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_client_email
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

5. **Start Development Servers**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Key Features Implementation

### Probation Tracking
- Automatic 3-month probation period calculation
- Owner alerts when probation period completes
- Status update workflow for permanent confirmation

### Sri Lankan Payroll Compliance
- EPF: 8% employee + 12% employer contribution
- ETF: 3% employer contribution
- Overtime: 200 LKR per 30-minute period
- Configurable rates for different regulations

### License Management
- NMRA integration for pharmacist license verification
- Automated expiry notifications (30-day advance warning)
- Document upload and storage
- Compliance tracking for multiple license types

### Performance Reviews
- Quarterly and annual review cycles
- KPI-based evaluation system
- Self-assessment capabilities
- Goal setting and tracking
- Performance trend analysis

## 🔐 Security Features

- Firebase Authentication integration
- Role-based access control (RBAC)
- JWT token validation
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- HTTPS enforcement in production

## 📱 Mobile Responsiveness

The system is fully responsive and optimized for:
- Desktop computers (primary interface)
- Tablets (management on-the-go)
- Mobile phones (employee self-service)

## 🔄 Automated Processes

### Cron Jobs
- **Daily 9 AM**: License expiry checks
- **Daily 10 AM**: Probation period reviews
- **Monthly 1st**: Automated report generation
- **Weekly Sunday 2 AM**: Data backup

### Notifications
- Email alerts for license expiries
- Probation completion notifications
- Payroll processing confirmations
- Performance review reminders

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy build folder to your hosting service
```

### Backend Deployment
```bash
cd backend
# Set NODE_ENV=production
# Configure production environment variables
# Deploy to your server (Heroku, AWS, etc.)
```

## 📈 Future Enhancements

- Mobile app development (React Native)
- Advanced analytics and reporting
- Integration with accounting software
- Biometric attendance system
- Advanced workflow automation
- Multi-language support (Sinhala/Tamil)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@pharmacy-hr.com
- Documentation: [Link to detailed docs]
- Issues: [GitHub Issues page]

---

**Built with ❤️ for Sri Lankan Pharmacy Operations**