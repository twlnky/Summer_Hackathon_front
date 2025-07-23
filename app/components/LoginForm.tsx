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
import { AuthData } from '../types';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<AuthData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при авторизации');
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
             Телефонный справочник ИУЦТ
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
            Главная
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
              Авторизация
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Логин
            </Typography>
            <TextField
              fullWidth
              required
              name="username"
              placeholder="Введите ваш логин"
              value={formData.username}
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
              placeholder="Введите ваш пароль"
              type="password"
              value={formData.password}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ВОЙТИ'}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                Нет аккаунта?{' '}
                <Link href="/register" passHref>
                  <MuiLink component="span" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
                    Зарегистрироваться
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

export default LoginForm; 