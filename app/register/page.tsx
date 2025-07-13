'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleRegisterSuccess = () => {
    router.push('/login');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return <RegisterForm onSuccess={handleRegisterSuccess} />;
};

export default RegisterPage; 