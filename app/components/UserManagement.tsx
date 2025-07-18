'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Fab,
} from '@mui/material';
import {
  Person,
  Edit,
  Delete,
  Add,
  Email,
  Phone,
  Business,
} from '@mui/icons-material';
import { User, PageResult } from '../types';
import UserService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<PageResult<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { isAuthenticated } = useAuth();

  const fetchUsers = async (currentPage: number = 1) => {
    setLoading(true);
    setError('');

    try {
      // Если есть поисковый запрос, загружаем больше данных для клиентской фильтрации
      const pageSize = clientSearchQuery ? 100 : 10;
      const targetPage = clientSearchQuery ? 0 : currentPage - 1;
      
      const response = await UserService.getUsers({}, {
        page: targetPage,
        size: pageSize,
      });
      setUsers(response);
    } catch (err: any) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // Сброс страницы при изменении поискового запроса и перезагрузка данных
  useEffect(() => {
    if (clientSearchQuery) {
      setPage(1);
      fetchUsers(1);
    } else {
      // Когда поиск очищается, возвращаемся к обычной пагинации
      fetchUsers(page);
    }
  }, [clientSearchQuery]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOpenDialog = (user?: User) => {
    setSelectedUser(user || null);
    setFormData(user || {
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      position: '',
      personalPhone: '',
      officeNumber: 0,
      note: '',
      moderatorId: null, // Изменено с 1 на null
      departmentsIds: [],
    });
    setIsEditing(!!user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({});
    setIsEditing(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing && selectedUser) {
        await UserService.updateUser(selectedUser.id, formData);
      } else {
        await UserService.createUser(formData as Omit<User, 'id'>);
      }
      handleCloseDialog();
      fetchUsers(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении пользователя');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await UserService.deleteUser(id);
        fetchUsers(page);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при удалении пользователя');
      }
    }
  };

  // Клиентская фильтрация пользователей
  const filteredUsers = users?.queryResult.filter(user => {
    if (!clientSearchQuery) return true;
    const query = clientSearchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.middleName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.position?.toLowerCase().includes(query)
    );
  }) || [];

  const renderUser = (user: User) => (
    <Card key={user.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ mt: 0.5 }}>
            <Person />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {`${user.firstName || ''} ${user.lastName || ''} ${user.middleName || ''}`.trim()}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Email fontSize="small" color="action" />
              <Typography 
                variant="body2"
                component="a"
                href={`mailto:${user.email}`}
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    color: 'primary.main',
                    cursor: 'pointer'
                  }
                }}
              >
                {user.email}
              </Typography>
            </Box>
            
            {user.position && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Business fontSize="small" color="action" />
                <Typography variant="body2">{user.position}</Typography>
              </Box>
            )}
            
            {user.personalPhone && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Phone fontSize="small" color="action" />
                <Typography 
                  variant="body2"
                  component="a"
                  href={`tel:${user.personalPhone}`}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      color: 'primary.main',
                      cursor: 'pointer'
                    }
                  }}
                >
                  {user.personalPhone}
                </Typography>
              </Box>
            )}
            
            {user.officeNumber && (
              <Box mt={1}>
                <Chip
                  label={`Офис: ${user.officeNumber}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>
          
          {isAuthenticated && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => handleOpenDialog(user)}
                sx={{ color: 'primary.main' }}
              >
                <Edit />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleDelete(user.id)} 
                sx={{ color: 'error.main' }}
              >
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управление пользователями
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Добавить пользователя
          </Button>
        )}
      </Box>

      {/* Уведомление для неавторизованных пользователей */}
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Вы просматриваете список пользователей в режиме только для чтения. 
            Войдите в систему для управления пользователями.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Поиск в реальном времени */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Быстрый поиск
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по имени, фамилии, отчеству, email или должности..."
            value={clientSearchQuery}
            onChange={(e) => setClientSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ color: 'action.active' }} />
                </Box>
              )
            }}
          />
          {clientSearchQuery && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Найдено результатов: {filteredUsers.length}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Список пользователей */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {clientSearchQuery 
                ? `Не найдено пользователей по запросу "${clientSearchQuery}"` 
                : 'Пользователи не найдены'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredUsers.map((user) => renderUser(user))}
        </Box>
      )}

      {/* Пагинация - скрываем при поиске */}
      {users && users.pageCount > 1 && !clientSearchQuery && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={users.pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Редактировать пользователя' : 'Создать пользователя'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 1
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  required
                  name="firstName"
                  label="Имя"
                  value={formData.firstName || ''}
                  onChange={handleFormChange}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  required
                  name="lastName"
                  label="Фамилия"
                  value={formData.lastName || ''}
                  onChange={handleFormChange}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  name="middleName"
                  label="Отчество"
                  value={formData.middleName || ''}
                  onChange={handleFormChange}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  required
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleFormChange}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  name="position"
                  label="Должность"
                  value={formData.position || ''}
                  onChange={handleFormChange}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                <TextField
                  fullWidth
                  name="personalPhone"
                  label="Личный телефон"
                  value={formData.personalPhone || ''}
                  onChange={handleFormChange}
                />
              </Box>
            </Box>
            <Box>
              <TextField
                fullWidth
                name="officeNumber"
                label="Номер офиса"
                type="number"
                value={formData.officeNumber || ''}
                onChange={handleFormChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                name="note"
                label="Примечание"
                multiline
                rows={3}
                value={formData.note || ''}
                onChange={handleFormChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;