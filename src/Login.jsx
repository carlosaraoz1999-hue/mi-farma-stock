import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, TextField, Button, Typography, Alert, Box } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrorMessage("Email o contraseña incorrectos");
        console.error('Error login:', error.message);
      } else if (data.user) {
        // El login fue exitoso, App.jsx detectará el cambio automáticamente
        console.log('Login correcto');
      }

    } catch (error) {
      setErrorMessage('Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container centra todo vertical y horizontalmente
    <Container maxWidth="xs" style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f5f5f5' // Un fondo gris suave
    }}>
      
      <Paper elevation={3} style={{ padding: '30px', width: '100%', borderRadius: '10px' }}>
        
        <Typography variant="h4" align="center" gutterBottom style={{ color: '#1976d2', fontWeight: 'bold' }}>
          Mi Farma
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="textSecondary" style={{ marginBottom: '20px' }}>
          Iniciar Sesión
        </Typography>

        <form onSubmit={handleSubmit}>
          
          {/* Mensaje de error (Alerta roja) */}
          {errorMessage && (
            <Alert severity="error" style={{ marginBottom: '20px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box mb={2}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Box>

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Ingresar'}
          </Button>

        </form>
      </Paper>
    </Container>
  );
};

export default Login;