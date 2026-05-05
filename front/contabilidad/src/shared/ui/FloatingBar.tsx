import { Box, Button, Typography } from '@mui/material';

interface FloatingBarAction {
  label: string;
  variant: 'text' | 'contained';
  onClick?: () => void;
}

interface FloatingBarProps {
  selectedCount: number;
  actions: FloatingBarAction[];
}

export function FloatingBar({ selectedCount, actions }: FloatingBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 1,
        border: '0.5px solid',
        borderColor: 'primary.light',
        background: (theme) =>
          `linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), ${theme.palette.background.paper}`,
        overflow: 'hidden',
      }}
    >
      <Typography variant="body2" color="text.primary">
        {selectedCount} elementos seleccionados
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            color="primary"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
