import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  InputAdornment,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, serviceAPI } from '../services/api';

const validationSchema = Yup.object({
  service: Yup.string().required('Service is required'),
  date: Yup.date()
    .required('Date is required')
    .min(addDays(new Date(), 0), 'Date cannot be in the past'),
  time: Yup.string().required('Time is required'),
  address: Yup.string().required('Address is required'),
  specialInstructions: Yup.string(),
});

const steps = ['Select Service', 'Choose Date & Time', 'Confirm Details'];

const NewBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Define handleSubmit before using it in useFormik
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      const selectedServiceData = services.find(s => s._id === values.service);
      if (!selectedServiceData) {
        throw new Error('Selected service not found');
      }

      // Format the date and time for the backend
      const bookingDateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const bookingData = {
        serviceId: values.service,
        dateTime: bookingDateTime.toISOString(),
        address: values.address,
        specialInstructions: values.specialInstructions || undefined,
        customerName: user?.username || 'Guest',
      };

      const response = await bookingAPI.createBooking(bookingData);
      
      if (response.data && response.data.status === 'success') {
        setSuccess(true);
        setActiveStep((prevStep) => prevStep + 1);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to create booking. Please try again.';
      setError(errorMessage);
      
      if (activeStep === steps.length - 1) {
        setActiveStep(prevStep => Math.max(0, prevStep - 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      service: '',
      date: addDays(new Date(), 1),
      time: '',
      address: user?.address || '',
      specialInstructions: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getServices();
        setServices(response.data.data.services);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Generate time slots when service is selected
  useEffect(() => {
    if (formik.values.service && formik.values.date) {
      generateTimeSlots();
    }
  }, [formik.values.service, formik.values.date]);

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18;  // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour}:00 - ${hour + 1}:00`,
      });
    }
    
    setAvailableTimeSlots(slots);
  };

  const handleNext = async () => {
    // Clear previous errors
    setError('');
    
    // Validate current step before proceeding
    let errors = {};
    
    if (activeStep === 0) {
      if (!formik.values.service) {
        errors.service = 'Please select a service';
        formik.setFieldTouched('service', true);
      }
    } else if (activeStep === 1) {
      // Validate date
      if (!formik.values.date || !isValid(new Date(formik.values.date))) {
        errors.date = 'Please select a valid date';
        formik.setFieldTouched('date', true);
      } else if (new Date(formik.values.date) < new Date().setHours(0, 0, 0, 0)) {
        errors.date = 'Date cannot be in the past';
        formik.setFieldTouched('date', true);
      }
      
      // Validate time
      if (!formik.values.time) {
        errors.time = 'Please select a time';
        formik.setFieldTouched('time', true);
      }
      
      // Validate address
      if (!formik.values.address || formik.values.address.trim() === '') {
        errors.address = 'Address is required';
        formik.setFieldTouched('address', true);
      }
    }

    // Set errors and return if validation fails
    if (Object.keys(errors).length > 0) {
      formik.setErrors(errors);
      return;
    }
    
    // If we're on the service selection step, update the selected service
    if (activeStep === 0) {
      const service = services.find(s => s._id === formik.values.service);
      if (!service) {
        setError('Selected service not found');
        return;
      }
      setSelectedService(service);
    }
    
    // If we're on the final step, submit the form
    if (activeStep === steps.length - 1) {
      await formik.submitForm();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  const handleReset = () => {
    formik.resetForm();
    setActiveStep(0);
    setSelectedService(null);
    setSuccess(false);
    setError('');
  };

  const handleCreateAnother = () => {
    handleReset();
    navigate('/bookings/new');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  if (loading && !selectedService) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          New Booking
        </Typography>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {error && (
        <Box mb={3}>
          <Alert 
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError('')}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {success ? (
        <Card elevation={3}>
          <CardContent>
            <Box textAlign="center" py={4}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Your {selectedService?.name} service has been scheduled for{' '}
                {formik.values.date && format(new Date(formik.values.date), 'EEEE, MMMM d, yyyy')} at {formik.values.time}.
              </Typography>
              <Box mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleViewBookings}
                  sx={{ mr: 2 }}
                >
                  View My Bookings
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCreateAnother}
                >
                  Create Another Booking
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Card elevation={3}>
            <CardHeader 
              title={steps[activeStep]} 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              {/* Step 1: Select Service */}
              <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={formik.touched.service && Boolean(formik.errors.service)}
                >
                  <InputLabel id="service-label">Select a Service</InputLabel>
                  <Select
                    labelId="service-label"
                    id="service"
                    name="service"
                    value={formik.values.service}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Select a Service"
                  >
                    {services.map((service) => (
                      <MenuItem key={service._id} value={service._id}>
                        {service.name} - ${service.price} ({service.duration} min)
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.service && formik.errors.service && (
                    <FormHelperText>{formik.errors.service}</FormHelperText>
                  )}
                </FormControl>

                {selectedService && (
                  <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedService.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {selectedService.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {selectedService.duration} minutes
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Price:</strong> ${selectedService.price}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* Step 2: Date & Time */}
              <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Select Date"
                        value={formik.values.date}
                        onChange={(date) => {
                          formik.setFieldValue('date', date);
                          formik.setFieldTouched('date', true);
                        }}
                        minDate={new Date()}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            margin="normal"
                            error={formik.touched.date && Boolean(formik.errors.date)}
                            helperText={formik.touched.date && formik.errors.date}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={formik.touched.time && Boolean(formik.errors.time)}
                      >
                        <InputLabel id="time-slot-label">Select Time Slot</InputLabel>
                        <Select
                          labelId="time-slot-label"
                          id="time"
                          name="time"
                          value={formik.values.time}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Select Time Slot"
                        >
                          {availableTimeSlots.map((slot) => (
                            <MenuItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.time && formik.errors.time && (
                          <FormHelperText>{formik.errors.time}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  margin="normal"
                  variant="outlined"
                  required
                />
              </Box>

              {/* Step 3: Confirm Details */}
              <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                <Typography variant="h6" gutterBottom>
                  Review Your Booking
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Service</Typography>
                      <Typography variant="body1">{selectedService?.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedService?.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
                      <Typography variant="body1">
                        {formik.values.date && format(new Date(formik.values.date), 'EEEE, MMMM d, yyyy')}
                      </Typography>
                      <Typography variant="body1">
                        {formik.values.time}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                      <Typography variant="body1">{formik.values.address}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Special Instructions</Typography>
                      <Typography variant="body1">
                        {formik.values.specialInstructions || 'None'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                      <Typography variant="body1">{selectedService?.duration} minutes</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Total</Typography>
                      <Typography variant="h6">${selectedService?.price}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <TextField
                  fullWidth
                  id="specialInstructions"
                  name="specialInstructions"
                  label="Special Instructions (Optional)"
                  multiline
                  rows={3}
                  value={formik.values.specialInstructions}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  margin="normal"
                  variant="outlined"
                />
              </Box>
            </CardContent>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        </form>
      )}
    </Box>
  );
};

export default NewBookingPage;