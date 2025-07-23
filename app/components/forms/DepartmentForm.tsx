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
  CircularProgress,
} from '@mui/material';
import { Business, Save, Cancel } from '@mui/icons-material';
import { Department } from '../../types';
import DepartmentService from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';

interface DepartmentFormProps {
  department?: Department; // Для редактирования существующего департамента
  onSave: (department: Department) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSave, onCancel, loading = false }) => {
  const { isAuthenticated, user: currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
      });
    }
  }, [department]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Название департамента обязательно для заполнения';
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
        submit: 'Необходимо войти в систему для создания/редактирования департаментов'
      });
      return;
    }

    setSubmitLoading(true);
    try {
      const departmentData: Omit<Department, 'id'> | Partial<Department> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      let savedDepartment: Department;
      if (department) {
        // Редактирование существующего департамента
        savedDepartment = await DepartmentService.updateDepartment(department.id, departmentData);
      } else {
        // Создание нового департамента
        savedDepartment = await DepartmentService.createDepartment(departmentData as Omit<Department, 'id'>);
      }

      onSave(savedDepartment);
    } catch (error: any) {
      console.error('Ошибка при сохранении департамента:', error);
      
      let errorMessage = 'Ошибка при сохранении департамента';
      
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
            <Business sx={{ color: '#3b82f6', mr: 2, fontSize: '2rem' }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {department ? 'Редактировать департамент' : 'Добавить департамент'}
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
              Для создания и редактирования департаментов необходимо войти в систему
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Основная информация */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
              Основная информация
            </Typography>

            <TextField
              fullWidth
              label="Название департамента *"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Описание"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange('description')}
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

export default DepartmentForm;
