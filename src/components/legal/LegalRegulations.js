import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Balance as Scale,
  Shield,
  Warning as AlertTriangle,
  CheckCircle,
  Info,
  Description,
  Group as Users,
  Schedule as Clock,
  Business as BusinessIcon,
  MilitaryTech as Award,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const LegalRegulations = () => {
  const theme = useTheme();
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
        default: return '#3B82F6';
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
                <Icon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#212121', mr: 2 }}>
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
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  {description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ color: '#757575' }}>
              {isExpanded ? <ExpandLessIcon sx={{ fontSize: 24 }} /> : <ExpandMoreIcon sx={{ fontSize: 24 }} />}
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
        case 'completed': return <CheckCircle sx={{ color: '#059669', fontSize: 16 }} />;
        case 'warning': return <AlertTriangle sx={{ color: '#f59e0b', fontSize: 16 }} />;
        default: return <Info sx={{ color: '#3B82F6', fontSize: 16 }} />;
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
            color: '#212121'
          }}
        />
      </ListItem>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white'
      }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Pharmacy Regulations - Sri Lanka
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Comprehensive guide to legal requirements and compliance standards for pharmacy operations
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            label="Licensing" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip 
            label="Operations" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip 
            label="Staff Requirements" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip 
            label="Record Keeping" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Box>

      {/* Regulations Sections */}
      <RegulationSection
        id="licensing"
        title="Pharmacy Licensing"
        icon={Shield}
        priority="HIGH"
        description="Requirements for obtaining and maintaining a pharmacy license"
        isExpanded={expandedSections.licensing}
        onToggle={() => toggleSection('licensing')}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Key Requirements
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Valid business registration certificate" 
                status="required" 
              />
              <ComplianceItem 
                text="Qualified pharmacist in charge (must be present during operating hours)" 
                status="required" 
              />
              <ComplianceItem 
                text="Approved premises meeting size and layout requirements" 
                status="required" 
              />
              <ComplianceItem 
                text="Proper storage facilities for medicines (refrigeration, controlled substances storage)" 
                status="required" 
              />
              <ComplianceItem 
                text="License renewal every 12 months" 
                status="required" 
              />
            </List>
          </Paper>
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Application Process
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Submit application to the Pharmacy Board" 
                status="required" 
              />
              <ComplianceItem 
                text="Pay required fees (LKR 5,000 for new license)" 
                status="required" 
              />
              <ComplianceItem 
                text="Inspection of premises by regulatory authority" 
                status="required" 
              />
              <ComplianceItem 
                text="Approval typically takes 2-4 weeks" 
                status="info" 
              />
            </List>
          </Paper>
        </Box>
      </RegulationSection>

      <RegulationSection
        id="operations"
        title="Operational Requirements"
        icon={BusinessIcon}
        priority="HIGH"
        description="Daily operational standards and procedures"
        isExpanded={expandedSections.operations}
        onToggle={() => toggleSection('operations')}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Dispensing Standards
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="All prescriptions must be verified by a qualified pharmacist" 
                status="required" 
              />
              <ComplianceItem 
                text="Maintain prescription records for minimum 2 years" 
                status="required" 
              />
              <ComplianceItem 
                text="Proper labeling of all dispensed medications" 
                status="required" 
              />
              <ComplianceItem 
                text="Patient counseling when appropriate" 
                status="recommended" 
              />
            </List>
          </Paper>
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Storage & Handling
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Controlled drugs stored in locked cabinets" 
                status="required" 
              />
              <ComplianceItem 
                text="Temperature monitoring for refrigerated medications" 
                status="required" 
              />
              <ComplianceItem 
                text="Protection from light, moisture, and heat as required" 
                status="required" 
              />
              <ComplianceItem 
                text="First expiry, first out (FEFO) rotation system" 
                status="recommended" 
              />
            </List>
          </Paper>
        </Box>
      </RegulationSection>

      <RegulationSection
        id="staff"
        title="Staff Requirements"
        icon={Users}
        priority="MEDIUM"
        description="Qualifications and responsibilities of pharmacy staff"
        isExpanded={expandedSections.staff}
        onToggle={() => toggleSection('staff')}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Qualifications
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Pharmacist in charge must hold valid Sri Lanka Pharmacy Council registration" 
                status="required" 
              />
              <ComplianceItem 
                text="Pharmacy assistants must have relevant training/certification" 
                status="required" 
              />
              <ComplianceItem 
                text="Annual continuing education requirements for pharmacists" 
                status="required" 
              />
            </List>
          </Paper>
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Responsibilities
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Maintaining professional standards and ethical conduct" 
                status="required" 
              />
              <ComplianceItem 
                text="Reporting adverse drug reactions to relevant authorities" 
                status="required" 
              />
              <ComplianceItem 
                text="Ensuring patient confidentiality at all times" 
                status="required" 
              />
            </List>
          </Paper>
        </Box>
      </RegulationSection>

      <RegulationSection
        id="records"
        title="Record Keeping"
        icon={Description}
        priority="HIGH"
        description="Documentation and record maintenance requirements"
        isExpanded={expandedSections.records}
        onToggle={() => toggleSection('records')}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
            Required Records
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <List>
              <ComplianceItem 
                text="Prescription records (minimum 2 years)" 
                status="required" 
              />
              <ComplianceItem 
                text="Purchase and sales records for controlled substances" 
                status="required" 
              />
              <ComplianceItem 
                text="Temperature monitoring logs for refrigerated storage" 
                status="required" 
              />
              <ComplianceItem 
                text="Staff training and certification records" 
                status="required" 
              />
              <ComplianceItem 
                text="Complaint and adverse event logs" 
                status="required" 
              />
            </List>
          </Paper>
        </Box>
        
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
              Storage Requirements
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
              <List>
                <ComplianceItem 
                  text="Digital backup of all records" 
                  status="recommended" 
                />
                <ComplianceItem 
                  text="Secure storage to prevent unauthorized access" 
                  status="required" 
                />
                <ComplianceItem 
                  text="Easy retrieval for inspection purposes" 
                  status="required" 
                />
              </List>
            </Paper>
          </Box>
        </RegulationSection>

        <RegulationSection
          id="inspections"
          title="Inspections & Audits"
          icon={Clock}
          priority="MEDIUM"
          description="Regulatory inspections and compliance audits"
          isExpanded={expandedSections.inspections}
          onToggle={() => toggleSection('inspections')}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
              Scheduled Inspections
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
              <List>
                <ComplianceItem 
                  text="Annual routine inspection by Pharmacy Inspector" 
                  status="required" 
                />
                <ComplianceItem 
                  text="Unannounced inspections may occur" 
                  status="info" 
                />
                <ComplianceItem 
                  text="Compliance with inspection findings within specified timeframe" 
                  status="required" 
                />
              </List>
            </Paper>
          </Box>
          
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
              Preparing for Inspections
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
              <List>
                <ComplianceItem 
                  text="Ensure all licenses and certifications are current and displayed" 
                  status="required" 
                />
                <ComplianceItem 
                  text="Organize records for easy access" 
                  status="recommended" 
                />
                <ComplianceItem 
                  text="Train staff on inspection procedures" 
                  status="recommended" 
                />
              </List>
            </Paper>
          </Box>
        </RegulationSection>

        <RegulationSection
          id="penalties"
          title="Penalties & Compliance"
          icon={AlertTriangle}
          priority="HIGH"
          description="Consequences of non-compliance and violation penalties"
          isExpanded={expandedSections.penalties}
          onToggle={() => toggleSection('penalties')}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
              Common Violations
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
              <List>
                <ComplianceItem 
                  text="Operating without valid license (Fine up to LKR 100,000)" 
                  status="warning" 
                />
                <ComplianceItem 
                  text="Dispensing prescription drugs without prescription (Fine up to LKR 50,000)" 
                  status="warning" 
                />
                <ComplianceItem 
                  text="Improper storage of controlled substances (License suspension/revocation)" 
                  status="warning" 
                />
                <ComplianceItem 
                  text="Failure to maintain required records (Fine up to LKR 25,000)" 
                  status="warning" 
                />
              </List>
            </Paper>
          </Box>
          
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#212121' }}>
              Corrective Actions
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
              <List>
                <ComplianceItem 
                  text="Immediate rectification of violations" 
                  status="required" 
                />
                <ComplianceItem 
                  text="Submission of compliance report within 14 days" 
                  status="required" 
                />
                <ComplianceItem 
                  text="Follow-up inspection to verify corrections" 
                  status="required" 
                />
              </List>
            </Paper>
          </Box>
        </RegulationSection>
      </Box>
    );
  };

  export default LegalRegulations;