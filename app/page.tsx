'use client';

import { useState } from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import AppBar from './components/AppBar';
import SearchComponent from './components/SearchComponent';
import UserManagement from './components/UserManagement';
import DepartmentManagement from './components/DepartmentManagement';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleMenuItemClick = (item: string) => {
    setActiveTab(item);
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
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Система управления персоналом
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Добро пожаловать в систему управления персоналом и департаментами
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                mt: 3
              }}
            >
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Поиск
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Быстрый поиск сотрудников и департаментов по всем полям
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Пользователи
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Управление сотрудниками: создание, редактирование, удаление
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Департаменты
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Управление структурой организации и департаментами
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Container>
        );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography>Загрузка...</Typography>
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
