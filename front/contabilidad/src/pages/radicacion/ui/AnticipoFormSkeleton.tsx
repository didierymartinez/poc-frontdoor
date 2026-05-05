import { Box, Skeleton } from '@mui/material';

export function AnticipoFormSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" height={32} width={230} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
          <Skeleton variant="rectangular" height={32} sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" height={32} width={230} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
          <Skeleton variant="rectangular" height={32} sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
        </Box>
        <Skeleton variant="rectangular" height={32} width={230} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      </Box>
      <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
    </Box>
  );
}
