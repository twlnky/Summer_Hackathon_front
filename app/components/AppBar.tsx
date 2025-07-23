'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItemButton,
  TextField,
  InputAdornment,
  Paper,
  Popper,
  ClickAwayListener,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  People,
  Business,
  Login,
  Logout,
  PersonAdd,
  Home,
} from '@mui/icons-material';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SearchService from '../services/searchService';
import { Department, User, UserWithRole } from '../types';
import RoleService from '../services/roleService';

interface AppBarProps {
  onMenuItemClick: (item: string) => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuItemClick }) => {
  console.log('AppBar: Компонент отрендерен, onMenuItemClick получен:', typeof onMenuItemClick); // Отладочная информация
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ departments: Department[], users: User[] }>({ departments: [], users: [] });
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  
  // Состояния для карточки сотрудника

  
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Debounce для поиска в AppBar
  useEffect(() => {
    console.log('AppBar: Запущен debounce таймер для:', searchQuery);
    const timer = setTimeout(() => {
      console.log('AppBar: Debounce завершен, устанавливаем debouncedSearchQuery:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Задержка 500ms

    return () => {
      console.log('AppBar: Debounce таймер отменен');
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Выполняем поиск только когда изменяется debouncedSearchQuery
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim()) {
        setSearchOpen(true);
        try {
          console.log('AppBar: Выполняем поиск для:', debouncedSearchQuery);
          const response = await SearchService.search(debouncedSearchQuery);
          setSearchResults({
            departments: response.departments || [],
            users: response.users || []
          });
        } catch (error) {
          console.error('Ошибка поиска:', error);
          setSearchResults({ departments: [], users: [] });
        }
      } else {
        setSearchOpen(false);
        setSearchResults({ departments: [], users: [] });
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    router.push('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    console.log('AppBar: Изменился поисковый запрос:', query);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleSearchItemClick = (type: 'department' | 'user', id: number) => {
    console.log('AppBar: Клик по элементу поиска:', type, id); // Отладочная информация
    if (type === 'department') {
      router.push(`/department/${id}`);
    } else if (type === 'user') {
      // Перейти на страницу пользователя
      router.push(`/users/${id}`);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Остальные функции компонента...

  const handleSearchClickAway = () => {
    setSearchOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Главная', icon: <Home /> },
    { id: 'users', label: 'Пользователи', icon: <People /> },
    { id: 'departments', label: 'Департаменты', icon: <Business /> },
  ];

  const handleMenuItemClick = (item: string) => {
    console.log('AppBar: Переключение на вкладку:', item); // Отладочная информация
    onMenuItemClick(item);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderNavItems = () => (
    <List>
      {menuItems.map((item) => (
        <ListItemButton
          key={item.id}
          onClick={() => handleMenuItemClick(item.id)}
        >
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  // @ts-ignore
  // @ts-ignore
  return (
    <>
      <MuiAppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: '#2C3E50',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 12px rgba(44, 62, 80, 0.15)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ py: 0.5, minHeight: 64 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* Логотип РУТ МИИТ */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 3,
                p: 1,
              }}
            >
              <Box 
                sx={{ 
                  mr: 2, 
                  width: 180, 
                  height: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/rut-miit-official-logo.png"
                  alt="РУТ МИИТ Logo"
                  width={180}
                  height={58}
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
            
            {/* Search Bar - доступен всем пользователям */}
            <ClickAwayListener onClickAway={handleSearchClickAway}>
              <Box 
                component="form" 
                onSubmit={handleSearchSubmit}
                sx={{ 
                  flexGrow: 1, 
                  maxWidth: { xs: 250, sm: 350, md: 450 }, 
                  mr: 3,
                  position: 'relative'
                }}
              >
                  <TextField
                    size="small"
                    placeholder="Поиск сотрудников и департаментов..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    ref={(el) => setSearchAnchorEl(el)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColori: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        fontWeight: 500,
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          opacity: 1,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Search Results Dropdown */}
                  <Popper
                    open={searchOpen && (searchResults.departments.length > 0 || searchResults.users.length > 0)}
                    anchorEl={searchAnchorEl}
                    placement="bottom-start"
                    sx={{ zIndex: 1300, width: searchAnchorEl?.clientWidth || 'auto' }}
                  >
                    <Paper 
                      className="card-modern animate-fade-in"
                      sx={{ 
                        mt: 1, 
                        maxHeight: 400, 
                        overflow: 'auto',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                      }}
                    >
                      {searchResults.departments.length > 0 && (
                        <>
                          <Box sx={{ p: 2, pb: 1 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#2563eb', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              Департаменты
                            </Typography>
                          </Box>
                          {searchResults.departments.map((department) => (
                            <MenuItem
                              key={`dept-${department.id}`}
                              onClick={() => handleSearchItemClick('department', department.id)}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                py: 1.5,
                                px: 2,
                                borderRadius: 2,
                                mx: 1,
                                mb: 0.5,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                                  color: 'white',
                                  transform: 'translateX(4px)',
                                }
                              }}
                            >
                              <Business sx={{ 
                                mr: 2, 
                                color: 'inherit',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  lineHeight: 1.3,
                                }}>
                                  {department.name}
                                </Typography>
                                {department.tag && (
                                  <Typography variant="caption" sx={{ 
                                    opacity: 0.8,
                                    fontWeight: 500,
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'normal',
                                    display: 'block',
                                  }}>
                                    {department.tag}
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </>
                      )}
                      
                      {searchResults.users.length > 0 && (
                        <>
                          {searchResults.departments.length > 0 && <Divider sx={{ my: 1 }} />}
                          <Box sx={{ p: 2, pb: 1 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#2C3E50', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              Сотрудники
                            </Typography>
                          </Box>
                          {searchResults.users.map((user) => (
                            <MenuItem
                              key={`user-${user.id}`}
                              onClick={() => handleSearchItemClick('user', user.id)}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                py: 1.5,
                                px: 2,
                                borderRadius: 2,
                                mx: 1,
                                mb: 0.5,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                                  color: 'white',
                                  transform: 'translateX(4px)',
                                }
                              }}
                            >
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  width: 32, 
                                  height: 32, 
                                  fontSize: '0.875rem',
                                  background: '#2C3E50',
                                  color: 'white',
                                  fontWeight: 600,
                                  boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
                                }}
                              >
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  lineHeight: 1.3,
                                }}>
                                  {[user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ')}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  component="a"
                                  href={`mailto:${user.email}`}
                                  sx={{ 
                                    opacity: 0.8,
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'normal',
                                    display: 'block',
                                    '&:hover': {
                                      color: 'primary.main',
                                      cursor: 'pointer'
                                    }
                                  }}
                                >
                                  {user.email}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Paper>
                  </Popper>
                </Box>
              </ClickAwayListener>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleMenuItemClick(item.id)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {isAuthenticated ? (
            <Box sx={{ ml: 2 }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Typography variant="body2" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  {user && user.authorities[0].authority === "ADMIN" ? "Администратор" : (`Модератор ${user?.username}`)}
                </Typography>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 3,
                    mt: 1,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                {user && (
                  <MenuItem 
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      mx: 1,
                      mb: 1,
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                      background: 'rgba(37, 99, 235, 0.05)',
                      cursor: 'default',
                      '&:hover': {
                        background: 'rgba(37, 99, 235, 0.1)',
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.875rem',
                        background: '#2563eb',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {[user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ')}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                        {user.email}
                      </Typography>
                      {user.role && (
                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 500, display: 'block' }}>
                          Роль: {RoleService.getRoleLabel(user.role || 'USER')}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Logout sx={{ mr: 2 }} />
                  Выход
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => router.push('/login')}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                Авторизация
              </Button>
            </Box>
          )}
        </Toolbar>
      </MuiAppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRight: '1px solid rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}>
            <Image
              src="/rut-miit-official-logo.png"
              alt="РУТ МИИТ Logo"
              width={60}
              height={45}
              style={{
                objectFit: 'contain',
              }}
            />
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 700,
            }}>
              РУТ МИИТ
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              textAlign: 'center',
              fontWeight: 500,
            }}>
              Институт управления и цифровых технологий
            </Typography>
          </Box>
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                    color: 'white',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}
    </>
  );
};

export default AppBar; 