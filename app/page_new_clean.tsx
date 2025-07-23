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
  Button
} from '@mui/material';
import { Business, Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState<string>('');
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    setError('');

    try {
      const response = await DepartmentService.getDepartments({}, { page: 0, size: 100 });
      setDepartments(response.queryResult);
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
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            py: 4,
          }}>
            <Container maxWidth="lg">
              {/* Hero Section */}
              <Box 
                className="animate-fade-in"
                sx={{ 
                  mb: 6, 
                  textAlign: 'center',
                  py: 4,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography 
                  variant="h3" 
                  className="text-gradient"
                  sx={{ 
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  🚂 РУТ МИИТ
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 3,
                    color: '#475569',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  Институт управления и цифровых технологий
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    maxWidth: '600px',
                    margin: '0 auto',
                    color: '#64748b',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  Система управления департаментами и сотрудниками для эффективной организации работы института
                </Typography>
              </Box>

              {/* Статистика */}
              <Box 
                className="animate-slide-in"
                sx={{ 
                  mb: 6,
                  display: 'flex',
                  gap: 4,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Card 
                  className="card-modern"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: 'white',
                    border: 'none',
                    minWidth: 250,
                    flex: 1,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 50px rgba(37, 99, 235, 0.3)',
                    }
                  }}
                >
                  <Business sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {departments.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Департаментов
                  </Typography>
                </Card>
                <Card 
                  className="card-modern"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                    color: 'white',
                    border: 'none',
                    minWidth: 250,
                    flex: 1,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 50px rgba(14, 165, 233, 0.3)',
                    }
                  }}
                >
                  <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {users.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Сотрудников
                  </Typography>
                </Card>
                <Card 
                  className="card-modern"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
                    color: 'white',
                    border: 'none',
                    minWidth: 250,
                    flex: 1,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 50px rgba(6, 182, 212, 0.3)',
                    }
                  }}
                >
                  <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {isAuthenticated ? 'Активен' : 'Чтение'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Режим доступа
                  </Typography>
                </Card>
              </Box>

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
                          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: '1px solid rgba(37, 99, 235, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 25px 50px rgba(37, 99, 235, 0.15)',
                            border: '1px solid rgba(37, 99, 235, 0.2)',
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
                                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
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
                              {department.tag && (
                                <Chip 
                                  label={department.tag}
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #60a5fa 0%, #67e8f9 100%)',
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
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
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
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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
