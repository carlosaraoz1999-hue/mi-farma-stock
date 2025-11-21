import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Container, Paper, TextField, Button, Typography, Alert, Box, Link } from '@mui/material';

// Recibimos la función para cambiar de pantalla
const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setErrorMessage("Credenciales incorrectas");
      } 
    } catch (error) {
      setErrorMessage('Error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Paper elevation={3} style={{ padding: '30px', width: '100%', borderRadius: '10px' }}>
        <Typography variant="h4" align="center" gutterBottom style={{ color: '#1976d2', fontWeight: 'bold' }}>Login</Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" mb={3}>Iniciar Sesión</Typography>

        <form onSubmit={handleSubmit}>
          {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

          <Box mb={2}>
            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
          </Box>
          <Box mb={3}>
            <TextField fullWidth label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
          </Box>

          <Button type="submit" fullWidth variant="contained" color="primary" size="large" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Ingresar'}
          </Button>

          {/* Enlace para ir al Registro */}
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              ¿No tienes cuenta?{' '}
              <Link component="button" variant="body2" onClick={onSwitchToRegister}>
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;