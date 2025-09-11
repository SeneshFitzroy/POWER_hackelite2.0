# 🏢 PharmaCore ERP System

**A comprehensive, modular ERP platform designed for pharmaceutical and healthcare businesses with role-based access control and real-time monitoring capabilities.**

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)
![Status](https://img.shields.io/badge/Status-Active%20Development-green.svg)

## 🎯 Overview

POWER Hackelite ERP is a modern, cloud-native Enterprise Resource Planning system specifically designed for pharmaceutical businesses and healthcare providers. Built with React 19 and Firebase, it offers a scalable, secure, and user-friendly platform for managing all aspects of your business operations.

## ✨ Key Features

### 🔐 **Advanced Authentication System**
- **Hybrid Authentication**: Firebase Authentication with fallback mechanisms
- **Role-Based Access Control**: CEO, Regional Manager, Assistant, and Cashier roles
- **Secure User Management**: Automatic user provisioning and role assignment
- **Multi-Module Permissions**: Granular access control per business module

### � **Comprehensive Business Modules**

#### 💰 **Finance Module**
- Real-time financial dashboards and KPIs
- Profit & Loss, Balance Sheet, Cash Flow statements
- Bills management with supplier tracking
- Automated payment reminders
- Payroll management system
- Interactive financial analytics with charts

#### 🛒 **Sales & POS System**
- Complete Point-of-Sale functionality
- Customer database management
- Sales order processing and tracking
- Sales analytics and performance metrics
- Inventory integration
- Real-time transaction monitoring

#### � **Inventory Management**
- Real-time stock tracking
- Automated reorder points and alerts
- Supplier management
- Batch tracking for pharmaceutical compliance
- Expiry date monitoring
- Purchase order management

#### 👥 **Human Resources**
- Employee database and profiles
- Attendance tracking
- Leave management
- Performance evaluations
- Salary and benefits administration
- Compliance reporting

#### 🌡️ **Cold Chain Monitoring**
- Real-time temperature and humidity monitoring
- Automated alert system for threshold breaches
- IoT sensor integration simulation
- Compliance reporting for pharmaceutical storage
- Historical data analytics
- Customizable monitoring parameters

#### ⚖️ **Legal & Compliance**
- Regulatory compliance tracking
- Document management
- Audit trail maintenance
- License and certification tracking
- Compliance reporting

#### 🚚 **Delivery & Logistics**
- Delivery route optimization
- Real-time tracking
- Driver management
- Vehicle maintenance tracking
- Customer delivery history

#### 🏛️ **Administration**
- System configuration and settings
- User management and permissions
- Backup and recovery
- System monitoring and performance
- Audit logs and security

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase account** (optional - system includes demo mode)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/SeneshFitzroy/POWER_hackelite2.0.git
cd POWER_hackelite2.0
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

4. **Access the application:**
   - Open `http://localhost:3000`
   - Use demo credentials or configure Firebase

### 🔧 Firebase Configuration (Optional)

The system works in **Demo Mode** by default. For production use:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update with your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 👤 Demo Accounts

The system includes pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **CEO** | `john.ceo.pharma@gmail.com` | `JohnCEO2002` | Full System Access |
| **Regional Manager** | `john.reg.pharma@gmail.com` | `JohnReg2002c` | Sales, POS, Inventory, Delivery, Legal |
| **Assistant** | `john.assit.pharma@gmail.com` | `JohnAssit2002` | POS, Inventory, Delivery |
| **Cashier** | `john.cashier.pharma@gmail.com` | `JohnCash2002` | POS Only |

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── sales/              # Sales & POS module
│   │   ├── SalesModule.js
│   │   ├── POSSystem.js
│   │   ├── CustomerManagement.js
│   │   └── SalesOrders.js
│   ├── finance/            # Finance module
│   │   ├── FinanceModule.js
│   │   ├── FinanceDashboard.js
│   │   ├── FinancialReports.js
│   │   ├── BillsManagement.js
│   │   └── PayrollManagement.js
│   ├── inventory/          # Inventory management
│   │   ├── InventoryModule.js
│   │   ├── StockManagement.js
│   │   └── PurchaseOrders.js
│   ├── hr/                 # Human resources
│   │   ├── HRModule.js
│   │   ├── EmployeeManagement.js
│   │   └── AttendanceTracking.js
│   ├── coldchain/          # Cold chain monitoring
│   │   ├── ColdChainModule.js
│   │   ├── SensorMonitoring.js
│   │   └── AlertsManagement.js
│   ├── shared/             # Shared components
│   │   ├── charts/
│   │   ├── forms/
│   │   └── ui/
│   ├── ERPApp.js           # Main application
│   ├── ERPDashboard.js     # Main dashboard
│   ├── ERPNavigation.js    # Navigation system
│   ├── LoginScreen.js      # Authentication
│   └── SplashScreen.js     # Loading screen
├── contexts/               # React contexts
│   ├── AuthContext.js      # Authentication state
│   └── RoleContext.js      # Role management
├── services/               # Business logic
│   ├── authService.js      # Authentication service
│   ├── dataService.js      # Data management
│   └── coldChainService.js # IoT monitoring
├── firebase/               # Firebase configuration
│   └── config.js
├── utils/                  # Utility functions
├── App.js                  # App component
└── index.js                # Entry point
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm test` | Run test suite |
| `npm run deploy` | Deploy to production |
| `npm run deploy-hr` | Deploy HR module only |
| `npm run deploy-sales` | Deploy Sales module only |
| `npm run deploy-legal` | Deploy Legal module only |

## 🔧 Technology Stack

### Frontend
- **React 19.1.1** - Modern UI framework
- **Material-UI 7.3.2** - Component library
- **TailwindCSS 4.1.13** - Utility-first CSS
- **Recharts 3.1.2** - Data visualization
- **Lucide React** - Icon library

### Backend & Services
- **Firebase 12.2.1** - Backend-as-a-Service
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage

### Development Tools
- **CRACO** - Create React App Configuration Override
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🏗️ Architecture

### Authentication Flow
```
Login → Firebase Auth → Role Verification → Module Access Control → Dashboard
```

### Module System
- **Modular Design**: Independent modules with shared components
- **Role-Based Routing**: Dynamic navigation based on user permissions
- **Data Integration**: Centralized data services across modules
- **Real-time Updates**: Live data synchronization

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **Data Encryption**: Secure data transmission and storage
- **Audit Logging**: Complete user action tracking

## 📈 Performance Features

- **Code Splitting**: Module-based lazy loading
- **Optimized Bundle**: Tree shaking and minification
- **Caching Strategy**: Intelligent data caching
- **Real-time Sync**: Efficient data synchronization
- **Mobile Responsive**: Optimized for all devices

## 🔒 Security

- **Firebase Security Rules**: Backend data protection
- **HTTPS Enforcement**: Secure data transmission
- **Input Validation**: XSS and injection prevention
- **Session Management**: Secure user sessions
- **Regular Security Updates**: Up-to-date dependencies

## 🚀 Deployment

### Production Deployment
```bash
npm run build
npm run deploy
```

### Module-specific Deployment
```bash
npm run deploy-hr      # HR module only
npm run deploy-sales   # Sales module only
npm run deploy-legal   # Legal module only
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow React best practices
- Write comprehensive tests
- Update documentation
- Maintain code quality standards

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 💬 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/SeneshFitzroy/POWER_hackelite2.0/issues)
- **Documentation**: Comprehensive guides and API docs
- **Community**: Join our developer community

## 🎯 Roadmap

### Upcoming Features
- [ ] **AI-Powered Analytics**: Machine learning insights
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **API Gateway**: RESTful API for third-party integrations
- [ ] **Advanced Reporting**: Customizable business reports
- [ ] **Multi-language Support**: Internationalization
- [ ] **Blockchain Integration**: Supply chain transparency

### Completed ✅
- [x] Role-based authentication system
- [x] Modular ERP architecture
- [x] Cold chain monitoring
- [x] Real-time dashboards
- [x] Firebase integration
- [x] Mobile-responsive design

---

**Built with ❤️ by CoreERP Systems**

*Empowering businesses with intelligent, affordable ERP solutions.*
