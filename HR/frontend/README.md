# Pharmacy HR Frontend

React.js frontend application for the Pharmacy HR Management System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📦 Dependencies

### Core Dependencies
- **react**: ^18.2.0 - React library
- **react-dom**: ^18.2.0 - React DOM rendering
- **react-router-dom**: ^6.3.0 - Client-side routing
- **firebase**: ^9.9.0 - Firebase SDK for authentication and database

### UI & Styling
- **tailwindcss**: ^3.1.8 - Utility-first CSS framework
- **lucide-react**: ^0.263.1 - Modern icon library
- **react-hot-toast**: ^2.3.0 - Toast notifications

### Form Management
- **react-hook-form**: ^7.33.1 - Performant forms with easy validation

### Utilities
- **date-fns**: ^2.29.1 - Modern JavaScript date utility library
- **axios**: ^0.27.2 - HTTP client for API requests

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   │   └── Login.js     # Login form component
│   ├── Dashboard/       # Dashboard components
│   │   └── Dashboard.js # Main dashboard with stats
│   ├── Employee/        # Employee management
│   │   ├── EmployeeList.js    # Employee listing with filters
│   │   ├── EmployeeForm.js    # Add/edit employee form
│   │   └── EmployeeProfile.js # Employee detail view
│   ├── Payroll/         # Payroll components
│   │   └── PayrollList.js     # Payroll management
│   ├── Attendance/      # Attendance tracking
│   │   └── AttendanceList.js  # Attendance management
│   ├── License/         # License management
│   │   └── LicenseTracking.js # License tracking system
│   ├── Performance/     # Performance management
│   │   └── PerformanceList.js # Performance reviews
│   └── Layout/          # Layout components
│       └── Layout.js    # Main application layout
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── firebase/            # Firebase configuration
│   └── config.js        # Firebase setup and initialization
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎨 Styling System

### Tailwind CSS Classes
The application uses a consistent design system with predefined component classes:

```css
/* Button Styles */
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.btn-danger      /* Destructive action buttons */

/* Input Styles */
.input           /* Standard form inputs */

/* Card Styles */
.card            /* Container cards */
.card-header     /* Card headers */
.card-content    /* Card content areas */
```

### Color Palette
- **Primary**: Blue tones (#2563eb, #3b82f6)
- **Success**: Green tones (#22c55e, #16a34a)
- **Warning**: Yellow/Orange tones (#f59e0b, #d97706)
- **Danger**: Red tones (#ef4444, #dc2626)
- **Gray**: Neutral tones for text and backgrounds

## 🔐 Authentication Flow

### Firebase Authentication
```javascript
// Login process
const { login } = useAuth();
await login(email, password);

// Protected routes
<ProtectedRoute>
  <Component />
</ProtectedRoute>

// Logout
const { logout } = useAuth();
await logout();
```

### Route Protection
All routes except `/login` are protected and require authentication.

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
```jsx
// Responsive grid example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Mobile navigation
<div className="md:hidden">
  {/* Mobile menu */}
</div>
```

## 🔄 State Management

### Context API Usage
```javascript
// Authentication context
const { currentUser, login, logout } = useAuth();

// Global state patterns
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
```

### Form State Management
```javascript
// React Hook Form integration
const { register, handleSubmit, formState: { errors } } = useForm();

// Form validation
<input
  {...register('email', { required: 'Email is required' })}
  className="input"
/>
```

## 🌐 API Integration

### Firebase Firestore
```javascript
// Data fetching
const fetchEmployees = async () => {
  const snapshot = await getDocs(collection(db, 'employees'));
  const employees = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setEmployees(employees);
};

// Data creation
await addDoc(collection(db, 'employees'), employeeData);

// Data updates
await updateDoc(doc(db, 'employees', id), updateData);
```

### Error Handling
```javascript
try {
  await apiCall();
  toast.success('Operation successful');
} catch (error) {
  console.error('Error:', error);
  toast.error('Operation failed');
}
```

## 🎯 Key Components

### Dashboard Component
- Real-time statistics display
- Quick action buttons
- Recent activity feed
- Performance metrics

### Employee Management
- Advanced filtering and search
- Bulk operations support
- Document upload handling
- Profile image management

### Payroll System
- Automated calculations
- Payslip generation
- Sri Lankan compliance (EPF/ETF)
- Overtime tracking

### Attendance Tracking
- Daily attendance marking
- Weekly/monthly views
- Attendance statistics
- Bulk attendance operations

### License Management
- Expiry tracking and alerts
- Document storage
- NMRA integration ready
- Compliance monitoring

### Performance Reviews
- KPI-based evaluations
- Self-assessment capabilities
- Performance analytics
- Goal tracking

## 🔧 Development Guidelines

### Component Structure
```jsx
const ComponentName = () => {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
```

### Naming Conventions
- **Components**: PascalCase (e.g., `EmployeeList`)
- **Functions**: camelCase (e.g., `fetchEmployees`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: kebab-case (e.g., `btn-primary`)

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for better type safety (future enhancement)
- Implement proper error boundaries

## 🧪 Testing

### Test Structure
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Testing Guidelines
- Write unit tests for utility functions
- Test component rendering and user interactions
- Mock Firebase services in tests
- Maintain good test coverage

## 🚀 Build & Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Serve build locally for testing
npx serve -s build
```

### Environment Variables
```env
# Development
REACT_APP_FIREBASE_API_KEY=development_key
REACT_APP_API_URL=http://localhost:5000/api

# Production
REACT_APP_FIREBASE_API_KEY=production_key
REACT_APP_API_URL=https://api.pharmacy-hr.com
```

### Performance Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size monitoring
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   ```bash
   # Check environment variables
   # Verify Firebase configuration
   # Check network connectivity
   ```

2. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Styling Issues**
   ```bash
   # Rebuild Tailwind CSS
   npm run build:css
   ```

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'pharmacy-hr:*');

// Firebase debug mode
import { connectFirestoreEmulator } from 'firebase/firestore';
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/docs)

---

**Happy Coding! 🚀**