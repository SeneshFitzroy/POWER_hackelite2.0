import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const steps = ['Review Cart', 'Shipping Details', 'Payment Method', 'Order Confirmation'];

const ProfessionalCheckout = ({ cart = [], onBack, onOrderComplete }) => {
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
    bankAccount: '',
    bankName: ''
  });

  const [deliveryOption, setDeliveryOption] = useState('standard');

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 500 : 250;
  const total = subtotal + deliveryFee;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderNum = `ORD${Date.now()}`;
      setOrderNumber(orderNum);
      setOrderPlaced(true);
      
      setSnackbar({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });

      if (onOrderComplete) {
        onOrderComplete({
          orderNumber: orderNum,
          items: cart,
          total,
          shippingInfo,
          paymentInfo
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field) => (event) => {
    setShippingInfo({ ...shippingInfo, [field]: event.target.value });
  };

  const handlePaymentChange = (field) => (event) => {
    setPaymentInfo({ ...paymentInfo, [field]: event.target.value });
  };

  // Cart Review Step
  const CartReviewStep = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
        Review Your Cart
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: '16px', p: 3 }}>
            <List>
              {cart.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={item.images ? item.images[0] : ''}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="bold">
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.brand}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                              Rs. {item.price.toFixed(2)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconButton size="small" sx={{ border: '1px solid #e5e7eb' }}>
                                <RemoveIcon />
                              </IconButton>
                              <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton size="small" sx={{ border: '1px solid #e5e7eb' }}>
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight="bold">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <IconButton color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < cart.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: '16px', p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Subtotal ({cart.length} items)</Typography>
              <Typography>Rs. {subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Delivery Fee</Typography>
              <Typography>Rs. {deliveryFee.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                Rs. {total.toFixed(2)}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Free delivery on orders over Rs. 2,000
            </Alert>

            <Box display="flex" gap={1} sx={{ mb: 2 }}>
              <SecurityIcon sx={{ color: '#10b981' }} />
              <Typography variant="body2" color="text.secondary">
                Secure checkout with SSL encryption
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Shipping Details Step
  const ShippingDetailsStep = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
        Shipping Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: '16px', p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={shippingInfo.firstName}
                  onChange={handleShippingChange('firstName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={shippingInfo.lastName}
                  onChange={handleShippingChange('lastName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange('email')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange('phone')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange('address')}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={shippingInfo.city}
                  onChange={handleShippingChange('city')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange('postalCode')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>District</InputLabel>
                  <Select
                    value={shippingInfo.district}
                    label="District"
                    onChange={handleShippingChange('district')}
                  >
                    <MenuItem value="Colombo">Colombo</MenuItem>
                    <MenuItem value="Gampaha">Gampaha</MenuItem>
                    <MenuItem value="Kalutara">Kalutara</MenuItem>
                    <MenuItem value="Kandy">Kandy</MenuItem>
                    <MenuItem value="Matale">Matale</MenuItem>
                    <MenuItem value="Nuwara Eliya">Nuwara Eliya</MenuItem>
                    <MenuItem value="Galle">Galle</MenuItem>
                    <MenuItem value="Matara">Matara</MenuItem>
                    <MenuItem value="Hambantota">Hambantota</MenuItem>
                    <MenuItem value="Jaffna">Jaffna</MenuItem>
                    <MenuItem value="Kilinochchi">Kilinochchi</MenuItem>
                    <MenuItem value="Mannar">Mannar</MenuItem>
                    <MenuItem value="Vavuniya">Vavuniya</MenuItem>
                    <MenuItem value="Mullaitivu">Mullaitivu</MenuItem>
                    <MenuItem value="Batticaloa">Batticaloa</MenuItem>
                    <MenuItem value="Ampara">Ampara</MenuItem>
                    <MenuItem value="Trincomalee">Trincomalee</MenuItem>
                    <MenuItem value="Kurunegala">Kurunegala</MenuItem>
                    <MenuItem value="Puttalam">Puttalam</MenuItem>
                    <MenuItem value="Anuradhapura">Anuradhapura</MenuItem>
                    <MenuItem value="Polonnaruwa">Polonnaruwa</MenuItem>
                    <MenuItem value="Badulla">Badulla</MenuItem>
                    <MenuItem value="Moneragala">Moneragala</MenuItem>
                    <MenuItem value="Ratnapura">Ratnapura</MenuItem>
                    <MenuItem value="Kegalle">Kegalle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Delivery Options */}
          <Paper sx={{ borderRadius: '16px', p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Delivery Options
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value)}
              >
                <FormControlLabel
                  value="standard"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <LocalShippingIcon sx={{ color: '#3b82f6' }} />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Standard Delivery (2-3 days)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rs. 250.00
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="express"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <ScheduleIcon sx={{ color: '#10b981' }} />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Express Delivery (Same day)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rs. 500.00
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: '16px', p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Delivery Summary
            </Typography>
            
            <Box display="flex" alignItems="start" gap={2} sx={{ mb: 2 }}>
              <LocationOnIcon sx={{ color: '#3b82f6', mt: 0.5 }} />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Delivery Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shippingInfo.address ? (
                    `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.district}`
                  ) : (
                    'Please fill in your address'
                  )}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <PhoneIcon sx={{ color: '#10b981' }} />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Contact Number
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shippingInfo.phone || 'Please provide phone number'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>Rs. {subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Delivery</Typography>
              <Typography>Rs. {deliveryFee.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                Rs. {total.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Payment Method Step
  const PaymentMethodStep = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
        Payment Method
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: '16px', p: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                Choose Payment Method
              </FormLabel>
              <RadioGroup
                value={paymentInfo.method}
                onChange={handlePaymentChange('method')}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <CreditCardIcon sx={{ color: '#3b82f6' }} />
                      <Typography variant="body1" fontWeight="medium">
                        Credit/Debit Card
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="bank"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <AccountBalanceIcon sx={{ color: '#10b981' }} />
                      <Typography variant="body1" fontWeight="medium">
                        Bank Transfer
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="cod"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center" gap={2}>
                      <PaymentIcon sx={{ color: '#f59e0b' }} />
                      <Typography variant="body1" fontWeight="medium">
                        Cash on Delivery
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Credit Card Form */}
            {paymentInfo.method === 'card' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Card Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      value={paymentInfo.cardholderName}
                      onChange={handlePaymentChange('cardholderName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={paymentInfo.expiryDate}
                      onChange={handlePaymentChange('expiryDate')}
                      placeholder="MM/YY"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={paymentInfo.cvv}
                      onChange={handlePaymentChange('cvv')}
                      type="password"
                      required
                    />
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SecurityIcon />
                    Your payment information is secured with 256-bit SSL encryption
                  </Box>
                </Alert>
              </Box>
            )}

            {/* Bank Transfer Details */}
            {paymentInfo.method === 'bank' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Bank Transfer Details
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please transfer the total amount to the following account and upload the receipt.
                </Alert>
                <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                  <Typography variant="body1" fontWeight="bold">
                    Kaluthara Pharmacy (Pvt) Ltd
                  </Typography>
                  <Typography variant="body2">
                    Bank: Commercial Bank of Ceylon
                  </Typography>
                  <Typography variant="body2">
                    Account Number: 8001234567890
                  </Typography>
                  <Typography variant="body2">
                    Branch: Kaluthara
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Cash on Delivery */}
            {paymentInfo.method === 'cod' && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning">
                  You will pay Rs. {total.toFixed(2)} when your order is delivered.
                  Please have the exact amount ready.
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: '16px', p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Payment Summary
            </Typography>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>Rs. {subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Delivery</Typography>
              <Typography>Rs. {deliveryFee.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                Rs. {total.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Chip
                icon={
                  paymentInfo.method === 'card' ? <CreditCardIcon /> :
                  paymentInfo.method === 'bank' ? <AccountBalanceIcon /> :
                  <PaymentIcon />
                }
                label={
                  paymentInfo.method === 'card' ? 'Credit/Debit Card' :
                  paymentInfo.method === 'bank' ? 'Bank Transfer' :
                  'Cash on Delivery'
                }
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              By placing this order, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Order Confirmation Step
  const OrderConfirmationStep = () => (
    <Box textAlign="center" sx={{ py: 4 }}>
      {loading ? (
        <Box>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Processing Your Order...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we confirm your order
          </Typography>
        </Box>
      ) : orderPlaced ? (
        <Box>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: '#10b981', 
              mb: 3,
              animation: 'fadeIn 0.5s ease-in'
            }} 
          />
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#1e3a8a' }}>
            Order Placed Successfully!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Order Number: <strong>{orderNumber}</strong>
          </Typography>
          
          <Paper sx={{ 
            borderRadius: '16px', 
            p: 4, 
            mb: 3, 
            backgroundColor: '#f0f9ff',
            border: '2px solid #3b82f6'
          }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Thank you for your order! We'll send you a confirmation email shortly.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your order will be delivered to:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {shippingInfo.firstName} {shippingInfo.lastName}
            </Typography>
            <Typography variant="body2">
              {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.district}
            </Typography>
          </Paper>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<ReceiptIcon />}
              sx={{
                borderRadius: '12px',
                px: 4,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
              }}
            >
              View Order Details
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<LocalPharmacyIcon />}
              sx={{ borderRadius: '12px', px: 4 }}
              onClick={onBack}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1e3a8a' }}>
            Confirm Your Order
          </Typography>
          
          <Paper sx={{ borderRadius: '16px', p: 3, mb: 3, textAlign: 'left' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            
            <List>
              {cart.map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={item.images ? item.images[0] : ''}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`Qty: ${item.quantity} × Rs. ${item.price.toFixed(2)}`}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography>Rs. {subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Delivery</Typography>
              <Typography>Rs. {deliveryFee.toFixed(2)}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
                Rs. {total.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CartReviewStep />;
      case 1:
        return <ShippingDetailsStep />;
      case 2:
        return <PaymentMethodStep />;
      case 3:
        return <OrderConfirmationStep />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={2}>
            <LocalPharmacyIcon sx={{ color: '#1e3a8a', fontSize: 28 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e3a8a' }}>
              Secure Checkout
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Paper sx={{ borderRadius: '16px', p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        {getStepContent(activeStep)}

        {/* Navigation Buttons */}
        {!orderPlaced && (
          <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              size="large"
              sx={{ borderRadius: '12px', px: 4 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size="large"
              sx={{
                borderRadius: '12px',
                px: 4,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Place Order'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProfessionalCheckout;
