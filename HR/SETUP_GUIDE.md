# Pharmacy HR System - Setup Guide

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Git (optional)

### 1. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "Pharmacy HR"
   - Enable Firestore Database
   - Enable Authentication (Email/Password)

2. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Add a web app
   - Copy the configuration object

3. **Update Environment Files**
   
   **Frontend (.env):**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   **Backend (.env):**
   ```env
   PORT=5000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="your_private_key"
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   JWT_SECRET=your_jwt_secret_here
   ```

### 2. Installation & Setup

1. **Install Frontend Dependencies**
   ```bash
   cd HR/frontend
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd HR/backend
   npm install
   ```

### 3. Running the Application

1. **Start Backend Server**
   ```bash
   cd HR/backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

2. **Start Frontend Application**
   ```bash
   cd HR/frontend
   npm start
   ```
   Frontend will run on: http://localhost:3000

### 4. Initial Setup

1. **Access the Application**
   - Open http://localhost:3000 in your browser
   - You'll see the login page

2. **Create Test User**
   - Click "Create Test User" button on login page
   - This creates: admin@pharmacy.com / pharmacy123

3. **Login & Initialize Data**
   - Login with the test credentials
   - On the dashboard, you'll see "Database Setup" section
   - Click "Initialize Sample Data" to create sample employees, attendance, etc.

### 5. Test the System

After initialization, you should have:
- ✅ 3 Sample employees (John Doe, Sarah Silva, Rajesh Patel)
- ✅ Professional licenses with expiry tracking
- ✅ Recent attendance records
- ✅ Current month payroll data
- ✅ Performance review templates

## 🎯 Key Features to Test

### Employee Management
- Navigate to "Employees" to see the employee list
- Click "Add Employee" to create new employees
- View employee profiles and edit information
- Upload documents and profile pictures

### Attendance Tracking
- Go to "Attendance" to mark daily attendance
- Mark employees as Present, Absent, Late, or Half-day
- View attendance statistics and summaries

### Payroll Processing
- Visit "Payroll" section
- Process monthly payroll with Sri Lankan compliance
- Generate payslips for employees
- View payroll summaries and reports

### License Management
- Check "Licenses" for professional license tracking
- Add new licenses with expiry dates
- Get alerts for licenses expiring within 30 days
- Verify licenses with NMRA integration (mock)

### Performance Reviews
- Access "Performance" for employee evaluations
- Create quarterly/annual performance reviews
- Use KPI-based rating system
- Track employee goals and development

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   ```
   Solution: Check your Firebase configuration in .env files
   Verify project ID and API keys are correct
   ```

2. **Authentication Failed**
   ```
   Solution: Enable Email/Password authentication in Firebase Console
   Create test user using the "Create Test User" button
   ```

3. **Empty Dashboard**
   ```
   Solution: Click "Initialize Sample Data" on the dashboard
   This will create sample employees and data
   ```

4. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database Reset**: Use "Reset All Data" button for fresh start
3. **Test Credentials**: admin@pharmacy.com / pharmacy123
4. **API Testing**: Backend API available at http://localhost:5000/api

## 📱 User Roles & Permissions

The system supports different user roles:

- **Owner**: Full system access and control
- **Admin**: Administrative functions
- **Registered Pharmacist**: Senior staff permissions
- **Assistant Pharmacist**: Limited access
- **Cashier**: Basic employee functions
- **Delivery Driver**: Mobile-friendly interface

## 🔒 Security Features

- Firebase Authentication integration
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling

## 📊 Sri Lankan Compliance

The system includes:
- EPF: 8% employee + 12% employer contribution
- ETF: 3% employer contribution
- Overtime: 200 LKR per 30-minute period
- NMRA license verification integration
- Local regulatory compliance tracking

## 🚀 Production Deployment

### Frontend Deployment
```bash
cd HR/frontend
npm run build
# Deploy build folder to your hosting service (Netlify, Vercel, etc.)
```

### Backend Deployment
```bash
cd HR/backend
# Set NODE_ENV=production
# Configure production environment variables
# Deploy to your server (Heroku, AWS, DigitalOcean, etc.)
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Ensure all dependencies are installed
4. Check that both frontend and backend are running

---

**🎉 Congratulations! Your Pharmacy HR System is now ready to use!**

The system provides a comprehensive solution for managing pharmacy staff, from employee onboarding to performance tracking, with full Sri Lankan regulatory compliance.