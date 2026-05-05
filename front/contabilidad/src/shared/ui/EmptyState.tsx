import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import orbitsSvg from '@/shared/assets/EmptyState/Orbits.svg';

interface EmptyStateProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const EmptyState = ({ title, description, actions }: EmptyStateProps) => {
  return (
    <Box
      data-testid="empty-state"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        borderRadius: 1,
        px: 1,
        py: 1.5,
        minHeight: 246,
      }}
    >
      {/* Illustration */}
      <Box
        component="img"
        src={orbitsSvg}
        alt=""
        sx={{ width: 138, height: 83 }}
      />

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle2" color="text.secondary" textAlign="center" sx={{ width: '100%' }}>
            {description}
          </Typography>
        )}
      </Box>

      {/* Optional actions */}
      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};
