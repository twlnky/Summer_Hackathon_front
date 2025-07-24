'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  AppBar as MuiAppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  Phone,
  Email,
  Business,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Department, User } from '../../types';
import DepartmentService from '../../services/departmentService';
import UserService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import UserForm from '../../components/forms/UserForm';

const DepartmentPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  
  // DEBUG: Логируем всю информацию о маршруте
  console.log('DepartmentPage - полная информация о маршруте:', {
    params,
    currentPath: window.location.pathname
  });
  
  const id = params.id;
  
  // DEBUG: Логируем состояние аутентификации для отладки
  console.log('DepartmentPage - пользователь:', { 
    isAuthenticated, 
    userRole: user?.role, 
    userId: user?.id
  });
  
  // DEBUG: Логируем полученный ID департамента
  console.log('DepartmentPage - полученный ID из URL:', id);
  console.log('DepartmentPage - тип ID:', typeof id);
  console.log('DepartmentPage - является ли ID массивом:', Array.isArray(id));
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [moderator, setModerator] = useState<User | null>(null);
  
  const [usersTotalCount, setUsersTotalCount] = useState<number>(0);
  const [displayedUsersCount, setDisplayedUsersCount] = useState<number>(6); // Показываем только первые 6 пользователей

  const departmentId = parseInt(Array.isArray(id) ? id[0] : id as string);
  
  // DEBUG: Логируем преобразованный ID
  console.log('DepartmentPage - преобразованный departmentId:', departmentId);
  console.log('DepartmentPage - isNaN(departmentId):', isNaN(departmentId));

  const fetchDepartmentData = async () => {
    setDataLoading(true);
    setError('');
    
    try {
      const departmentData = await DepartmentService.getDepartmentById(departmentId);
      setDepartment(departmentData);
      
      // Загружаем пользователей департамента
      const usersResponse = await DepartmentService.getUsersByDepartment(
        departmentId,
        {},
        { page: 0, size: 1000 }
      );
      setUsers(usersResponse.queryResult);
      setUsersTotalCount(usersResponse.totalElements || usersResponse.queryResult.length);
      
    } catch (error: any) {
      console.error('Ошибка при загрузке данных департамента:', error);
      setError(error.response?.data?.message || 'Ошибка при загрузке данных департамента');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect: departmentId изменился на:', departmentId);
    console.log('useEffect: URL id parameter:', id);
    console.log('useEffect: window.location.pathname:', window.location.pathname);
    
    if (departmentId && !isNaN(departmentId)) {
      fetchDepartmentData();
    } else {
      console.error('useEffect: Некорректный departmentId:', departmentId);
      setError('Некорректный ID департамента');
    }
  }, [departmentId, id]);

  // Убираем принудительную авторизацию - анонимные пользователи могут просматривать департаменты
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  const fetchAllUsers = async () => {
    console.log('fetchAllUsers начала выполнение');
    setLoadingUsers(true);
    try {
      const response = await UserService.getUsers({}, { page: 0, size: 100 });
      console.log('Получен ответ от UserService:', response);
      setAllUsers(response.queryResult);
      console.log('Установлены пользователи:', response.queryResult.length);
    } catch (err: any) {
      console.error('Ошибка при загрузке пользователей:', err);
      setAllUsers([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoadingUsers(false);
      console.log('fetchAllUsers завершена');
    }
  };

  const handleAddUserClick = () => {
    console.log('Открытие диалога добавления пользователя');
    setSearchQuery(''); // Сброс поиска
    setAddUserDialogOpen(true);
    fetchAllUsers();
  };

  const handleAddUserToDepartment = async (userId: number) => {
    console.log('=== НАЧАЛО ДОБАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ===');
    console.log('Добавление пользователя с ID:', userId, 'в департамент:', departmentId);
    
    // Логируем состояние до добавления
    console.log('Состояние ДО добавления:', {
      usersInDepartment: users.length,
      userIds: users.map(u => u.id),
      allUsers: allUsers.length
    });
    
    try {
      console.log('Отправляем запрос на сервер...');
      const result = await DepartmentService.addUserToDepartment(departmentId, userId);
      console.log('Ответ сервера:', result);
      console.log('Пользователь успешно добавлен');
      
      // Ждем небольшую задержку для обеспечения консистентности данных на сервере
      console.log('Ожидание обновления данных на сервере...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Обновляем данные департамента...');
      // Принудительно обновляем данные с сервера
      await fetchDepartmentData();
      
      console.log('Обновляем список всех пользователей...');
      // Также обновляем список всех пользователей для корректной фильтрации
      await fetchAllUsers();
      
      // Логируем состояние после обновления
      console.log('Состояние ПОСЛЕ обновления:', {
        usersInDepartment: users.length,
        userIds: users.map(u => u.id)
      });
      
      console.log('Закрываем диалог...');
      setAddUserDialogOpen(false);
      setSearchQuery('');
      
      setSuccessMessage('Пользователь успешно добавлен в департамент');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log('=== ДОБАВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО ===');
    } catch (err: any) {
      console.log('=== ОШИБКА ПРИ ДОБАВЛЕНИИ ===');
      console.error('Ошибка при добавлении пользователя:', err);
      console.error('Статус ошибки:', err.response?.status);
      console.error('Данные ошибки:', err.response?.data);
      console.error('Полный ответ:', err.response);
      
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при добавлении пользователя';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      
      // Показываем alert для быстрой диагностики
      alert('Ошибка: ' + errorMessage);
    }
  };

  const handleRemoveUserFromDepartment = async (userId: number) => {
    try {
      await DepartmentService.removeUserFromDepartment(departmentId, userId);
      
      // Обновляем список пользователей департамента
      await fetchDepartmentData();
      setSuccessMessage('Пользователь успешно удален из департамента');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении пользователя');
    }
  };

  // Фильтруем пользователей, которые еще не в департаменте
  const availableUsers = allUsers.filter(u => 
    !users.some(departmentUser => departmentUser.id === u.id)
  );

  console.log('Состояние фильтрации пользователей:', {
    allUsersCount: allUsers.length,
    departmentUsersCount: users.length,
    availableUsersCount: availableUsers.length,
    departmentUserIds: users.map(u => u.id),
    allUserIds: allUsers.map(u => u.id)
  });

  // Дополнительная фильтрация по поисковому запросу
  const filteredUsers = availableUsers.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Фильтрация пользователей департамента по поиску
  const filteredDepartmentUsers = users.filter(user => {
    if (!departmentSearchQuery) return true;
    const query = departmentSearchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.position?.toLowerCase().includes(query)
    );
  });

  // Отображаемые пользователи с ограничением количества
  const displayedUsers = filteredDepartmentUsers.slice(0, displayedUsersCount);
  const hasMoreUsers = filteredDepartmentUsers.length > displayedUsersCount;

  const handleShowMoreUsers = () => {
    setDisplayedUsersCount(prev => prev + 6); // Показываем еще 6 пользователей
  };

  const handleShowAllUsers = () => {
    setDisplayedUsersCount(filteredDepartmentUsers.length); // Показываем всех
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <AdminPanelSettings color="error" />;
      case 'MODERATOR':
        return <SupervisorAccount color="warning" />;
      default:
        return <Person color="action" />;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'MODERATOR':
        return 'Модератор';
      default:
        return 'Сотрудник';
    }
  };

  const getRoleColor = (role?: string): 'error' | 'warning' | 'primary' => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      default:
        return 'primary';
    }
  };

  // Функции проверки прав доступа
  const canManageUsers = () => {
    if (!isAuthenticated || !user) return false;
    
    // Админы могут управлять пользователями в любом департаменте
    if (user.role === 'ADMIN') return true;
    
    // Модераторы могут управлять пользователями только в своем департаменте
    if (user.role === 'MODERATOR' && department) {
      return department.moderatorLogin === user.username;
    }
    
    return false;
  };

  const canEdit = (userData: User) => {
    if (!isAuthenticated || !user) return false;
    
    // Админы могут редактировать любого пользователя
    if (user.role === 'ADMIN') return true;
    
    // Модераторы могут редактировать пользователей только в своем департаменте
    // И не могут редактировать других модераторов и админов
    if (user.role === 'MODERATOR' && department) {
      return department.moderatorLogin === user.username && 
             userData.role !== 'ADMIN' && 
             userData.role !== 'MODERATOR';
    }
    
    return false;
  };

  const canRemoveFromDepartment = (userData: User) => {
    if (!isAuthenticated || !user) return false;
    
    // Админы могут удалять любого пользователя из департамента
    if (user.role === 'ADMIN') return true;
    
    // Модераторы могут удалять из своего департамента только обычных пользователей
    if (user.role === 'MODERATOR' && department) {
      return department.moderatorLogin === user.username && 
             userData.role !== 'ADMIN' && 
             userData.role !== 'MODERATOR';
    }
    
    return false;
  };

  const handleEditUser = (userData: User) => {
    console.log('Редактирование пользователя:', userData);
    setSelectedUser(userData);
    setEditDialogOpen(true);
  };

  const handleUserSaveSuccess = () => {
    console.log('handleUserSaveSuccess: Пользователь успешно сохранен');
    setEditDialogOpen(false);
    setSelectedUser(null);
    fetchDepartmentData(); // Обновляем данные департамента после сохранения
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#2C3E50',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Убираем блокировку для неавторизованных пользователей
  // if (!isAuthenticated) {
  //   return (
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         minHeight: '100vh',
  //         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  //       }}
  //     >
  //       <CircularProgress sx={{ color: 'white' }} />
  //     </Box>
  //   );
  // }

  if (dataLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Убираем блокировку отображения при ошибках для анонимных пользователей
  // if (error && !successMessage) {
  //   return (
  //     <Container>
  //       <Alert severity="error" sx={{ mt: 2 }}>
  //         {error}
  //       </Alert>
  //     </Container>
  //   );
  // }

  return (
    <Box sx={{ flexGrow: 1, background: '#2C3E50', minHeight: '100vh' }}>
      {/* Header */}
      <MuiAppBar position="static" sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Business sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              {department?.name || 'Департамент'}
            </Typography>
          </Box>
          
          {department?.tag && (
            <Chip 
              label={department.tag} 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          )}
        </Toolbar>
      </MuiAppBar>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Department Info */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  {department?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {usersTotalCount > 0 
                    ? `${usersTotalCount === 1 ? 'сотрудник' : usersTotalCount < 5 ? 'сотрудника' : 'сотрудников'}: ${usersTotalCount}`
                    : 'Нет сотрудников'
                  }
                </Typography>
              </Box>
            </Box>
            {department?.description && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {department.description}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Moderator Card */}
        {moderator && (
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <SupervisorAccount sx={{ mr: 1, color: 'warning.main' }} />
                Модератор департамента
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'warning.main', 
                    mr: 2, 
                    width: 48, 
                    height: 48,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {moderator.firstName?.charAt(0) || '?'}{moderator.lastName?.charAt(0) || '?'}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {moderator.firstName} {moderator.lastName}
                  </Typography>
                  {moderator.position && (
                    <Typography variant="body2" color="text.secondary">
                      {moderator.position}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        component="a"
                        href={`mailto:${moderator.email}`}
                        sx={{ 
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': {
                            color: 'primary.main',
                            cursor: 'pointer'
                          }
                        }}
                      >
                        {moderator.email}
                      </Typography>
                    </Box>
                    {moderator.personalPhone && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          component="a"
                          href={`tel:${moderator.personalPhone}`}
                          sx={{ 
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': {
                              color: 'primary.main',
                              cursor: 'pointer'
                            }
                          }}
                        >
                          {moderator.personalPhone}
                        </Typography>
                      </Box>
                    )}
                    {moderator.officeNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Кабинет {moderator.officeNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Chip
                  icon={<SupervisorAccount />}
                  label="Модератор"
                  color="warning"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Typography variant="h5" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
          Сотрудники департамента
        </Typography>

        {/* Search Field for Department Users */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск сотрудников по имени, фамилии, email или должности..."
            value={departmentSearchQuery}
            onChange={(e) => {
              setDepartmentSearchQuery(e.target.value);
              // Сбрасываем количество отображаемых пользователей при поиске
              if (e.target.value) {
                setDisplayedUsersCount(users.length); // Показываем всех при поиске
              } else {
                setDisplayedUsersCount(6); // Возвращаемся к начальному количеству
              }
            }}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </Box>
        
        <Grid container spacing={3}>
          {filteredDepartmentUsers.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(44, 62, 80, 0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                border: '1px solid rgba(44, 62, 80, 0.08)',
                textAlign: 'center',
                py: 4
              }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    {departmentSearchQuery 
                      ? `Не найдено сотрудников по запросу "${departmentSearchQuery}"` 
                      : 'В департаменте пока нет сотрудников'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            displayedUsers.map((userData) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={userData.id}>
              <Card 
                sx={{ 
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(44, 62, 80, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(44, 62, 80, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 24px 48px rgba(44, 62, 80, 0.2)',
                    border: '1px solid rgba(44, 62, 80, 0.15)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 40%, #e2e8f0 100%)',
                  },
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  {/* Role Badge */}
                  <Box sx={{ position: 'absolute', top: -8, right: 16 }}>
                    <Chip
                      icon={getRoleIcon(userData.role)}
                      label={getRoleLabel(userData.role)}
                      color={getRoleColor(userData.role)}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)',
                      }}
                    />
                  </Box>

                  {/* Avatar */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #2C3E50 0%, #34495e 100%)',
                        border: '4px solid rgba(44, 62, 80, 0.1)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 24px rgba(44, 62, 80, 0.3)',
                        color: 'white',
                      }}
                    >
                      {userData.firstName?.charAt(0) || '?'}{userData.lastName?.charAt(0) || '?'}
                    </Avatar>
                  </Box>

                  {/* Name */}
                  <Typography 
                    variant="h6" 
                    align="center" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '1.1rem',
                      color: '#2C3E50',
                      lineHeight: 1.3,
                    }}
                  >
                    {userData.firstName} {userData.lastName}
                  </Typography>

                  {/* Position */}
                  {userData.position && (
                    <Typography 
                      variant="body2" 
                      align="center" 
                      sx={{ 
                        color: '#64748b',
                        mb: 2,
                        fontWeight: 500,
                        backgroundColor: 'rgba(44, 62, 80, 0.05)',
                        borderRadius: 2,
                        py: 0.5,
                        px: 1.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {userData.position}
                    </Typography>
                  )}

                  {/* Contact Info */}
                  <Box sx={{ mt: 2 }}>
                    {userData.personalPhone && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        backgroundColor: 'rgba(44, 62, 80, 0.03)',
                        borderRadius: 2,
                        py: 1,
                        px: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(44, 62, 80, 0.08)',
                        }
                      }}>
                        <Phone sx={{ 
                          fontSize: 18, 
                          mr: 1.5, 
                          color: '#2C3E50',
                        }} />
                        <Typography 
                          variant="body2" 
                          component="a"
                          href={`tel:${userData.personalPhone}`}
                          sx={{ 
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            color: '#475569',
                            fontWeight: 500,
                            '&:hover': {
                              color: '#2C3E50',
                              cursor: 'pointer'
                            }
                          }}
                        >
                          {userData.personalPhone}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      backgroundColor: 'rgba(44, 62, 80, 0.03)',
                      borderRadius: 2,
                      py: 1,
                      px: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 62, 80, 0.08)',
                      }
                    }}>
                      <Email sx={{ 
                        fontSize: 18, 
                        mr: 1.5, 
                        color: '#2C3E50',
                      }} />
                      <Typography 
                        variant="body2" 
                        component="a"
                        href={`mailto:${userData.email}`}
                        sx={{ 
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          color: '#475569',
                          fontWeight: 500,
                          '&:hover': {
                            color: '#2C3E50',
                            cursor: 'pointer'
                          }
                        }}
                      >
                        {userData.email}
                      </Typography>
                    </Box>

                    {userData.officeNumber && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(44, 62, 80, 0.03)',
                        borderRadius: 2,
                        py: 1,
                        px: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(44, 62, 80, 0.08)',
                        }
                      }}>
                        <Business sx={{ 
                          fontSize: 18, 
                          mr: 1.5, 
                          color: '#2C3E50',
                        }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.9rem',
                            color: '#475569',
                            fontWeight: 500,
                          }}
                        >
                          Кабинет {userData.officeNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  {canManageUsers() && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {canEdit(userData) && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditUser(userData)}
                          sx={{
                            borderColor: '#2C3E50',
                            color: '#2C3E50',
                            fontWeight: 600,
                            borderRadius: 3,
                            px: 2,
                            py: 1,
                            '&:hover': {
                              borderColor: '#34495e',
                              backgroundColor: 'rgba(44, 62, 80, 0.08)',
                              color: '#34495e',
                            }
                          }}
                        >
                          Изменить
                        </Button>
                      )}
                      {canRemoveFromDepartment(userData) && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => {
                            if (window.confirm(`Вы уверены, что хотите удалить ${userData.firstName} ${userData.lastName} из департамента?`)) {
                              handleRemoveUserFromDepartment(userData.id);
                            }
                          }}
                          sx={{
                            borderColor: '#e74c3c',
                            color: '#e74c3c',
                            fontWeight: 600,
                            borderRadius: 3,
                            px: 2,
                            py: 1,
                            '&:hover': {
                            borderColor: '#c0392b',
                            backgroundColor: 'rgba(231, 76, 60, 0.08)',
                            color: '#c0392b',
                          }
                        }}
                      >
                        Удалить из департамента
                      </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
        </Grid>

        {/* Show More Button */}
        {hasMoreUsers && !departmentSearchQuery && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleShowMoreUsers}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#2C3E50',
                color: '#2C3E50',
                fontWeight: 600,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#34495e',
                  backgroundColor: 'rgba(44, 62, 80, 0.08)',
                  color: '#34495e',
                }
              }}
            >
              Показать еще {Math.min(6, filteredDepartmentUsers.length - displayedUsersCount)} {filteredDepartmentUsers.length - displayedUsersCount === 1 ? 'позицию' : 
                filteredDepartmentUsers.length - displayedUsersCount < 5 ? 'позиции' : 'позиций'}
            </Button>
          </Box>
        )}

        {/* Add User Button - FAB for Admins and Moderators */}
        {canManageUsers() && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: user?.role === 'ADMIN' 
                ? 'linear-gradient(45deg, #f44336 30%, #e57373 90%)' 
                : 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
              color: 'white',
              '&:hover': {
                background: user?.role === 'ADMIN' 
                  ? 'linear-gradient(45deg, #f44336 60%, #e57373 100%)' 
                  : 'linear-gradient(45deg, #ff9800 60%, #ffb74d 100%)',
              },
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={() => {
              setSearchQuery(''); 
              setAddUserDialogOpen(true);
              fetchAllUsers();
            }}
          >
            <Add />
          </Fab>
        )}

      </Container>

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 2 }}>
          {selectedUser && (
            <UserForm 
              user={selectedUser}
              onSave={handleUserSaveSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onClose={() => {
          setAddUserDialogOpen(false);
          setSearchQuery('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Добавить пользователя в департамент
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Выберите пользователя из списка ниже, чтобы добавить его в департамент.
          </Typography>

          {/* Search Field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          {/* Users List */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery 
                    ? 'Нет пользователей, соответствующих запросу' 
                    : 'Все пользователи уже добавлены в департамент'
                  }
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredUsers.map((userData) => (
                  <Grid size={{ xs: 12 }} key={userData.id}>
                    <Card sx={{ 
                      borderRadius: 2, 
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                mr: 2
                              }}
                            >
                              {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {userData.firstName} {userData.lastName}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                component="a"
                                href={`mailto:${userData.email}`}
                                sx={{ 
                                  textDecoration: 'none',
                                  color: 'inherit',
                                  '&:hover': {
                                    color: 'primary.main',
                                    cursor: 'pointer'
                                  }
                                }}
                              >
                                {userData.email}
                              </Typography>
                              {userData.position && (
                                <Typography variant="caption" color="text.secondary">
                                  {userData.position}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Button
                            variant="contained"
                            onClick={() => {
                              alert(`Попытка добавить пользователя ${userData.firstName} (ID: ${userData.id})`);
                              handleAddUserToDepartment(userData.id);
                            }}
                            sx={{
                              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 100%)',
                              },
                            }}
                          >
                            Добавить
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAddUserDialogOpen(false);
              setSearchQuery('');
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DepartmentPage;
