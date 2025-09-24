import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  LocalPharmacy as LocalPharmacyIcon
} from '@mui/icons-material';

const EcommerceCheckout = ({ cart = [], onBack, onOrderComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    district: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: ''
  });

  const [deliveryOption, setDeliveryOption] = useState('standard');

  const steps = ['Shipping Information', 'Payment Method', 'Review Order'];

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 500 : deliveryOption === 'same-day' ? 1000 : 250;
  const total = subtotal + deliveryFee;

  // Sri Lankan districts
  const sriLankanDistricts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  // Delivery options
  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      price: 250,
      icon: <ShippingIcon />
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '1-2 business days',
      price: 500,
      icon: <ShippingIcon />
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      description: 'Within Colombo area only',
      price: 1000,
      icon: <ShippingIcon />
    }
  ];

  // Validation functions
  const validateShipping = () => {
    return shippingInfo.firstName && shippingInfo.lastName && shippingInfo.email && 
           shippingInfo.phone && shippingInfo.address && shippingInfo.city && 
           shippingInfo.postalCode && shippingInfo.district;
  };

  const validatePayment = () => {
    if (paymentInfo.method === 'card') {
      return paymentInfo.cardNumber && paymentInfo.expiryDate && 
             paymentInfo.cvv && paymentInfo.cardholderName;
    } else if (paymentInfo.method === 'bank') {
      return paymentInfo.bankName && paymentInfo.accountNumber;
    }
    return true; // For cash on delivery
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all shipping information',
        severity: 'error'
      });
      return;
    }
    if (activeStep === 1 && !validatePayment()) {
      setSnackbar({
        open: true,
        message: 'Please complete payment information',
        severity: 'error'
      });
      return;
    }
    if (activeStep === 2) {
      handlePlaceOrder();
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderNum = 'MED' + Date.now().toString().slice(-6);
      setOrderNumber(orderNum);
      setOrderPlaced(true);
      
      // Clear cart and notify parent
      if (onOrderComplete) {
        onOrderComplete(orderNum);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Order failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Shipping Information Step
  const ShippingStep = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={shippingInfo.firstName}
            onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={shippingInfo.lastName}
            onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={shippingInfo.email}
            onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
            placeholder="07X XXX XXXX"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
            multiline
            rows={2}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            value={shippingInfo.city}
            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Postal Code"
            value={shippingInfo.postalCode}
            onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>District</InputLabel>
            <Select
              value={shippingInfo.district}
              onChange={(e) => setShippingInfo({...shippingInfo, district: e.target.value})}
              label="District"
            >
              {sriLankanDistricts.map(district => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Delivery Options
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={deliveryOption}
            onChange={(e) => setDeliveryOption(e.target.value)}
          >
            {deliveryOptions.map(option => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    {option.icon}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {option.name} - LKR {option.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );

  // Payment Step
  const PaymentStep = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <RadioGroup
          value={paymentInfo.method}
          onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
        >
          <FormControlLabel
            value="card"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCardIcon sx={{ mr: 1 }} />
                Credit/Debit Card
              </Box>
            }
          />
          <FormControlLabel
            value="bank"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BankIcon sx={{ mr: 1 }} />
                Bank Transfer
              </Box>
            }
          />
          <FormControlLabel
            value="cod"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalPharmacyIcon sx={{ mr: 1 }} />
                Cash on Delivery
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>

      {paymentInfo.method === 'card' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={paymentInfo.cardholderName}
              onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={paymentInfo.cardNumber}
              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
              placeholder="1234 5678 9012 3456"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              value={paymentInfo.expiryDate}
              onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
              placeholder="MM/YY"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="CVV"
              value={paymentInfo.cvv}
              onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
              placeholder="123"
            />
          </Grid>
        </Grid>
      )}

      {paymentInfo.method === 'bank' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Bank Name</InputLabel>
              <Select
                value={paymentInfo.bankName}
                onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                label="Bank Name"
              >
                <MenuItem value="Commercial Bank">Commercial Bank</MenuItem>
                <MenuItem value="People's Bank">People's Bank</MenuItem>
                <MenuItem value="Bank of Ceylon">Bank of Ceylon</MenuItem>
                <MenuItem value="Sampath Bank">Sampath Bank</MenuItem>
                <MenuItem value="HNB">Hatton National Bank</MenuItem>
                <MenuItem value="NDB">National Development Bank</MenuItem>
                <MenuItem value="Seylan Bank">Seylan Bank</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Number"
              value={paymentInfo.accountNumber}
              onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
            />
          </Grid>
        </Grid>
      )}

      {paymentInfo.method === 'cod' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            You will pay cash upon delivery. Please have the exact amount ready.
          </Typography>
        </Alert>
      )}

      <Alert severity="success" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <SecurityIcon sx={{ mr: 1 }} />
        Your payment information is secure and encrypted
      </Alert>
    </Paper>
  );

  // Review Step
  const ReviewStep = () => (
    <Box>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <List>
          {cart.map(item => (
            <ListItem key={item.id} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar src={item.image} variant="rounded" />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={`${item.brand} • Qty: ${item.quantity}`}
              />
              <Typography variant="body1" fontWeight="bold">
                LKR {(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>LKR {subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Delivery:</Typography>
            <Typography>LKR {deliveryFee.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">Total:</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              LKR {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 1 }} />
              Delivery Address
            </Typography>
            <Typography variant="body2">
              {shippingInfo.firstName} {shippingInfo.lastName}
            </Typography>
            <Typography variant="body2">{shippingInfo.address}</Typography>
            <Typography variant="body2">
              {shippingInfo.city}, {shippingInfo.district} {shippingInfo.postalCode}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {shippingInfo.phone}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CreditCardIcon sx={{ mr: 1 }} />
              Payment Method
            </Typography>
            <Typography variant="body2">
              {paymentInfo.method === 'card' && 'Credit/Debit Card'}
              {paymentInfo.method === 'bank' && 'Bank Transfer'}
              {paymentInfo.method === 'cod' && 'Cash on Delivery'}
            </Typography>
            {paymentInfo.method === 'card' && (
              <Typography variant="body2">
                •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
              </Typography>
            )}
            {paymentInfo.method === 'bank' && (
              <Typography variant="body2">
                {paymentInfo.bankName}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Order Success Dialog
  const OrderSuccessDialog = () => (
    <Dialog open={orderPlaced} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
          Order Placed Successfully!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Order Number: {orderNumber}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Thank you for your order. We'll send you a confirmation email shortly.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Expected delivery: {deliveryOption === 'same-day' ? 'Today' : 
                               deliveryOption === 'express' ? '1-2 business days' : 
                               '3-5 business days'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="contained" onClick={() => window.location.href = '/'}>
          Continue Shopping
        </Button>
        <Button variant="outlined" onClick={() => setOrderPlaced(false)}>
          Track Order
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (cart.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={onBack}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Checkout
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {activeStep === 0 && <ShippingStep />}
          {activeStep === 1 && <PaymentStep />}
          {activeStep === 2 && <ReviewStep />}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</Typography>
                <Typography>LKR {subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Delivery:</Typography>
                <Typography>LKR {deliveryFee.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  LKR {total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(prev => prev - 1)}
                disabled={activeStep === 0}
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                fullWidth
                sx={{
                  backgroundColor: '#1e3a8a',
                  '&:hover': { backgroundColor: '#1e40af' }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : activeStep === 2 ? (
                  'Place Order'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <OrderSuccessDialog />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EcommerceCheckout;
