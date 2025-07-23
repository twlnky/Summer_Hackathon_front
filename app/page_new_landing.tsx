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
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'departments':
        return <DepartmentManagement />;
      default:
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
                  <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '60%' } }}>
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
                  </Box>
                  
                  <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '40%' }, textAlign: 'center' }}>
                    <Box className="animate-scale-in">
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
                  </Box>
                </Box>
              </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                {[
                  { icon: Business, label: 'Департаментов', value: stats.totalDepartments, color: '#3b82f6' },
                  { icon: Groups, label: 'Сотрудников', value: stats.totalUsers, color: '#10b981' },
                  { icon: Verified, label: 'Модераторов', value: stats.totalModerators, color: '#f59e0b' },
                  { icon: Security, label: 'Администраторов', value: stats.totalAdmins, color: '#ef4444' }
                ].map((stat, index) => (
                  <Card 
                    key={index}
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
                ))}
              </Box>
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
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
                  <Card 
                    key={index}
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
                ))}
              </Box>
            </Container>

            {/* Quick Access Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 3
                  }}
                >
                  Быстрый доступ к разделам
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }, gap: 4 }}>
                {/* Поиск департаментов */}
                <Card sx={{ 
                  p: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 4,
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Business sx={{ color: '#3b82f6' }} />
                    Поиск департаментов
                  </Typography>
                  
                  <TextField
                    fullWidth
                    placeholder="Поиск по названию департамента..."
                    value={departmentSearchQuery}
                    onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                    sx={{
                      mb: 3,
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
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ 
                          mr: 1, 
                          color: '#64748b',
                        }} />
                      ),
                    }}
                  />

                  {departmentsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : filteredDepartments.length > 0 ? (
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {filteredDepartments.slice(0, 5).map((department) => (
                        <Box 
                          key={department.id}
                          onClick={() => router.push(`/department/${department.id}`)}
                          sx={{
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(0,0,0,0.05)',
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                              borderColor: '#3b82f6',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {department.name}
                          </Typography>
                          {department.tag && (
                            <Chip 
                              label={department.tag}
                              size="small"
                              sx={{ mt: 1, bgcolor: '#e2e8f0', color: '#475569', fontWeight: 500 }}
                            />
                          )}
                        </Box>
                      ))}
                      {filteredDepartments.length > 5 && (
                        <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b', mt: 2 }}>
                          И еще {filteredDepartments.length - 5} департаментов...
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Business sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {departmentSearchQuery ? 'Департаменты не найдены' : 'Загрузка департаментов...'}
                      </Typography>
                    </Box>
                  )}
                </Card>

                {/* Последние сотрудники */}
                <Card sx={{ 
                  p: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 4,
                  height: 'fit-content'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <PersonIcon sx={{ color: '#10b981' }} />
                    Сотрудники ({users.length})
                  </Typography>
                  
                  {users.length > 0 ? (
                    <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                      {users.slice(0, 6).map((user) => (
                        <Box 
                          key={user.id}
                          onClick={() => router.push(`/users/${user.id}`)}
                          sx={{
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: '1px solid rgba(0,0,0,0.05)',
                            '&:hover': {
                              bgcolor: '#f1f5f9',
                              borderColor: '#10b981',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {`${user.lastName || ''} ${user.firstName || ''}${user.middleName ? ` ${user.middleName}` : ''}`.trim()}
                          </Typography>
                          {user.position && (
                            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                              {user.position}
                            </Typography>
                          )}
                          {user.email && (
                            <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mt: 0.5 }}>
                              {user.email}
                            </Typography>
                          )}
                        </Box>
                      ))}
                      {users.length > 6 && (
                        <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b', mt: 2 }}>
                          И еще {users.length - 6} сотрудников...
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <PersonIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Загрузка данных о сотрудниках...
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Box>
            </Container>

            {/* CTA Section */}
            <Box sx={{
              background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
              color: 'white',
              py: 8
            }}>
              <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    Готовы начать работу?
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4,
                      opacity: 0.9,
                      maxWidth: 600,
                      mx: 'auto'
                    }}
                  >
                    Присоединяйтесь к современной системе управления персоналом РУТ МИИТ
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    {!isAuthenticated ? (
                      <>
                        <Button
                          size="large"
                          variant="contained"
                          onClick={() => router.push('/login')}
                          sx={{
                            bgcolor: '#fbbf24',
                            color: '#1e293b',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 4,
                            borderRadius: 3,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: '#f59e0b',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Войти в систему
                        </Button>
                        
                        <Button
                          size="large"
                          variant="outlined"
                          onClick={() => router.push('/register')}
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
                          Зарегистрироваться
                        </Button>
                      </>
                    ) : (
                      <Typography variant="h5" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                        Добро пожаловать, {user?.firstName || 'Пользователь'}!
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Container>
            </Box>
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
