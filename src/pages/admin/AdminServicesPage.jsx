import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, CircularProgress,
  Snackbar, Alert, Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60 // default 60 minutes
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value
    }));
  };

  // Open dialog for adding/editing service
  const handleOpenDialog = (service = null) => {
    if (service) {
      setCurrentService(service._id);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration || 60
      });
    } else {
      setCurrentService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 60
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentService(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (currentService) {
        // Update existing service
        await axios.patch(
          `${API_URL}/services/${currentService}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Service updated successfully');
      } else {
        // Create new service
        await axios.post(
          `${API_URL}/services`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Service created successfully');
      }
      
      handleCloseDialog();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete service
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Service deleted successfully');
        fetchServices();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete service');
      }
    }
  };

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manage Services</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Service
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price (LKR)</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length > 0 ? (
                  services.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description || '-'}</TableCell>
                      <TableCell>{service.price.toFixed(2)}</TableCell>
                      <TableCell>{service.duration || 60}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenDialog(service)}>
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(service._id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No services found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add/Edit Service Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>{currentService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  name="name"
                  label="Service Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="price"
                    label="Price (LKR)"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    name="duration"
                    label="Duration (minutes)"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 15, step: 15 }}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {currentService ? 'Update' : 'Create'} Service
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminServicesPage;
