'use client';

import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AppBarProps {
  onMenuItemClick: (item: string) => void;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuItemClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const menuItems = [
    { id: 'home', label: 'Главная', icon: <Home /> },
    { id: 'search', label: 'Поиск', icon: <Search /> },
    { id: 'users', label: 'Пользователи', icon: <People /> },
    { id: 'departments', label: 'Департаменты', icon: <Business /> },
  ];

  const handleMenuItemClick = (item: string) => {
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

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Управление персоналом
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleMenuItemClick(item.id)}
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
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  U
                </Avatar>
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
              >
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ ml: 2 }}>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => router.push('/login')}
                sx={{ mr: 1 }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                startIcon={<PersonAdd />}
                onClick={() => router.push('/register')}
              >
                Регистрация
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {renderNavItems()}
        </Drawer>
      )}
    </>
  );
};

export default AppBar; 