import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, TextField, Button, Typography, Alert, Box, Link } from '@mui/material';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        setMessage("¡Usuario creado! Revisa tu correo (o inicia sesión si desactivaste la confirmación).");
        setFormData({ email: '', password: '' });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Paper elevation={3} style={{ padding: '30px', width: '100%', borderRadius: '10px' }}>
        <Typography variant="h5" align="center" gutterBottom style={{ color: '#1976d2', fontWeight: 'bold' }}>
          Crear Cuenta
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box mb={2}>
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              type="email" 
              // IMPORTANTE: El value conecta el input con la limpieza del estado
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
              // IMPORTANTE: El value conecta el input con la limpieza del estado
              value={formData.password}
              onChange={handleChange} 
              required 
              disabled={isLoading} 
            />
          </Box>

          <Button type="submit" fullWidth variant="contained" color="success" size="large" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              ¿Ya tienes cuenta?{' '}
              <Link component="button" variant="body2" onClick={onSwitchToLogin}>
                Inicia sesión aquí
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;