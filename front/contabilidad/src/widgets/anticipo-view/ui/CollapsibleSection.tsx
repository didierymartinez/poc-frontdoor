import { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Typography,
} from '@mui/material';
import {
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  emptyTitle?: string;
  children?: React.ReactNode;
}

export function CollapsibleSection({ title, count, emptyTitle, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 1,
          cursor: 'pointer',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {title}
          </Typography>
          <Chip
            label={String(count).padStart(2, '0')}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              bgcolor: 'grey.100',
              color: 'text.primary',
              fontWeight: 500,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
        {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </Box>
      <Collapse in={open}>
        <Box sx={{ py: 1.5, px: 1 }}>
          {children ?? <EmptyState title={emptyTitle ?? ''} />}
        </Box>
      </Collapse>
    </Box>
  );
}
