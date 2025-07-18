'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';
import Link from 'next/link';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#2C3E50',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="m0 40 40-40h-40v40zm40 0v-40h-40l40 40z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
            🏛️ ИУЦТ
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button
            color="inherit"
            sx={{
              borderRadius: 20,
              px: 3,
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
            onClick={() => window.location.href = '/'}
          >
            🏠 Главная
          </Button>
        </Box>
      </Box>

      <Card 
        sx={{ 
          maxWidth: 500, 
          width: '100%', 
          mx: 2,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'visible',
          position: 'relative',
          zIndex: 2
        }}
      >
        <CardContent sx={{ p: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 2
              }}
            >
              Регистрация
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Имя пользователя
            </Typography>
            <TextField
              fullWidth
              required
              name="username"
              placeholder="Введите имя пользователя"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              inputProps={{ minLength: 3, maxLength: 20 }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  }
                }
              }}
            />
            
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Email
            </Typography>
            <TextField
              fullWidth
              required
              name="email"
              placeholder="Введите ваш email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  }
                }
              }}
            />
            
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Пароль
            </Typography>
            <TextField
              fullWidth
              required
              name="password"
              placeholder="Введите пароль"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              inputProps={{ minLength: 6 }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  }
                }
              }}
            />
            
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Подтвердите пароль
            </Typography>
            <TextField
              fullWidth
              required
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  }
                }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 2,
                borderRadius: 3,
                background: '#2C3E50',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                boxShadow: '0 8px 32px rgba(44, 62, 80, 0.3)',
                '&:hover': {
                  background: '#34495e',
                  boxShadow: '0 12px 40px rgba(44, 62, 80, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.1)',
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                Уже есть аккаунт?{' '}
                <Link href="/login" passHref>
                  <MuiLink component="span" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
                    Войти
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterForm; 