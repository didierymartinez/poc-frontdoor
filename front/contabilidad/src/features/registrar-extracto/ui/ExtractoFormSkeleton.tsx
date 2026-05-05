import { Box, Skeleton } from '@mui/material';

export function ExtractoFormSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="rectangular" height={40} width={150} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rectangular" height={40} width={150} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rectangular" height={40} width={200} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
      </Box>
      <Skeleton variant="rectangular" height={24} width={80} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
    </Box>
  );
}
