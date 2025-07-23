'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  CircularProgress, 
  TextField, 
  Button,
  Grid,
  Paper,
  IconButton,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Business, 
  Search as SearchIcon, 
  Person as PersonIcon,
  GroupWork,
  TrendingUp,
  Phone,
  Email,
  LocationOn,
  School,
  Engineering,
  Science,
  AccountBalance,
  Groups,
  Verified,
  StarRate,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  Security,
  Speed,
  Support
} from '@mui/icons-material';
import AppBar from './components/AppBar';
import UserManagement from './components/UserManagement';
import DepartmentManagement from './components/DepartmentManagement';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Department, User } from './types';
import DepartmentService from './services/departmentService';
import UserService from './services/userService';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const theme = useTheme();
  
  // Отладочная информация для отслеживания изменений вкладки
  useEffect(() => {
    console.log('HomePage: activeTab изменен на:', activeTab);
  }, [activeTab]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState<string>('');
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalUsers: 0,
    totalModerators: 0,
    totalAdmins: 0
  });
  
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    setError('');

    try {
      const response = await DepartmentService.getDepartments({}, { page: 0, size: 100 });
      setDepartments(response.queryResult);
      setStats(prev => ({ ...prev, totalDepartments: response.totalElements || response.queryResult.length }));
    } catch (err: any) {
      setDepartments([]);
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Ошибка при загрузке департаментов');
      }
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await UserService.getUsers({}, { page: 0, size: 100 });
      setUsers(response.queryResult);
      
      // Подсчитываем статистику ролей
      const moderators = response.queryResult.filter(u => u.role === 'MODERATOR').length;
      const admins = response.queryResult.filter(u => u.role === 'ADMIN').length;
      
      setStats(prev => ({ 
        ...prev, 
        totalUsers: response.totalElements || response.queryResult.length,
        totalModerators: moderators,
        totalAdmins: admins
      }));
    } catch (err: any) {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
      fetchDepartments();
      fetchUsers();
    }
  }, [activeTab]);

  // Фильтрация департаментов по поиску
  const filteredDepartments = departments.filter(department => {
    if (!departmentSearchQuery) return true;
    const query = departmentSearchQuery.toLowerCase();
    return (
      department.name?.toLowerCase().includes(query) ||
      department.tag?.toLowerCase().includes(query)
    );
  });

  const renderContent = () => {
    console.log('Current activeTab:', activeTab); // Отладочная информация
    switch (activeTab) {
      case 'users':
        console.log('HomePage: Отображаем UserManagement компонент'); // Отладочная информация
        return <UserManagement />;
      case 'departments':
        console.log('HomePage: Отображаем DepartmentManagement компонент'); // Отладочная информация
        return <DepartmentManagement />;
      default:
        console.log('HomePage: Отображаем главную страницу'); // Отладочная информация
        return (
          <Box sx={{ 
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
            minHeight: '100vh',
          }}>
            {/* Hero Section */}
            <Box sx={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #2C3E50 100%)',
              color: 'white',
              py: { xs: 8, md: 12 },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='2' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grain)'/%3E%3C/svg%3E")`,
                opacity: 0.6,
                zIndex: 1
              }
            }}>
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box className="animate-fade-in">
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 800,
                          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                          lineHeight: 1.1,
                          mb: 3,
                          background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Система управления
                        <br />
                        <Box component="span" sx={{ color: '#fbbf24' }}>
                          сотрудниками РУТ МИИТ
                        </Box>
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 4,
                          fontWeight: 400,
                          opacity: 0.9,
                          lineHeight: 1.6,
                          fontSize: { xs: '1.1rem', md: '1.3rem' }
                        }}
                      >
                        Современная платформа для управления персоналом, департаментами и структурой университета. 
                        Быстрый поиск сотрудников, удобное управление подразделениями и эффективная организация работы.
                      </Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                        <Button
                          size="large"
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => setActiveTab('users')}
                          sx={{
                            bgcolor: '#fbbf24',
                            color: '#1e293b',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            textTransform: 'none',
                            boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)',
                            '&:hover': {
                              bgcolor: '#f59e0b',
                              boxShadow: '0 12px 30px rgba(251, 191, 36, 0.4)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Управление сотрудниками
                        </Button>
                        
                        <Button
                          size="large"
                          variant="outlined"
                          startIcon={<Business />}
                          onClick={() => setActiveTab('departments')}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: 'white',
                              bgcolor: 'rgba(255,255,255,0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Управление департаментами
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box className="animate-scale-in" sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: { xs: 200, md: 300 },
                          height: { xs: 200, md: 300 },
                          margin: '0 auto',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '10%',
                            left: '10%',
                            right: '10%',
                            bottom: '10%',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                          }
                        }}
                      >
                        <School sx={{ fontSize: { xs: 80, md: 120 }, color: '#fbbf24' }} />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 3 }}>
              <Grid container spacing={3}>
                {[
                  { icon: Business, label: 'Департаментов', value: stats.totalDepartments, color: '#3b82f6' },
                  { icon: Groups, label: 'Сотрудников', value: stats.totalUsers, color: '#10b981' },
                  { icon: Verified, label: 'Модераторов', value: stats.totalModerators, color: '#f59e0b' },
                  { icon: Security, label: 'Администраторов', value: stats.totalAdmins, color: '#ef4444' }
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card 
                      className="animate-slide-in"
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 4,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <stat.icon sx={{ fontSize: 48, color: stat.color }} />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
              <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#1e293b',
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Возможности системы
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#64748b',
                    fontWeight: 400,
                    maxWidth: 600,
                    mx: 'auto',
                    lineHeight: 1.6
                  }}
                >
                  Полный набор инструментов для эффективного управления персоналом и структурой университета
                </Typography>
              </Box>

              <Grid container spacing={4}>
                {[
                  {
                    icon: GroupWork,
                    title: 'Управление департаментами',
                    description: 'Создание, редактирование и управление структурой подразделений. Назначение модераторов и контроль иерархии.',
                    color: '#3b82f6'
                  },
                  {
                    icon: PersonIcon,
                    title: 'База сотрудников',
                    description: 'Полная информация о персонале: контакты, должности, офисы. Быстрый поиск и фильтрация.',
                    color: '#10b981'
                  },
                  {
                    icon: Speed,
                    title: 'Быстрый поиск',
                    description: 'Мгновенный поиск сотрудников по имени, email, должности или департаменту. Умные фильтры.',
                    color: '#f59e0b'
                  },
                  {
                    icon: Security,
                    title: 'Контроль доступа',
                    description: 'Ролевая модель доступа: администраторы, модераторы и обычные пользователи. Безопасность данных.',
                    color: '#ef4444'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Аналитика',
                    description: 'Статистика по департаментам, отчеты о структуре персонала и аналитические данные.',
                    color: '#8b5cf6'
                  },
                  {
                    icon: Support,
                    title: 'Техподдержка',
                    description: 'Круглосуточная поддержка пользователей, обучение работе с системой и консультации.',
                    color: '#06b6d4'
                  }
                ].map((feature, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card 
                      className="animate-fade-in"
                      sx={{
                        p: 4,
                        h: '100%',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: 4,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                          borderColor: feature.color,
                          '& .feature-icon': {
                            transform: 'scale(1.1) rotate(5deg)',
                            color: feature.color
                          }
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                        <Box
                          className="feature-icon"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            background: alpha(feature.color, 0.1),
                            transition: 'all 0.3s ease',
                            mr: 2
                          }}
                        >
                          <feature.icon sx={{ fontSize: 32, color: feature.color }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#1e293b',
                              mb: 2,
                              lineHeight: 1.3
                            }}
                          >
                            {feature.title}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#64748b',
                          lineHeight: 1.6,
                          fontWeight: 400
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
            py: 4,
          }}>
            <Container maxWidth="lg">
              {/* Поиск департаментов */}
              <Box 
                className="animate-fade-in"
                sx={{ 
                  mb: 4,
                  p: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  color: '#1e293b',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}>
                  Поиск департаментов
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Поиск по названию департамента..."
                  value={departmentSearchQuery}
                  onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 3,
                      border: '2px solid rgba(37, 99, 235, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'rgba(37, 99, 235, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ 
                        mr: 1, 
                        color: '#64748b',
                        fontSize: '1.5rem',
                      }} />
                    ),
                  }}
                />
              </Box>

              {/* Департаменты */}
              <Box className="animate-slide-in">
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  color: '#1e293b',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}>
                  Департаменты ({filteredDepartments.length})
                </Typography>
                
                {departmentsLoading ? (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: 3,
                    mb: 4
                  }}>
                    {[...Array(6)].map((_, index) => (
                      <Card 
                        key={index}
                        className="card-modern shimmer"
                        sx={{ 
                          p: 3,
                          height: 200,
                          background: '#f0f0f0',
                          backgroundSize: '200px 100%',
                        }}
                      />
                    ))}
                  </Box>
                ) : filteredDepartments.length > 0 ? (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: 3,
                    mb: 4
                  }}>
                    {filteredDepartments.map((department) => (
                      <Card 
                        key={department.id}
                        className="card-modern animate-scale-in"
                        sx={{ 
                          p: 3,
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                          border: '1px solid rgba(44, 62, 80, 0.08)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 25px 50px rgba(44, 62, 80, 0.15)',
                            border: '1px solid rgba(44, 62, 80, 0.15)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 100%)',
                          }
                        }}
                        onClick={() => router.push(`/department/${department.id}`)}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                width: 56, 
                                height: 56,
                                background: '#2C3E50',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)',
                              }}
                            >
                              <Business />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: '#1e293b',
                                  lineHeight: 1.3,
                                  fontSize: '1.1rem',
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {department.name}
                              </Typography>
                              
                              {/* Отображение модератора */}
                              {(department.moderator || department.moderatorFirstName || department.moderatorLogin) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <PersonIcon sx={{ 
                                    mr: 1, 
                                    color: '#2C3E50', 
                                    fontSize: '1rem' 
                                  }} />
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#64748b',
                                      fontSize: '0.875rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {department.moderator 
                                      ? `${department.moderator.lastName} ${department.moderator.firstName}${department.moderator.middleName ? ` ${department.moderator.middleName}` : ''}`
                                      : (department.moderatorFirstName || department.moderatorLastName)
                                      ? `${department.moderatorLastName || ''} ${department.moderatorFirstName || ''}${department.moderatorMiddleName ? ` ${department.moderatorMiddleName}` : ''}`.trim()
                                      : `Модератор: ${department.moderatorLogin}`
                                    }
                                  </Typography>
                                </Box>
                              )}
                              
                              {department.tag && (
                                <Chip 
                                  label={department.tag}
                                  size="small"
                                  sx={{
                                    background: '#2C3E50',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                    '& .MuiChip-label': {
                                      px: 1,
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Card 
                    className="card-modern"
                    sx={{ 
                      p: 6,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                      border: '1px solid rgba(44, 62, 80, 0.08)',
                    }}
                  >
                    <Business sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#475569',
                      mb: 1
                    }}>
                      Департаменты не найдены
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      Попробуйте изменить поисковый запрос или очистить фильтры
                    </Typography>
                  </Card>
                )}
              </Box>

              {/* Сотрудники РУТ МИИТ */}
              <Box className="animate-slide-in" sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  color: '#1e293b',
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}>
                  Сотрудники РУТ МИИТ ({users.length})
                </Typography>
                
                {users.length > 0 ? (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 3,
                    mb: 4
                  }}>
                    {users.slice(0, 12).map((user) => (
                      <Card 
                        key={user.id}
                        className="card-modern animate-scale-in"
                        onClick={() => router.push(`/users/${user.id}`)}
                        sx={{ 
                          p: 3,
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                          border: '1px solid rgba(44, 62, 80, 0.08)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 15px 35px rgba(44, 62, 80, 0.15)',
                            border: '1px solid rgba(44, 62, 80, 0.15)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #e2e8f0 100%)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: '#1e293b',
                                  lineHeight: 1.3,
                                  fontSize: '1rem',
                                  mb: 0.5,
                                }}
                              >
                                {`${user.lastName || ''} ${user.firstName || ''}${user.middleName ? ` ${user.middleName}` : ''}`.trim()}
                              </Typography>
                              
                              {user.position && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    mb: 1
                                  }}
                                >
                                  {user.position}
                                </Typography>
                              )}

                              {user.officeNumber && (
                                <Chip 
                                  label={`Кабинет ${user.officeNumber}`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(44, 62, 80, 0.1)',
                                    color: '#2C3E50',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 20,
                                    mb: 1,
                                    '& .MuiChip-label': {
                                      px: 1,
                                    }
                                  }}
                                />
                              )}

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                {user.email && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: '#2C3E50',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                    component="a"
                                    href={`mailto:${user.email}`}
                                  >
                                    ✉️ {user.email}
                                  </Typography>
                                )}
                                {user.personalPhone && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: '#2C3E50',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                    component="a"
                                    href={`tel:${user.personalPhone}`}
                                  >
                                    📞 {user.personalPhone}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Card 
                    className="card-modern"
                    sx={{ 
                      p: 6,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
                      border: '1px solid rgba(44, 62, 80, 0.08)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#475569',
                      mb: 1
                    }}>
                      Сотрудники не найдены
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      Загрузка данных о сотрудниках...
                    </Typography>
                  </Card>
                )}
              </Box>
            </Container>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f8fafc',
      }}>
        <CircularProgress size={60} sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar onMenuItemClick={setActiveTab} />
      {renderContent()}
    </Box>
  );
};

export default HomePage;
