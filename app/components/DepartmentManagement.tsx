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
  Alert,
  CircularProgress,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Business,
  Edit,
  Delete,
  Add,
  People,
  ExpandMore,
} from '@mui/icons-material';
import { Department, DepartmentFilter, PageResult, User } from '../types';
import DepartmentService from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<PageResult<Department> | null>(null);
  const [departmentUsers, setDepartmentUsers] = useState<{[key: number]: User[]}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<DepartmentFilter>({});
  const [page, setPage] = useState<number>(1);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());

  const { isAuthenticated } = useAuth();

  const fetchDepartments = async (currentPage: number = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await DepartmentService.getDepartments(filter, {
        page: currentPage - 1,
        size: 10,
      });
      setDepartments(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке департаментов');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentUsers = async (departmentId: number) => {
    try {
      const response = await DepartmentService.getUsersByDepartment(departmentId);
      setDepartmentUsers(prev => ({
        ...prev,
        [departmentId]: response.queryResult,
      }));
    } catch (err: any) {
      console.error('Ошибка при загрузке пользователей департамента:', err);
    }
  };

  useEffect(() => {
    fetchDepartments(page);
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

  const handleOpenDialog = (department?: Department) => {
    setSelectedDepartment(department || null);
    setFormData(department || {
      name: '',
      moderatorId: 1,
    });
    setIsEditing(!!department);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDepartment(null);
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
      if (isEditing && selectedDepartment) {
        await DepartmentService.updateDepartment(selectedDepartment.id, formData);
      } else {
        await DepartmentService.createDepartment(formData as Omit<Department, 'id'>);
      }
      handleCloseDialog();
      fetchDepartments(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении департамента');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот департамент?')) {
      try {
        await DepartmentService.deleteDepartment(id);
        fetchDepartments(page);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при удалении департамента');
      }
    }
  };

  const handleDepartmentExpand = (departmentId: number) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
      // Загружаем пользователей, если еще не загружены
      if (!departmentUsers[departmentId]) {
        fetchDepartmentUsers(departmentId);
      }
    }
    setExpandedDepartments(newExpanded);
  };

  const renderDepartment = (department: Department) => (
    <Accordion
      key={department.id}
      expanded={expandedDepartments.has(department.id)}
      onChange={() => handleDepartmentExpand(department.id)}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" sx={{ flex: 1 }}>
          <Avatar sx={{ mr: 2 }}>
            <Business />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{department.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {department.id}
            </Typography>
          </Box>
          {isAuthenticated && (
            <Box onClick={(e) => e.stopPropagation()}>
              <IconButton onClick={() => handleOpenDialog(department)} sx={{ mr: 1 }}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDelete(department.id)} color="error">
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography variant="h6" gutterBottom>
            <People sx={{ mr: 1 }} />
            Сотрудники департамента
          </Typography>
          {departmentUsers[department.id] ? (
            departmentUsers[department.id].length > 0 ? (
              <List>
                {departmentUsers[department.id].map((user) => (
                  <ListItem key={user.id}>
                    <ListItemAvatar>
                      <Avatar>
                        {user.firstName?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName || ''} ${user.lastName || ''} ${user.middleName || ''}`}
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            component="a" 
                            href={`mailto:${user.email}`}
                            sx={{ 
                              display: 'block',
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
                          {user.position && (
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                              {user.position}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                В департаменте нет сотрудников
              </Typography>
            )
          ) : (
            <CircularProgress size={24} />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управление департаментами
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Добавить департамент
          </Button>
        )}
      </Box>

      {/* Уведомление для неавторизованных пользователей */}
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Вы просматриваете список департаментов в режиме только для чтения. 
            Войдите в систему для управления департаментами.
          </Typography>
        </Alert>
      )}

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, maxWidth: { md: '50%' } }}>
              <TextField
                fullWidth
                name="name"
                label="Название департамента"
                value={filter.name || ''}
                onChange={handleFilterChange}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Список департаментов */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {departments?.queryResult.map((department) => renderDepartment(department))}
        </Box>
      )}

      {/* Пагинация */}
      {departments && departments.pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={departments.pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Редактировать департамент' : 'Создать департамент'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                required
                name="name"
                label="Название департамента"
                value={formData.name || ''}
                onChange={handleFormChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                name="moderatorId"
                label="ID модератора"
                type="number"
                value={formData.moderatorId || ''}
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

export default DepartmentManagement;