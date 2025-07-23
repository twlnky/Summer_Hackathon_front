'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Person, Save, Cancel } from '@mui/icons-material';
import { User, Department } from '../../types';
import UserService from '../../services/userService';
import DepartmentService from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';

interface UserFormProps {
  user?: User; // Для редактирования существующего пользователя
  onSave: (user: User) => void;
  onCancel: () => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, loading = false }) => {
  const { isAuthenticated, user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    personalPhone: '',
    position: '',
    officeNumber: '',
    note: '',
    role: 'USER' as 'USER' | 'MODERATOR' | 'ADMIN',
    departmentsIds: [] as number[],
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        middleName: user.middleName || '',
        email: user.email || '',
        personalPhone: user.personalPhone || '',
        position: user.position || '',
        officeNumber: user.officeNumber?.toString() || '',
        note: user.note || '',
        role: user.role || 'USER',
        departmentsIds: user.departmentsIds || [],
      });
    }
  }, [user]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const result = await DepartmentService.getDepartments();
      setDepartments(result.queryResult || []);
    } catch (error) {
      console.error('Ошибка при загрузке отделов:', error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (formData.personalPhone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.personalPhone)) {
      newErrors.personalPhone = 'Неверный формат телефона';
    }

    if (formData.officeNumber && !/^\d+$/.test(formData.officeNumber)) {
      newErrors.officeNumber = 'Номер офиса должен быть числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Проверяем авторизацию
    if (!isAuthenticated) {
      setErrors({
        submit: 'Необходимо войти в систему для создания/редактирования пользователей'
      });
      return;
    }

    setSubmitLoading(true);
    try {
      const userData: Omit<User, 'id'> | Partial<User> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName.trim() || undefined,
        email: formData.email.trim(),
        personalPhone: formData.personalPhone.trim() || undefined,
        position: formData.position.trim() || undefined,
        officeNumber: formData.officeNumber ? parseInt(formData.officeNumber) : undefined,
        note: formData.note.trim() || undefined,
        role: 'USER', // Всегда устанавливаем роль USER
        departmentsIds: formData.departmentsIds,
      };

      let savedUser: User;
      if (user) {
        // Редактирование существующего пользователя
        savedUser = await UserService.updateUser(user.id, userData);
      } else {
        // Создание нового пользователя
        savedUser = await UserService.createUser(userData as Omit<User, 'id'>);
      }

      onSave(savedUser);
    } catch (error: any) {
      console.error('Ошибка при сохранении пользователя:', error);
      
      let errorMessage = 'Ошибка при сохранении пользователя';
      
      if (error.response?.status === 401) {
        errorMessage = 'Сессия истекла. Необходимо войти в систему заново';
      } else if (error.response?.status === 403) {
        errorMessage = 'Недостаточно прав для выполнения операции. Требуются права администратора';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Card sx={{ 
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Person sx={{ color: '#3b82f6', mr: 2, fontSize: '2rem' }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </Typography>
          </Box>

          {errors.submit && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
              }}
            >
              {errors.submit}
            </Alert>
          )}

          {!isAuthenticated && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.1)',
              }}
            >
              Для создания и редактирования пользователей необходимо войти в систему
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Основная информация */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
              Основная информация
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Имя *"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Фамилия *"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Отчество"
              value={formData.middleName}
              onChange={handleChange('middleName')}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* Контактная информация */}
            <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#374151' }}>
              Контактная информация
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.personalPhone}
                onChange={handleChange('personalPhone')}
                error={!!errors.personalPhone}
                helperText={errors.personalPhone}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            {/* Рабочая информация */}
            <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#374151' }}>
              Рабочая информация
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Должность"
                value={formData.position}
                onChange={handleChange('position')}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                fullWidth
                label="Номер офиса"
                value={formData.officeNumber}
                onChange={handleChange('officeNumber')}
                error={!!errors.officeNumber}
                helperText={errors.officeNumber}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            <FormControl 
              fullWidth 
              disabled={departmentsLoading}
              sx={{ mb: 3 }}
            >
              <InputLabel>Отдел</InputLabel>
              <Select
                value={formData.departmentsIds.length > 0 ? formData.departmentsIds[0] : ''}
                onChange={(event) => {
                  const value = event.target.value as string | number;
                  setFormData(prev => ({
                    ...prev,
                    departmentsIds: value === '' ? [] : [Number(value)]
                  }));
                }}
                label="Отдел"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Без отдела</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Заметки"
              multiline
              rows={3}
              value={formData.note}
              onChange={handleChange('note')}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={submitLoading || loading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={submitLoading || loading || !isAuthenticated}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                  },
                  '&:disabled': {
                    background: '#9ca3af',
                    transform: 'none',
                    boxShadow: 'none',
                  }
                }}
              >
                {submitLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserForm;
