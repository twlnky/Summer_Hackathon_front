'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Chip, Grid, CircularProgress, Alert } from '@mui/material';
import { Business, Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import AppBar from './components/AppBar';
import SearchComponent from './components/SearchComponent';
import UserManagement from './components/UserManagement';
import DepartmentManagement from './components/DepartmentManagement';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Department } from './types';
import DepartmentService from './services/departmentService';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await DepartmentService.getDepartments({}, { page: 0, size: 50 });
      setDepartments(response.queryResult);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке департаментов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
      fetchDepartments();
    }
  }, [activeTab]);

  const handleMenuItemClick = (item: string) => {
    setActiveTab(item);
  };

  const handleDepartmentClick = (departmentId: number) => {
    router.push(`/department/${departmentId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchComponent />;
      case 'users':
        return <UserManagement />;
      case 'departments':
        return <DepartmentManagement />;
      default:
        return (
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            minHeight: '100vh',
            pt: 4,
            pb: 4
          }}>
            <Container maxWidth="lg">
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 6, color: 'white' }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Институт Управления и Цифровых Технологий
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Система управления подразделениями
                </Typography>
                
                {/* Search Bar */}
                <Box sx={{ 
                  mt: 4, 
                  display: 'flex', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <Card sx={{ 
                    width: '100%', 
                    maxWidth: 600, 
                    borderRadius: 25,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}>
                    <CardContent sx={{ p: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        px: 2,
                        py: 1
                      }}>
                        <SearchIcon sx={{ color: 'text.secondary', mr: 2 }} />
                        <Typography sx={{ flexGrow: 1, color: 'text.secondary' }}>
                          Поиск сотрудников и подразделений...
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Departments Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: 'white', mb: 3, fontWeight: 'bold' }}>
                  Все подразделения
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                ) : (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)'
                    },
                    gap: 3
                  }}>
                    {departments.map((department) => (
                      <Box key={department.id}>
                        <Card 
                          sx={{ 
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'visible',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: '0 16px 64px rgba(0,0,0,0.15)',
                            }
                          }}
                          onClick={() => handleDepartmentClick(department.id)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* Department Tag */}
                            {department.tag && (
                              <Box sx={{ position: 'absolute', top: -8, right: 16 }}>
                                <Chip
                                  label={department.tag}
                                  sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                            )}

                            {/* Department Icon */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  fontSize: '1.5rem'
                                }}
                              >
                                <Business fontSize="large" />
                              </Avatar>
                            </Box>

                            {/* Department Name */}
                            <Typography 
                              variant="h6" 
                              align="center" 
                              sx={{ 
                                fontWeight: 'bold',
                                mb: 1,
                                fontSize: '1.1rem'
                              }}
                            >
                              {department.name}
                            </Typography>

                            {/* User Count */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mt: 2
                            }}>
                              <PersonIcon sx={{ fontSize: 18, mr: 0.5 }} />
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {department.userCount || 0} сотрудников
                              </Typography>
                            </Box>

                            {/* Moderator Info */}
                            {department.moderator && (
                              <Box sx={{ 
                                mt: 2, 
                                pt: 2, 
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                textAlign: 'center'
                              }}>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                  Модератор
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {department.moderator.firstName} {department.moderator.lastName}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Container>
          </Box>
        );
    }
  };

  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar onMenuItemClick={handleMenuItemClick} />
      {renderContent()}
    </Box>
  );
};

export default HomePage;
