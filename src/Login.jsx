import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null); // Limpiamos errores previos

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrorMessage(error.message);
        console.error('Error login:', error.message);
        return;
      }

      if (data.user) {
        console.log('Usuario logueado:', data.user);
        alert('¡Bienvenido! Login exitoso.');
      }

    } catch (error) {
      setErrorMessage('Ocurrió un error inesperado.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        
        {/* Mensaje de error visual */}
        {errorMessage && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {errorMessage}
          </div>
        )}

        <div>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;