import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Thermostat as ThermostatIcon,
  Warehouse as WarehouseIcon,
  Assignment as PrescriptionIcon,
  People as PeopleIcon,
  Storage as InventoryIcon,
  Verified as VerifiedIcon,
  Description as DescriptionIcon,
  Report as EmergencyIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { complianceGuidelines, searchGuidelines } from '../../data/complianceGuidelines';

const RegulatoryCompliance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState(complianceGuidelines.sections);
  const [expandedSections, setExpandedSections] = useState({});
  const [showEmergencyProcedures, setShowEmergencyProcedures] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Icon mapping for sections
  const getSectionIcon = (iconName) => {
    const iconMap = {
      warehouse: <WarehouseIcon sx={{ color: '#3b82f6' }} />,
      prescription: <PrescriptionIcon sx={{ color: '#059669' }} />,
      security: <SecurityIcon sx={{ color: '#dc2626' }} />,
      thermostat: <ThermostatIcon sx={{ color: '#d97706' }} />,
      warning: <WarningIcon sx={{ color: '#ef4444' }} />,
      people: <PeopleIcon sx={{ color: '#8b5cf6' }} />,
      inventory: <InventoryIcon sx={{ color: '#06b6d4' }} />,
      verified: <VerifiedIcon sx={{ color: '#10b981' }} />,
      description: <DescriptionIcon sx={{ color: '#6366f1' }} />
    };
    return iconMap[iconName] || <CheckCircleIcon sx={{ color: '#6b7280' }} />;
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSections(complianceGuidelines.sections);
    } else {
      const searchResults = searchGuidelines(searchTerm);
      setFilteredSections(searchResults.map(result => result.section));
    }
  }, [searchTerm]);

  // Handle section expansion
  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Get critical points count for badge
  const getCriticalPointsCount = (section) => {
    return section.criticalPoints ? section.criticalPoints.length : 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1e3a8a',
            letterSpacing: '0.5px'
          }}
        >
          Regulatory Compliance Guidelines
        </Typography>
        <Chip
          label="For Pharmacists"
          color="primary"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* Search and Emergency Procedures */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search compliance guidelines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ maxWidth: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => setShowEmergencyProcedures(!showEmergencyProcedures)}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <EmergencyIcon sx={{ fontSize: 40, color: '#dc2626', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                Emergency Procedures
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to view emergency protocols
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emergency Procedures Collapse */}
      <Collapse in={showEmergencyProcedures}>
        <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#dc2626' }}>
              Emergency Procedures
            </Typography>
            <Grid container spacing={3}>
              {complianceGuidelines.emergencyProcedures.map((procedure, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {procedure.title}
                    </Typography>
                    <List dense>
                      {procedure.steps.map((step, stepIndex) => (
                        <ListItem key={stepIndex} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'bold', 
                              color: '#dc2626',
                              fontSize: '0.875rem'
                            }}>
                              {stepIndex + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText 
                            primary={step}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Common Violations Alert */}
      <Alert 
        severity="warning" 
        sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        icon={<WarningIcon />}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Common Compliance Violations to Avoid:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {complianceGuidelines.commonViolations.map((violation, index) => (
            <Chip
              key={index}
              label={violation}
              size="small"
              color="warning"
              variant="outlined"
            />
          ))}
        </Box>
      </Alert>

      {/* Compliance Guidelines Sections */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1e3a8a' }}>
          Compliance Guidelines
        </Typography>
        
        {filteredSections.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No guidelines found matching your search.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try different search terms or clear the search to see all guidelines.
            </Typography>
          </Card>
        ) : (
          filteredSections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expandedSections[section.id] || false}
              onChange={() => handleSectionToggle(section.id)}
              sx={{ 
                mb: 2, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e5e7eb',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ mr: 2 }}>
                    {getSectionIcon(section.icon)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {section.title}
                      </Typography>
                      {getCriticalPointsCount(section) > 0 && (
                        <Badge 
                          badgeContent={getCriticalPointsCount(section)} 
                          color="error"
                        >
                          <Chip
                            label="Critical"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        </Badge>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {section.description}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Main Guidelines */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3a8a' }}>
                      Guidelines
                    </Typography>
                    <List>
                      {section.guidelines.map((guideline, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={guideline}
                            primaryTypographyProps={{ fontSize: '0.95rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  {/* Critical Points */}
                  {section.criticalPoints && section.criticalPoints.length > 0 && (
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          fontWeight: 'bold', 
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <WarningIcon sx={{ fontSize: 20 }} />
                          Critical Points
                        </Typography>
                        <List dense>
                          {section.criticalPoints.map((point, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <WarningIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={point}
                                primaryTypographyProps={{ 
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold',
                                  color: '#dc2626'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Footer Information */}
      <Card sx={{ mt: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3a8a' }}>
            Important Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These guidelines are based on current pharmaceutical regulations and best practices. 
            Always refer to the latest regulatory updates and consult with your compliance officer 
            for specific requirements in your jurisdiction.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()} | 
            <strong> Version:</strong> 1.0 | 
            <strong> For Questions:</strong> Contact your compliance officer
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegulatoryCompliance;
