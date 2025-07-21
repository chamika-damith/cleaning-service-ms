import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField, Typography, CircularProgress, MenuItem, FormControl, InputLabel, Select, FormHelperText, Alert, IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isValid } from 'date-fns';
import { bookingAPI, serviceAPI } from '../services/api';
import { ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';

const validationSchema = Yup.object({
  service: Yup.string().required('Service is required'),
  date: Yup.date().required('Date is required').min(addDays(new Date(), 0), 'Date cannot be in the past'),
  time: Yup.string().required('Time is required'),
  address: Yup.string().required('Address is required'),
  specialInstructions: Yup.string(),
});

const EditBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const formik = useFormik({
    initialValues: {
      service: '',
      date: '',
      time: '',
      address: '',
      specialInstructions: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        const bookingDateTime = new Date(values.date);
        const [hours, minutes] = values.time.split(':').map(Number);
        bookingDateTime.setHours(hours, minutes, 0, 0);
        const bookingData = {
          serviceId: values.service,
          dateTime: bookingDateTime.toISOString(),
          address: values.address,
          specialInstructions: values.specialInstructions || undefined,
        };
        const response = await bookingAPI.updateBooking(id, bookingData);
        if (response.data && response.data.status === 'success') {
          setSuccess(true);
        } else {
          throw new Error('Unexpected response from server');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to update booking. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, bookingRes] = await Promise.all([
          serviceAPI.getServices(),
          bookingAPI.getBooking(id),
        ]);
        setServices(servicesRes.data.data.services);
        const booking = bookingRes.data.data.booking;
        const dateObj = new Date(booking.dateTime);
        formik.setValues({
          service: booking.service?._id || booking.service,
          date: dateObj,
          time: `${dateObj.getHours().toString().padStart(2, '0')}:00`,
          address: booking.address,
          specialInstructions: booking.specialInstructions || '',
        });
      } catch (err) {
        setError('Failed to load booking or services.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (formik.values.service && formik.values.date) {
      const slots = [];
      const startHour = 8;
      const endHour = 18;
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          value: `${hour.toString().padStart(2, '0')}:00`,
          label: `${hour}:00 - ${hour + 1}:00`,
        });
      }
      setAvailableTimeSlots(slots);
    }
  }, [formik.values.service, formik.values.date]);

  if (loading) {
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
          Edit Booking
        </Typography>
      </Box>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardHeader title="Edit Booking Details" titleTypographyProps={{ variant: 'h6' }} />
        <Divider />
        <CardContent>
          {error && (
            <Box mb={3}>
              <Alert severity="error" action={
                <IconButton aria-label="close" color="inherit" size="small" onClick={() => setError('')}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }>{error}</Alert>
            </Box>
          )}
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Booking updated successfully!
            </Alert>
          ) : null}
          <form onSubmit={formik.handleSubmit}>
            <FormControl fullWidth margin="normal" error={formik.touched.service && Boolean(formik.errors.service)}>
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
                  <FormControl fullWidth margin="normal" error={formik.touched.time && Boolean(formik.errors.time)}>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Booking'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditBookingPage; 