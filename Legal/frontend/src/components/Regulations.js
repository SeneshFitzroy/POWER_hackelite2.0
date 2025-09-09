import React, { useState } from 'react';
import {
  Scale,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Users,
  Clock,
  Building,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Alert,
  Link
} from '@mui/material';

// Custom colors for the legal module
const COLORS = {
  darkBlue: '#1E3A8A',
  mediumBlue: '#3B82F6',
  lightGray: '#f8f9fa',
  darkGray: '#212121',
  lighterGray: '#757575'
};

const Regulations = () => {
  const [expandedSections, setExpandedSections] = useState({
    licensing: true,
    operations: false,
    staff: false,
    records: false,
    inspections: false,
    penalties: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const RegulationSection = ({ 
    id, 
    title, 
    icon: Icon, 
    priority, 
    description, 
    children,
    isExpanded,
    onToggle 
  }) => {
    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'HIGH': return '#dc2626';
        case 'MEDIUM': return '#9333ea';
        case 'LOW': return '#059669';
        default: return COLORS.mediumBlue;
      }
    };

    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: getPriorityColor(priority),
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              backgroundColor: `${getPriorityColor(priority)}10`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={onToggle}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: getPriorityColor(priority),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <Icon size={24} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mr: 2 }}>
                    {title}
                  </Typography>
                  <Chip 
                    label={priority} 
                    size="small"
                    sx={{ 
                      backgroundColor: getPriorityColor(priority),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                  {description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ color: COLORS.lighterGray }}>
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </Box>
          </Box>
          
          <Collapse in={isExpanded}>
            <Box sx={{ p: 3, pt: 0 }}>
              {children}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const ComplianceItem = ({ text, status = 'required' }) => {
    const getStatusIcon = () => {
      switch(status) {
        case 'completed': return <CheckCircle size={16} style={{ color: '#059669' }} />;
        case 'warning': return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
        default: return <Info size={16} style={{ color: COLORS.mediumBlue }} />;
      }
    };

    return (
      <ListItem sx={{ py: 0.5, px: 0 }}>
        <ListItemIcon sx={{ minWidth: 32 }}>
          {getStatusIcon()}
        </ListItemIcon>
        <ListItemText 
          primary={text}
          primaryTypographyProps={{ 
            variant: 'body2',
            color: COLORS.darkGray
          }}
        />
      </ListItem>
    );
  };

  return (
    <Card sx={{ backgroundColor: COLORS.lightGray }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Scale size={32} style={{ marginRight: 16 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Pharmacy Regulations - Sri Lanka
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 800, mx: 'auto' }}>
            Comprehensive guide to legal requirements and compliance standards for pharmacy operations
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            <Chip 
              label="Legal Framework: Pharmacy Act No. 17 of 1952" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip 
              label="Regulatory Body: National Drug Regulatory Authority (NDRA)" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip 
              label="Provincial Health Departments" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>

        {/* Key Compliance Reminders */}
        <Alert 
          severity="warning" 
          sx={{ mb: 4, borderRadius: 2 }}
          icon={<AlertTriangle />}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Key Compliance Reminders
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 1 }}>
                  License Renewal
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
                  Annual renewal required 30 days before expiration
                </Typography>
                <Chip label="HIGH" size="small" sx={{ mt: 1, backgroundColor: '#dc2626', color: 'white' }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#9333ea', mb: 1 }}>
                  Inspection Readiness
                </Typography>
                <Typography variant="body2" sx={{ color: '#581c87' }}>
                  Regular inspections by health authorities
                </Typography>
                <Chip label="MEDIUM" size="small" sx={{ mt: 1, backgroundColor: '#9333ea', color: 'white' }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#9333ea', mb: 1 }}>
                  Staff Training
                </Typography>
                <Typography variant="body2" sx={{ color: '#581c87' }}>
                  Continuous education for pharmacy staff
                </Typography>
                <Chip label="MEDIUM" size="small" sx={{ mt: 1, backgroundColor: '#9333ea', color: 'white' }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 1 }}>
                  Record Maintenance
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
                  Daily updates and proper documentation
                </Typography>
                <Chip label="HIGH" size="small" sx={{ mt: 1, backgroundColor: '#dc2626', color: 'white' }} />
              </Paper>
            </Grid>
          </Grid>
        </Alert>

        {/* Detailed Regulations */}
        <RegulationSection
          id="licensing"
          title="Licensing & Registration"
          icon={Shield}
          priority="HIGH"
          description="Requirements for pharmacy license and registration"
          isExpanded={expandedSections.licensing}
          onToggle={() => toggleSection('licensing')}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
            Essential Requirements
          </Typography>
          <List>
            <ComplianceItem text="Valid pharmacy license from Provincial Health Department" status="required" />
            <ComplianceItem text="Business registration certificate from Registrar of Companies" status="required" />
            <ComplianceItem text="Responsible pharmacist must be registered with SLMC" status="required" />
            <ComplianceItem text="Annual license renewal 30 days before expiration" status="warning" />
            <ComplianceItem text="Display license certificate prominently in pharmacy" status="required" />
            <ComplianceItem text="Maintain valid professional indemnity insurance" status="required" />
          </List>
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: COLORS.lighterGray, fontStyle: 'italic' }}>
            Reference: Pharmacy Act No. 17 of 1952, Section 12-15
          </Typography>
        </RegulationSection>

        <RegulationSection
          id="operations"
          title="Operational Requirements"
          icon={Building}
          priority="HIGH"
          description="Daily operational compliance and standards"
          isExpanded={expandedSections.operations}
          onToggle={() => toggleSection('operations')}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Premises Requirements
              </Typography>
              <List>
                <ComplianceItem text="Minimum 200 sq ft floor space" status="required" />
                <ComplianceItem text="Proper ventilation and lighting" status="required" />
                <ComplianceItem text="Separate storage for controlled drugs" status="required" />
                <ComplianceItem text="Temperature-controlled storage areas" status="required" />
                <ComplianceItem text="Clean water supply and sanitation facilities" status="required" />
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Operating Hours & Staffing
              </Typography>
              <List>
                <ComplianceItem text="Responsible pharmacist present during operating hours" status="required" />
                <ComplianceItem text="Qualified assistant when pharmacist absent" status="required" />
                <ComplianceItem text="Emergency contact information displayed" status="required" />
                <ComplianceItem text="Proper identification badges for all staff" status="required" />
              </List>
            </Grid>
          </Grid>
        </RegulationSection>

        <RegulationSection
          id="staff"
          title="Staff Qualifications & Training"
          icon={Users}
          priority="MEDIUM"
          description="Requirements for pharmacy personnel"
          isExpanded={expandedSections.staff}
          onToggle={() => toggleSection('staff')}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Responsible Pharmacist
              </Typography>
              <List>
                <ComplianceItem text="Bachelor's degree in Pharmacy from recognized university" status="required" />
                <ComplianceItem text="Registration with Sri Lanka Medical Council (SLMC)" status="required" />
                <ComplianceItem text="Valid practicing certificate" status="required" />
                <ComplianceItem text="Minimum 2 years experience (for new licenses)" status="required" />
                <ComplianceItem text="Continuing professional development (CPD) credits" status="required" />
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Support Staff
              </Typography>
              <List>
                <ComplianceItem text="Pharmacy technicians with relevant qualifications" status="required" />
                <ComplianceItem text="Regular training on drug safety and regulations" status="required" />
                <ComplianceItem text="Annual health screening for all staff" status="required" />
                <ComplianceItem text="Training records maintained for inspection" status="required" />
              </List>
            </Grid>
          </Grid>
        </RegulationSection>

        <RegulationSection
          id="records"
          title="Record Keeping & Documentation"
          icon={FileText}
          priority="HIGH"
          description="Mandatory records and documentation requirements"
          isExpanded={expandedSections.records}
          onToggle={() => toggleSection('records')}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
            Required Records (Minimum 3 years retention)
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: COLORS.darkBlue, mb: 1 }}>
                  Purchase Records
                </Typography>
                <List dense>
                  <ComplianceItem text="Supplier invoices and receipts" />
                  <ComplianceItem text="Drug purchase registers" />
                  <ComplianceItem text="Controlled drug registers" />
                  <ComplianceItem text="Return and damage records" />
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#059669', mb: 1 }}>
                  Sales Records
                </Typography>
                <List dense>
                  <ComplianceItem text="Daily sales registers" />
                  <ComplianceItem text="Prescription records" />
                  <ComplianceItem text="Patient counseling logs" />
                  <ComplianceItem text="Adverse reaction reports" />
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, backgroundColor: '#fefbf3', border: '1px solid #fed7aa' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ea580c', mb: 1 }}>
                  Inventory Records
                </Typography>
                <List dense>
                  <ComplianceItem text="Stock registers" />
                  <ComplianceItem text="Expiry date monitoring" />
                  <ComplianceItem text="Storage temperature logs" />
                  <ComplianceItem text="Wastage and disposal records" />
                </List>
              </Paper>
            </Grid>
          </Grid>
        </RegulationSection>

        <RegulationSection
          id="inspections"
          title="Inspections & Compliance"
          icon={Award}
          priority="MEDIUM"
          description="Regulatory inspections and compliance monitoring"
          isExpanded={expandedSections.inspections}
          onToggle={() => toggleSection('inspections')}
        >
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Inspection Frequency:</strong> Routine inspections occur annually, with additional inspections 
              following complaints or license renewals. Emergency inspections may occur at any time.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Inspection Checklist
              </Typography>
              <List>
                <ComplianceItem text="Valid licenses and certificates displayed" />
                <ComplianceItem text="Qualified pharmacist present" />
                <ComplianceItem text="Proper drug storage conditions" />
                <ComplianceItem text="Accurate record keeping" />
                <ComplianceItem text="Cleanliness and hygiene standards" />
                <ComplianceItem text="Proper labeling and dispensing procedures" />
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
                Post-Inspection Requirements
              </Typography>
              <List>
                <ComplianceItem text="Address deficiencies within specified timeframe" />
                <ComplianceItem text="Submit corrective action reports" />
                <ComplianceItem text="Allow follow-up inspections" />
                <ComplianceItem text="Maintain inspection reports on file" />
              </List>
            </Grid>
          </Grid>
        </RegulationSection>

        <RegulationSection
          id="penalties"
          title="Penalties & Enforcement"
          icon={AlertTriangle}
          priority="HIGH"
          description="Consequences of non-compliance"
          isExpanded={expandedSections.penalties}
          onToggle={() => toggleSection('penalties')}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> Non-compliance with pharmacy regulations can result in serious 
              penalties including fines, license suspension, or criminal prosecution.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 2 }}>
                Administrative Penalties
              </Typography>
              <List>
                <ComplianceItem text="Written warnings for minor violations" status="warning" />
                <ComplianceItem text="Fines ranging from LKR 10,000 - 500,000" status="warning" />
                <ComplianceItem text="Temporary license suspension" status="warning" />
                <ComplianceItem text="Permanent license revocation" status="warning" />
                <ComplianceItem text="Prohibition from operating pharmacies" status="warning" />
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 2 }}>
                Criminal Penalties
              </Typography>
              <List>
                <ComplianceItem text="Imprisonment up to 2 years for serious violations" status="warning" />
                <ComplianceItem text="Criminal fines up to LKR 1,000,000" status="warning" />
                <ComplianceItem text="Prosecution for sale of counterfeit drugs" status="warning" />
                <ComplianceItem text="Charges for endangering public health" status="warning" />
              </List>
            </Grid>
          </Grid>
        </RegulationSection>

        {/* Footer */}
        <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.darkGray, mb: 2 }}>
            Important Contacts & Resources
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: COLORS.darkBlue, mb: 1 }}>
                National Drug Regulatory Authority (NDRA)
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                Phone: +94 11 269 4033<br />
                Email: info@ndra.gov.lk
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: COLORS.darkBlue, mb: 1 }}>
                Sri Lanka Medical Council (SLMC)
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                Phone: +94 11 269 4068<br />
                Email: info@slmc.lk
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: COLORS.darkBlue, mb: 1 }}>
                Ministry of Health
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.lighterGray }}>
                Phone: +94 11 269 4033<br />
                Website: www.health.gov.lk
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ color: COLORS.lighterGray, display: 'block', textAlign: 'center' }}>
            This information is for guidance only. Always consult current legislation and regulatory authorities for the most up-to-date requirements.
            <br />
            Last updated: September 2025
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default Regulations;
