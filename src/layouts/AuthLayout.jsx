import React from 'react';
import { Box, Container, CssBaseline, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const AuthLayout = ({ children }) => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledPaper elevation={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Cleaning Service
          </Typography>
          
          {children}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {window.location.pathname === '/login' ? (
              <Typography variant="body2">
                Don't have an account?{' '}
                <StyledLink to="/signup">
                  Sign up
                </StyledLink>
              </Typography>
            ) : (
              <Typography variant="body2">
                Already have an account?{' '}
                <StyledLink to="/login">
                  Sign in
                </StyledLink>
              </Typography>
            )}
          </Box>
        </Box>
      </StyledPaper>
      
      <Box mt={5} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Cleaning Service. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthLayout;
