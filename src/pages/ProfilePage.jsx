import React from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Avatar, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, boxShadow: 8, mt: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2, fontSize: 36 }}>
              {user ? getInitials(user.username || user.name, user.email) : <PersonIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {user?.username || user?.name || 'User'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {user?.email || '-'}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 110 }}>
                <strong>Username:</strong>
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.username || '-'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 110 }}>
                <strong>Email:</strong>
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.email || '-'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 110 }}>
                <strong>Role:</strong>
              </Typography>
              <Typography variant="body1" fontWeight={500} textTransform="capitalize">
                {user?.role || '-'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 110 }}>
                <strong>Created At:</strong>
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(user?.createdAt)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" color="text.secondary" sx={{ minWidth: 110 }}>
                <strong>Address:</strong>
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.address || '-'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfilePage;
