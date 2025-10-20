"use client";
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../createEmotionCache';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme';
import { AuthProvider } from '../app/contexts/AuthContext';

const clientSideEmotionCache = createEmotionCache();

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>

  );
}
