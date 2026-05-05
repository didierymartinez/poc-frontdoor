import { Box, Divider, Skeleton } from '@mui/material';

export function ConciliarSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header: OXP-EXT-xxx + Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'grey.50', borderRadius: 1, px: 2, py: 1.25 }}>
        <Skeleton variant="text" width={180} height={24} />
        <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: '12px' }} />
      </Box>

      {/* Info row: Entidad bancaria + Medio de pago + Periodo + Total card */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        <Box>
          <Skeleton variant="text" width={100} height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={150} height={20} />
        </Box>
        <Box>
          <Skeleton variant="text" width={90} height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={200} height={20} />
        </Box>
        <Box>
          <Skeleton variant="text" width={110} height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width={180} height={20} />
        </Box>
        <Box sx={{ ml: 'auto', border: '1px solid', borderColor: 'grey.200', borderRadius: 1, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
          <Skeleton variant="text" width={30} height={14} />
          <Skeleton variant="text" width={150} height={24} />
        </Box>
      </Box>

      <Divider />

      {/* Partidas title */}
      <Skeleton variant="text" width={70} height={22} />

      {/* Tabs + Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '14px' }} />
          <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '14px' }} />
          <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: '14px' }} />
        </Box>
        <Skeleton variant="rounded" width={180} height={32} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Table header */}
      <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
        <Skeleton variant="text" width={24} height={14} />
        <Skeleton variant="text" width={50} height={14} />
        <Skeleton variant="text" width={140} height={14} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={80} height={14} />
        <Skeleton variant="text" width={100} height={14} />
        <Skeleton variant="text" width={60} height={14} />
      </Box>

      {/* Table rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Skeleton variant="text" width={20} height={18} />
          <Skeleton variant="text" width={10} height={18} />
          <Skeleton variant="text" width={160} height={18} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="text" width={80} height={18} />
          <Skeleton variant="text" width={110} height={18} />
          <Skeleton variant="text" width={70} height={18} />
        </Box>
      ))}
    </Box>
  );
}
