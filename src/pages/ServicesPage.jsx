import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  Collapse,
  Alert,
  Snackbar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Star as StarIcon,
  CleaningServices as CleaningServicesIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { serviceAPI } from '../services/api';

const ServicesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching services...');
        
        const response = await serviceAPI.getServices();
        console.log('Full API response:', response);
        
        // More flexible data extraction - try different possible response structures
        let servicesData = [];
        
        if (response?.data?.data?.services && Array.isArray(response.data.data.services)) {
          servicesData = response.data.data.services;
          console.log('Found services in response.data.data.services:', servicesData);
        } else if (response?.data?.services && Array.isArray(response.data.services)) {
          servicesData = response.data.services;
          console.log('Found services in response.data.services:', servicesData);
        } else if (response?.data && Array.isArray(response.data)) {
          servicesData = response.data;
          console.log('Found services in response.data:', servicesData);
        } else if (response?.services && Array.isArray(response.services)) {
          servicesData = response.services;
          console.log('Found services in response.services:', servicesData);
        } else if (Array.isArray(response)) {
          servicesData = response;
          console.log('Found services in response:', servicesData);
        } else {
          console.error('Unexpected API response format:', response);
          console.log('Available keys in response:', Object.keys(response || {}));
          if (response?.data) {
            console.log('Available keys in response.data:', Object.keys(response.data || {}));
          }
          setError('Unable to parse services data. Check console for details.');
          return;
        }

        console.log('Extracted services data:', servicesData);
        console.log('Number of services:', servicesData.length);
        
        // Validate service objects
        if (servicesData.length > 0) {
          console.log('First service structure:', servicesData[0]);
          console.log('Service properties:', Object.keys(servicesData[0] || {}));
        }

        setServices(servicesData);
        setFilteredServices(servicesData);
        
      } catch (err) {
        console.error('Error fetching services:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load services. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search term, price range, and category
  useEffect(() => {
    console.log('Filtering services...', {
      totalServices: services.length,
      searchTerm,
      priceRange,
      selectedCategory
    });

    let result = [...services];

    // Filter by search term
    if (searchTerm) {
      const beforeSearch = result.length;
      result = result.filter(
        (service) =>
          service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`Search filter: ${beforeSearch} -> ${result.length} services`);
    }

    // Filter by price range
    const beforePrice = result.length;
    result = result.filter(
      (service) => {
        const price = Number(service.price) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      }
    );
    console.log(`Price filter: ${beforePrice} -> ${result.length} services`);

    // Filter by category
    if (selectedCategory !== 'all') {
      const beforeCategory = result.length;
      result = result.filter((service) => service.category === selectedCategory);
      console.log(`Category filter: ${beforeCategory} -> ${result.length} services`);
    }

    console.log('Final filtered services:', result.length);
    setFilteredServices(result);
  }, [searchTerm, priceRange, selectedCategory, services]);

  const handleBookNow = (serviceId) => {
    console.log('Booking service:', serviceId);
    navigate(`/bookings/new?service=${serviceId}`);
  };

  const handleClearFilters = () => {
    console.log('Clearing filters');
    setSearchTerm('');
    setPriceRange([0, 500]);
    setSelectedCategory('all');
  };

  // Extract unique categories from services
  const categories = ['all', ...new Set(services.map((service) => service.category || 'Uncategorized'))];
  console.log('Available categories:', categories);

  // Debug render info
  console.log('Render state:', {
    loading,
    error,
    servicesCount: services.length,
    filteredServicesCount: filteredServices.length,
    searchTerm,
    selectedCategory,
    priceRange
  });

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading services...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Cleaning Services
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Professional cleaning services tailored to your needs
        </Typography>
      </Box>

      {error && (
        <Box mb={3}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Table View for All Services */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length > 0 ? (
                services.map((service, index) => (
                  <TableRow key={service._id || service.id || index}>
                    <TableCell>{service.name || 'Unnamed Service'}</TableCell>
                    <TableCell>{service.description || 'No description'}</TableCell>
                    <TableCell>${service.price || 0}</TableCell>
                    <TableCell>{service.duration || 0} min</TableCell>
                    <TableCell>{service.category || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleBookNow(service._id || service.id)}
                      >
                        Book
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No services found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ServicesPage;