import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Reusable Data Table Component
export const DataTable = ({
  columns,
  data,
  loading,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  actions = true,
  searchable = true,
  onSearch,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  pagination = true,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {searchable && (
        <CardContent>
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      )}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              {columns.map((column, index) => (
                <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                  {column.header}
                </TableCell>
              ))}
              {actions && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <CircularProgress size={40} sx={{ color: '#1e40af' }} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} hover onClick={() => onRowClick && onRowClick(row)}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render ? column.render(row[column.field], row) : row[column.field]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {onView && (
                          <Tooltip title="View">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(row);
                              }}
                              sx={{ color: '#3b82f6' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                              }}
                              sx={{ color: '#d97706' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                              sx={{ color: '#dc2626' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => onPageChange && onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      )}
    </Card>
  );
};

// Reusable Form Dialog Component
export const FormDialog = ({
  open,
  onClose,
  title,
  children,
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
  maxWidth = "sm",
  fullWidth = true
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel || onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reusable Statistics Card Component
export const StatCard = ({
  title,
  value,
  icon,
  color = '#3b82f6',
  subtitle,
  onClick
}) => {
  return (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        boxShadow: `0 4px 12px ${color}30`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: `0 6px 16px ${color}40`,
          transform: 'translateY(-1px)'
        } : {},
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && <Box sx={{ mr: 2 }}>{icon}</Box>}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Reusable Action Button Component
export const ActionButton = ({
  onClick,
  icon,
  label,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  loading = false
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      sx={{
        borderRadius: '10px',
        fontWeight: 'bold',
        textTransform: 'none',
        px: 3,
        py: 1.5,
        ...(variant === 'contained' && {
          background: `linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)`,
            boxShadow: '0 6px 16px rgba(30, 64, 175, 0.4)',
            transform: 'translateY(-1px)'
          }
        })
      }}
    >
      {label}
    </Button>
  );
};

// Reusable Status Chip Component
export const StatusChip = ({
  status,
  color,
  icon,
  size = 'small'
}) => {
  const getStatusColor = (status) => {
    if (color) return color;
    
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'approved':
        return 'success';
      case 'pending':
      case 'quarantined':
        return 'warning';
      case 'expired':
      case 'cancelled':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      icon={icon}
      label={status}
      color={getStatusColor(status)}
      size={size}
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

// Reusable Notification Component
export const Notification = ({
  open,
  onClose,
  message,
  type = 'info',
  duration = 6000
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        icon={getIcon()}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Reusable Loading Component
export const LoadingSpinner = ({ size = 60, message = "Loading..." }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      gap: 2
    }}>
      <CircularProgress size={size} sx={{ color: '#1e40af' }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

// Reusable Empty State Component
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      gap: 2,
      textAlign: 'center'
    }}>
      {icon && <Box sx={{ fontSize: 80, color: '#6b7280' }}>{icon}</Box>}
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {action && actionText && (
        <Button variant="contained" onClick={action} sx={{ mt: 2 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

// Reusable Search Bar Component
export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  fullWidth = false,
  maxWidth = 400
}) => {
  return (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && onClear && (
          <InputAdornment position="end">
            <IconButton onClick={onClear} size="small">
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
      sx={{ maxWidth: fullWidth ? 'none' : maxWidth }}
    />
  );
};
