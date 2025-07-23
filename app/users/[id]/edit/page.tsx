'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import UserForm from '../../../components/forms/UserForm';
import UserService from '../../../services/userService';
import { User } from '../../../types';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

const EditUserPage: React.FC<EditUserPageProps> = ({ params }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = parseInt(params.id);
        if (isNaN(userId)) {
          setError('Неверный ID пользователя');
          return;
        }

        const userData = await UserService.getUserById(userId);
        setUser(userData);
      } catch (err: any) {
        console.error('Ошибка при загрузке пользователя:', err);
        setError(err.response?.data?.message || err.message || 'Ошибка при загрузке пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleUserSave = (savedUser: User) => {
    // Перенаправляем на страницу пользователя после редактирования
    router.push(`/users/${savedUser.id}`);
  };

  const handleCancel = () => {
    // Возвращаемся к странице пользователя
    router.push(`/users/${params.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        py: 4,
      }}>
        <Container maxWidth="md">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/users')}
            sx={{
              mb: 2,
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
              }
            }}
          >
            Назад к списку пользователей
          </Button>
          
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
            }}
          >
            {error || 'Пользователь не найден'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4,
    }}>
      <Container maxWidth="md">
        {/* Заголовок с кнопкой "Назад" */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{
              mb: 2,
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
              }
            }}
          >
            Назад к пользователю
          </Button>
        </Box>

        {/* Форма редактирования пользователя */}
        <UserForm
          user={user}
          onSave={handleUserSave}
          onCancel={handleCancel}
        />
      </Container>
    </Box>
  );
};

export default EditUserPage;
