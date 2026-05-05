import { Box, Skeleton } from '@mui/material';

export function CompraViewSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top bar */}
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />

      {/* Two-column area */}
      <Box sx={{ display: 'flex', gap: 1.5, height: 280 }}>
        {/* Left: form fields skeleton */}
        <Box sx={{ width: '55%', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 1, bgcolor: 'grey.100' }} />
        </Box>
        {/* Right: resumen skeleton */}
        <Skeleton variant="rectangular" sx={{ flex: 1, height: '100%', borderRadius: 1, bgcolor: 'grey.100' }} />
      </Box>

      {/* Conceptos table skeleton */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rectangular" height={22} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
      </Box>
    </Box>
  );
}
