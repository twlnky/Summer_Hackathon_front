'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginForm onSuccess={handleLoginSuccess} />;
};

export default LoginPage; 