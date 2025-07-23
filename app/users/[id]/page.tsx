'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  Business,
  Person,
  Edit,
  Delete,
} from '@mui/icons-material';
import { User } from '../../types';
import UserService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const UserDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const userId = typeof params.id === 'string' ? parseInt(params.id) : null;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('Неверный ID пользователя');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedUser = await UserService.getUserById(userId);
        setUserData(fetchedUser);
      } catch (err: any) {
        console.error('Ошибка при загрузке пользователя:', err);
        setError(err.response?.data?.message || 'Ошибка при загрузке данных пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleGoBack = () => {
    router.push('/?tab=users');
  };

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userId) return;

    try {
      setDeleteLoading(true);
      await UserService.deleteUser(userId);
      
      setSnackbar({
        open: true,
        message: 'Пользователь успешно удален',
        severity: 'success'
      });
      
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка при удалении пользователя',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const canManageUsers = isAuthenticated && currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR');

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !userData) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Пользователь не найден'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={handleGoBack}>
            Вернуться назад
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Навигация */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={handleGoBack}
            sx={{ color: 'text.secondary' }}
          >
            Назад к списку
          </Button>
          {canManageUsers && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={handleEdit} 
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  }
                }}
              >
                <Edit />
              </IconButton>
              <IconButton 
                onClick={handleDelete} 
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Основная карточка пользователя */}
        <Card 
          sx={{ 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Заголовок карточки */}
          <Box sx={{ 
            p: 4,
            background: '#2C3E50',
            color: 'white',
            borderRadius: '16px 16px 0 0',
          }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar sx={{ 
                width: 80, 
                height: 80,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '2rem',
                fontWeight: 700,
              }}>
                {`${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {[userData.lastName, userData.firstName, userData.middleName].filter(Boolean).join(' ')}
                </Typography>
                {userData.position && (
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {userData.position}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Контент карточки */}
          <CardContent sx={{ p: 4 }}>
            {/* Контактная информация */}
            <Card sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Email />
                  Контактная информация
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email */}
                  <Box sx={{ 
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(37, 99, 235, 0.05)',
                    border: '1px solid rgba(37, 99, 235, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(37, 99, 235, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Email sx={{ color: '#2563eb', fontSize: 28 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                          Электронная почта
                        </Typography>
                        <Typography 
                          variant="h6"
                          component="a"
                          href={`mailto:${userData.email}`}
                          sx={{ 
                            display: 'block',
                            textDecoration: 'none',
                            color: '#2563eb',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {userData.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Личный телефон */}
                  {userData.personalPhone && (
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 2,
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(16, 185, 129, 0.1)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Phone sx={{ color: '#10b981', fontSize: 28 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            Личный телефон
                          </Typography>
                          <Typography 
                            variant="h6"
                            component="a"
                            href={`tel:${userData.personalPhone}`}
                            sx={{ 
                              display: 'block',
                              textDecoration: 'none',
                              color: '#10b981',
                              fontWeight: 600,
                              '&:hover': {
                                textDecoration: 'underline',
                              }
                            }}
                          >
                            {userData.personalPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Номер офиса */}
                  {userData.officeNumber && (
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 2,
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(245, 158, 11, 0.1)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Business sx={{ color: '#f59e0b', fontSize: 28 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            Номер офиса
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#f59e0b' }}>
                            {userData.officeNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Дополнительная информация */}
            {userData.note && (
              <Card sx={{ 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Person />
                    Дополнительная информация
                  </Typography>
                  
                  <Box sx={{ 
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(107, 114, 128, 0.05)',
                    border: '1px solid rgba(107, 114, 128, 0.1)',
                  }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                      {userData.note}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя{' '}
            <strong>
              {userData && 
                [userData.lastName, userData.firstName, userData.middleName]
                  .filter(Boolean).join(' ')
              }
            </strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleteLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDetailPage;
