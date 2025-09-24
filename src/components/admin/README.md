# Admin Module Documentation

## Overview
The Admin Module provides comprehensive system administration capabilities for the CoreERP pharmacy management system. It includes user management, legal document editing, security monitoring, and data backup/restore functionalities.

## Features

### 1. Legal Document Editor ✅
- **Live Website Integration**: Directly edits content for https://pharma-core-erp.vercel.app/legal
- **Full CRUD Operations**: Create, Read, Update, Delete legal documents
- **Image Upload**: Firebase Storage integration for document images
- **Rich Text Editor**: Comprehensive text editing capabilities
- **Document Categories**: Organize documents by type (Privacy Policy, Terms of Service, etc.)
- **Version Control**: Track document changes and updates
- **Preview Functionality**: Preview documents before publishing

**Key Functions:**
- Add new legal documents with images
- Edit existing document content and metadata
- Upload and manage document images
- Delete documents with confirmation
- Real-time Firebase sync

### 2. User Management System ✅
- **Complete User Table**: Display all registered users with detailed information
- **User Status Management**: Approve/Block users with single-click actions
- **Bulk Operations**: Perform actions on multiple users simultaneously
- **Advanced Search**: Search users by name, email, or status
- **User Details Modal**: View comprehensive user information
- **Role Management**: Assign and modify user roles
- **Activity Tracking**: Monitor user login and activity patterns

**Key Functions:**
- View all users in paginated table format
- Block/unblock users instantly
- Bulk approve/deny user registrations
- Search and filter users by multiple criteria
- Export user data for reports

### 3. Login Attempts Security Monitor ✅
- **Security Dashboard**: Monitor all login attempts in real-time
- **Risk Assessment**: Automatically calculate risk levels for each attempt
- **IP Blocking**: Block suspicious IP addresses with one click
- **Failed Login Tracking**: Track and analyze failed login patterns
- **Geographic Information**: Display login locations when available
- **Device Detection**: Identify mobile vs desktop login attempts
- **Bulk Security Actions**: Perform security actions on multiple attempts

**Key Functions:**
- Real-time login attempt monitoring
- Automatic risk level calculation
- IP address blocking capabilities
- Failed login pattern analysis
- Geographic and device tracking
- Security alert notifications

### 4. Data Backup & Restore System ✅
- **Complete Database Backup**: Backup all Firebase collections
- **Selective Backup**: Choose specific collections to backup
- **Automated Scheduling**: Set up automatic backup schedules
- **Restore Functionality**: Restore data from backup files
- **Backup History**: Track all backup and restore operations
- **Data Validation**: Verify backup integrity before restore
- **Export Options**: Download backups as JSON files

**Key Functions:**
- Full database backup with one click
- Selective collection backup
- Automatic backup scheduling
- Complete data restore from backups
- Backup history and monitoring
- Data integrity validation

## Technical Implementation

### Architecture
- **Frontend**: React 18 with functional components and hooks
- **UI Framework**: Material-UI with professional ERP theme
- **Icons**: Lucide React for consistent iconography
- **State Management**: React useState and useEffect hooks
- **Backend**: Firebase Firestore for real-time data
- **Storage**: Firebase Storage for file uploads
- **Authentication**: Firebase Authentication integration

### File Structure
```
src/components/admin/
├── AdminDashboard.js          # Main admin dashboard with tabs
├── LegalDocEditor.js          # Legal document CRUD system
├── UserManagement.js          # User administration interface
├── LoginAttempts.js           # Security monitoring dashboard
└── DataBackup.js             # Backup and restore system
```

### Firebase Collections Used
- `users` - User account information
- `legalDocuments` - Legal document content and metadata
- `loginAttempts` - Security and login tracking
- `backupHistory` - Backup operation records
- `blockedIPs` - Blocked IP address list

### Key Dependencies
- React 18.3.1
- Firebase 12.2.1
- Material-UI 7.3.2
- Lucide React 0.542.0
- react-hot-toast 2.4.1

## Access Control
The admin module is accessed through the ERP Dashboard by clicking the "Administration" module. It provides role-based access control ensuring only authorized personnel can access sensitive administrative functions.

## Security Features
- Real-time security monitoring
- Automatic threat detection
- IP blocking capabilities
- Activity logging and audit trails
- Secure data backup and encryption
- User permission management

## Performance Optimizations
- Efficient Firebase queries with pagination
- Image optimization for legal documents
- Lazy loading of data tables
- Background processing for backup operations
- Caching of frequently accessed data

## Future Enhancements
- Advanced analytics dashboard
- Automated security responses
- Integration with external backup services
- Advanced user role management
- System health monitoring
- Compliance reporting tools

## Usage Instructions

### Accessing the Admin Module
1. Log into the CoreERP system
2. Navigate to the ERP Dashboard
3. Click on the "Administration" module
4. Select the desired admin function from the tab navigation

### Managing Legal Documents
1. Go to "Legal Documents" tab
2. Click "Add New Document" to create content
3. Upload images using the file upload interface
4. Edit content using the rich text editor
5. Save changes to publish to the live website

### Managing Users
1. Navigate to "User Management" tab
2. View all users in the table interface
3. Use search and filters to find specific users
4. Click action buttons to approve/block users
5. Use bulk actions for multiple users

### Monitoring Security
1. Access "Login Attempts" tab
2. Review recent login attempts and risk levels
3. Block suspicious IP addresses as needed
4. Monitor failed login patterns
5. Generate security reports

### Backup & Restore
1. Go to "Data Backup" tab
2. Select collections to backup
3. Click "Create Backup" to generate backup file
4. Use "Restore" function to restore from backups
5. Monitor backup history and schedules

## Support and Maintenance
For technical support or feature requests, contact the development team. Regular updates and security patches are applied automatically.

---
*Generated by CoreERP Admin Module - Version 1.0*
