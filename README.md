# CoreERP

**A smart, affordable, and modular ERP system designed to empower Small and Medium-sized Businesses (SMBs) in growing economies.**

## React App with Firebase Integration

This is a modern React application built with Firebase backend, featuring authentication, real-time database, and Material-UI components.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 📊 Modern Dashboard with Material-UI
- 🏗️ Modular Architecture
- 📱 Responsive Design
- 🔥 Firebase Backend Integration
- ⚛️ React 19 with Hooks
- 🎨 Material-UI Components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SeneshFitzroy/CoreERP.git
cd CoreERP
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password provider
   - Create a Firestore database
   - Get your Firebase configuration

4. Create environment file:
```bash
cp .env.example .env.local
```

5. Update `.env.local` with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

6. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

### Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard
│   ├── Login.js         # Authentication component
│   └── Navigation.js    # Navigation bar
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── firebase/            # Firebase configuration
│   └── config.js        # Firebase setup
├── App.js              # Main app component
├── App.css             # App styles
├── index.js            # Entry point
└── index.css           # Global styles
```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App

### Firebase Setup

1. **Authentication Setup:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Email/Password provider

2. **Firestore Database:**
   - Go to Firebase Console > Firestore Database
   - Create database in test mode (or production mode with proper rules)

3. **Storage (Optional):**
   - Go to Firebase Console > Storage
   - Set up Cloud Storage bucket

### ERP Features (Future Development)

Traditional ERP systems are often too costly, complex, and rigid for SMBs. CoreERP solves this by providing an AI-powered, cloud-native solution that automates repetitive tasks, provides clear business insights, and enables data-driven decisions without the enterprise-level overhead.

#### ✨ Key Features (Planned)
*   **📦 AI-Powered Inventory Management:** Predictive alerts for stockouts and intelligent restocking suggestions.
*   **🚚 Real-Time Order Tracking:** A centralized dashboard to manage orders from placement to delivery.
*   **📊 Simplified Accounting:** Easy expense tracking and automated financial summaries.
*   **📈 Analytics & Insights Dashboard:** Clear, AI-generated insights and growth suggestions.
*   **🔒 Secure Role-Based Access:** Manage permissions for Owners, Accountants, and Staff.

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

### Support

For support and questions, please open an issue on GitHub.
