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
  
  // Отладочная информация для отслеживания изменений вкладки
  useEffect(() => {
    console.log('HomePage: activeTab изменен на:', activeTab);
  }, [activeTab]);

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
            background: '#f8fafc',
            minHeight: '100vh',
            py: 4,
          }}>
            <Container maxWidth="lg">
              {/* Уведомление для неавторизованных пользователей */}
              {!isAuthenticated && (
                <Box 
                  className="animate-fade-in"
                  sx={{ 
                    mb: 4,
                    p: 3,
                    background: '#2C3E50',
                    borderRadius: 4,
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px rgba(45, 41, 158, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Добро пожаловать в систему РУТ МИИТ
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Вы просматриваете систему в режиме только для чтения. 
                    Войдите в систему для управления департаментами и пользователями.
                  </Typography>
                  <Button 
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/login')}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
                      }
                    }}
                  >
                    Авторизация
                  </Button>
                </Box>
              )}
              
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
