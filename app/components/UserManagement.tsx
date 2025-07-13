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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
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
import { User, UserFilter, PageResult } from '../types';
import UserService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<PageResult<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<UserFilter>({});
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
      const response = await UserService.getUsers(filter, {
        page: currentPage - 1,
        size: 10,
      });
      setUsers(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [filter, page]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
    setPage(1);
  };

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
      moderatorId: 1,
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

  const renderUser = (user: User) => (
    <ListItem
      key={user.id}
      secondaryAction={
        isAuthenticated && (
          <Box>
            <IconButton onClick={() => handleOpenDialog(user)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(user.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    >
      <ListItemAvatar>
        <Avatar>
          <Person />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`${user.firstName} ${user.lastName} ${user.middleName || ''}`}
        secondary={
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Email fontSize="small" />
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            {user.position && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Business fontSize="small" />
                <Typography variant="body2">{user.position}</Typography>
              </Box>
            )}
            {user.personalPhone && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Phone fontSize="small" />
                <Typography variant="body2">{user.personalPhone}</Typography>
              </Box>
            )}
            {user.officeNumber && (
              <Chip
                label={`Офис: ${user.officeNumber}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        }
      />
    </ListItem>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Фильтры
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
              <TextField
                fullWidth
                name="firstName"
                label="Имя"
                value={filter.firstName || ''}
                onChange={handleFilterChange}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
              <TextField
                fullWidth
                name="lastName"
                label="Фамилия"
                value={filter.lastName || ''}
                onChange={handleFilterChange}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
              <TextField
                fullWidth
                name="middleName"
                label="Отчество"
                value={filter.middleName || ''}
                onChange={handleFilterChange}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Список пользователей */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <List>
              {users?.queryResult.map((user) => renderUser(user))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Пагинация */}
      {users && users.pageCount > 1 && (
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