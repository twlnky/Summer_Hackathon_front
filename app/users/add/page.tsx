'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import UserForm from '../../components/forms/UserForm';
import { User } from '../../types';

const AddUserPage: React.FC = () => {
  const router = useRouter();

  const handleUserSave = (savedUser: User) => {
    // Перенаправляем на страницу пользователя после создания
    router.push(`/users/${savedUser.id}`);
  };

  const handleCancel = () => {
    // Возвращаемся к списку пользователей
    router.push('/users');
  };

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
            Назад к списку пользователей
          </Button>
        </Box>

        {/* Форма добавления пользователя */}
        <UserForm
          onSave={handleUserSave}
          onCancel={handleCancel}
        />
      </Container>
    </Box>
  );
};

export default AddUserPage;
