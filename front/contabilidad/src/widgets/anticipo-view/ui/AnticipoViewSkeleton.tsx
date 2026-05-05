import { Box, Divider, Skeleton } from '@mui/material';

export function AnticipoViewSkeleton() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)', p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header: OXP-ANT-xxx + Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'grey.50', borderRadius: 1, px: 2, py: 1.25 }}>
        <Skeleton variant="text" width={170} height={24} />
        <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: '12px' }} />
      </Box>

      {/* Body: fields left + saldos card right */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left: form fields */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Medio de pago + Fecha transacción */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Skeleton variant="text" width={90} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={110} height={20} />
            </Box>
            <Box>
              <Skeleton variant="text" width={120} height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          </Box>
          {/* Tercero */}
          <Box>
            <Skeleton variant="text" width={50} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={400} height={20} />
          </Box>
          {/* Soporte */}
          <Box>
            <Skeleton variant="text" width={50} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={350} height={20} />
          </Box>
          {/* Justificación */}
          <Box>
            <Skeleton variant="text" width={80} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
        </Box>

        {/* Right: saldos card */}
        <Box sx={{ width: 260, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
          {/* Total anticipo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={90} height={16} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
          <Divider />
          {/* Saldo por pagar */}
          <Skeleton variant="text" width={100} height={16} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={50} height={14} />
            <Skeleton variant="text" width={60} height={14} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={60} height={14} />
            <Skeleton variant="text" width={90} height={14} />
          </Box>
          <Divider />
          {/* Saldo por regularizar */}
          <Skeleton variant="text" width={120} height={16} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={80} height={14} />
            <Skeleton variant="text" width={60} height={14} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={60} height={14} />
            <Skeleton variant="text" width={90} height={14} />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Pagos realizados section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="text" width={130} height={22} />
          <Skeleton variant="rounded" width={28} height={20} sx={{ borderRadius: '10px' }} />
        </Box>
        <Skeleton variant="circular" width={20} height={20} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
        <Skeleton variant="text" width={40} height={14} />
        <Skeleton variant="text" width={80} height={14} />
        <Skeleton variant="text" width={50} height={14} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={90} height={14} />
      </Box>

      <Divider />

      {/* Obligaciones amortizadas section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="text" width={180} height={22} />
          <Skeleton variant="rounded" width={28} height={20} sx={{ borderRadius: '10px' }} />
        </Box>
        <Skeleton variant="circular" width={20} height={20} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, px: 1 }}>
        <Skeleton variant="text" width={40} height={14} />
        <Skeleton variant="text" width={80} height={14} />
        <Skeleton variant="text" width={50} height={14} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={110} height={14} />
      </Box>
    </Box>
  );
}
