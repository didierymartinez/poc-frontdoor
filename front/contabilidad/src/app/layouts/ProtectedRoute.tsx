import { useEffect } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import { CircularProgress, Box } from '@mui/material';
import { MainLayout } from '@/app/layouts/MainLayout';
import { httpClient } from '@/shared/api';

export const ProtectedRoute = () => {
  const { isLoading, user, signIn, getAccessToken } = useAuth();

  useEffect(() => {
    httpClient.configure({ getAccessToken });
  }, [getAccessToken]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    signIn();
    return null;
  }

  return <MainLayout />;
};
