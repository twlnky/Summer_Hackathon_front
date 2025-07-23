'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Search as SearchIcon, Person, Business } from '@mui/icons-material';
import { SearchResponse, User, Department } from '../types';
import SearchService from '../services/searchService';

const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const handleSearch = async (searchQuery: string, currentPage: number = 1) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await SearchService.search(searchQuery, {
        page: currentPage - 1,
        size: 10,
      });
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query, page);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    handleSearch(query, value);
  };

  const renderUser = (user: User) => (
    <ListItem key={user.id}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {(user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={[user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ')}
        secondary={
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              component="a"
              href={`mailto:${user.email}`}
              sx={{ 
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  color: 'primary.main',
                  cursor: 'pointer'
                }
              }}
            >
              {user.email}
            </Typography>
            {user.position && (
              <Typography variant="body2" color="text.secondary">
                {user.position}
              </Typography>
            )}
            {user.personalPhone && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                component="a"
                href={`tel:${user.personalPhone}`}
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    color: 'primary.main',
                    cursor: 'pointer'
                  }
                }}
              >
                {user.personalPhone}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  const renderDepartment = (department: Department) => (
    <ListItem key={department.id}>
      <ListItemAvatar>
        <Avatar>
          <Business />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={department.name}
        secondary="Департамент"
      />
    </ListItem>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Поиск
      </Typography>

      <TextField
        fullWidth
        placeholder="Поиск пользователей и департаментов..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && !loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}
        >
          {results.users.length > 0 && (
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2">
                      Пользователи
                    </Typography>
                    <Chip
                      label={results.users.length}
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <List>
                    {results.users.map((user, index) => (
                      <React.Fragment key={user.id}>
                        {renderUser(user)}
                        {index < results.users.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}

          {results.departments.length > 0 && (
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2">
                      Департаменты
                    </Typography>
                    <Chip
                      label={results.departments.length}
                      color="secondary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <List>
                    {results.departments.map((department, index) => (
                      <React.Fragment key={department.id}>
                        {renderDepartment(department)}
                        {index < results.departments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      {results && results.pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={results.pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {results && results.users.length === 0 && results.departments.length === 0 && query.trim() && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Ничего не найдено по запросу "{query}"
        </Alert>
      )}
    </Box>
  );
};

export default SearchComponent; 