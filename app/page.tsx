'use client';

import { useState, useEffect, Suspense } from 'react';
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
import EnhancedUserManagement from './components/EnhancedUserManagement';
import DepartmentManagement from './components/DepartmentManagement';
import EnhancedDepartmentManagement from './components/EnhancedDepartmentManagement';
import { useAuth } from './contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Department, User } from './types';
import DepartmentService from './services/departmentService';
import UserService from './services/userService';

const HomePageContent = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const theme = useTheme();
  const searchParams = useSearchParams();
  
  // Читаем параметр tab из URL при загрузке компонента
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['home', 'users', 'departments'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);
  
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

  // Функция для переключения вкладок с обновлением URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Обновляем URL без перезагрузки страницы
    const newUrl = tab === 'home' ? '/' : `/?tab=${tab}`;
    window.history.pushState({}, '', newUrl);
  };

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
        return <EnhancedUserManagement />;
      case 'departments':
        return <EnhancedDepartmentManagement />;
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
                          onClick={() => handleTabChange('users')}
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
                          onClick={() => handleTabChange('departments')}
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
      <AppBar onMenuItemClick={handleTabChange} />
      {renderContent()}
    </Box>
  );
};

const HomePage = () => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f8fafc',
      }}>
        <CircularProgress size={60} sx={{ color: '#2563eb' }} />
      </Box>
    }>
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;
