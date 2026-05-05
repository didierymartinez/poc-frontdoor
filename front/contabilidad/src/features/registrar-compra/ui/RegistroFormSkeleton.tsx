import { Box, Skeleton } from '@mui/material';

export function RegistroFormSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header: OXP-COM-xxx + Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'grey.50', borderRadius: 1, px: 2, py: 1.25 }}>
        <Skeleton variant="text" width={180} height={24} />
        <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: '12px' }} />
      </Box>

      {/* Body: fields left + summary card right */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left: form fields */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* No. Documento + Fecha documento */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Skeleton variant="text" width={90} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={60} height={20} />
            </Box>
            <Box>
              <Skeleton variant="text" width={110} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
          {/* Tercero */}
          <Box>
            <Skeleton variant="text" width={50} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={320} height={20} />
          </Box>
          {/* Soporte */}
          <Box>
            <Skeleton variant="text" width={50} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={380} height={20} />
          </Box>
          {/* Observaciones */}
          <Box>
            <Skeleton variant="text" width={90} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={260} height={20} />
          </Box>
        </Box>

        {/* Right: summary card */}
        <Box sx={{ width: 220, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={70} height={16} />
            <Skeleton variant="text" width={90} height={16} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={40} height={20} />
            <Skeleton variant="text" width={120} height={28} />
          </Box>
        </Box>
      </Box>

      {/* Conceptos header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={90} height={22} />
        <Skeleton variant="text" width={80} height={20} />
      </Box>

      {/* Conceptos table header */}
      <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
        <Skeleton variant="text" width={60} height={14} />
        <Skeleton variant="text" width={180} height={14} />
        <Skeleton variant="text" width={40} height={14} />
        <Skeleton variant="text" width={80} height={14} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={80} height={14} />
        <Skeleton variant="text" width={100} height={14} />
      </Box>

      {/* Conceptos table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Skeleton variant="text" width={60} height={18} />
          <Skeleton variant="text" width={220} height={18} />
          <Skeleton variant="text" width={30} height={18} />
          <Skeleton variant="text" width={90} height={18} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="text" width={20} height={18} />
          <Skeleton variant="text" width={160} height={18} />
        </Box>
      ))}
    </Box>
  );
}
