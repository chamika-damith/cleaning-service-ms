import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  Stack,
  Container
} from '@mui/material';
import {
  CleaningServices as CleaningServicesIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, serviceAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesCount, setServicesCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const bookingsResponse = await bookingAPI.getMyBookings();
        const now = new Date();
        const upcoming = bookingsResponse.data.data.bookings
          .filter(booking => new Date(booking.dateTime) > now)
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
          .slice(0, 3);
        setUpcomingBookings(upcoming);
        const servicesResponse = await serviceAPI.getServices();
        setServicesCount(servicesResponse.data.data.services.length);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Get initials for avatar
  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)', py: 6 }}>
      <Container maxWidth="xl">
        {/* Greeting Card */}
        <Box mb={4}>
          <Card elevation={8} sx={{
            p: 0,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            backdropFilter: 'blur(8px)',
            mb: 4
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 4 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 36 }}>
                {user ? getInitials(user.username || user.name, user.email) : <PersonIcon fontSize="large" />}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Welcome back, {user?.username || user?.name || 'User'}!
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Here's what's happening with your cleaning services.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {error && (
          <Box mb={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          </Box>
        )}

        {/* Stats Cards */}
        <Grid container spacing={4} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={4} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 6 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                    <CleaningServicesIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Available Services
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {servicesCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  professional cleaning services
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/services')}
                  sx={{ mt: 1, p: 0 }}
                >
                  View Services
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={4} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 6 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CalendarIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Upcoming Bookings
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {upcomingBookings.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  scheduled cleanings
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/bookings')}
                  sx={{ mt: 1, p: 0 }}
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={4} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 6, height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box flexGrow={1}>
                  <Typography variant="h6" component="div" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Manage your cleaning services with ease.
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/bookings/new')}
                    sx={{ mb: 1 }}
                  >
                    New Booking
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate('/services')}
                  >
                    Browse Services
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upcoming Bookings & Recent Activity */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 6 }}>
              <CardHeader
                title="Upcoming Bookings"
                action={
                  <Button 
                    color="primary" 
                    size="small" 
                    onClick={() => navigate('/bookings')}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              {upcomingBookings.length > 0 ? (
                <List>
                  {upcomingBookings.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <ListItem 
                        button 
                        onClick={() => navigate(`/bookings/${booking._id}`)}
                      >
                        <ListItemIcon>
                          <CalendarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={new Date(booking.dateTime).toLocaleString()}
                          secondary={`${booking.service?.name} at ${booking.address}`}
                          primaryTypographyProps={{
                            fontWeight: 'medium',
                          }}
                        />
                        <Box>
                          <Typography 
                            variant="caption"
                            sx={{
                              bgcolor: theme.palette.grey[200],
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              textTransform: 'capitalize',
                            }}
                          >
                            {booking.status}
                          </Typography>
                        </Box>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box p={3} textAlign="center">
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No upcoming bookings
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/bookings/new')}
                  >
                    Book a Service
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 6 }}>
              <CardHeader title="Recent Activity" />
              <Divider />
              <Box p={2}>
                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                  Your recent activities will appear here
                </Typography>
                {/* Activity timeline would go here */}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
