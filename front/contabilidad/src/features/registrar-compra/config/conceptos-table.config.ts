import type { Theme } from '@mui/material';

export function getInputSx(theme: Theme) {
  return {
    ...theme.typography.body2,
    width: '100%',
    '& .MuiInputBase-input': {
      p: 0,
      borderBottom: '1px solid transparent',
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: theme.palette.grey[400] },
      '&:focus': { borderColor: theme.palette.primary.main },
    },
  };
}

export function getNewRowInputSx(theme: Theme) {
  return {
    ...theme.typography.body2,
    width: '100%',
    '& .MuiInputBase-input': {
      p: '2px 0',
      borderBottom: '1px solid',
      borderColor: theme.palette.grey[300],
      borderRadius: 0,
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: theme.palette.grey[500] },
      '&:focus': { borderColor: theme.palette.primary.main, borderBottomWidth: '2px', marginBottom: '-1px' },
      '&::placeholder': { color: theme.palette.text.secondary, opacity: 0.7, fontStyle: 'italic' },
    },
  };
}

export function buildGridTemplate(hideDistribucion?: boolean, hasFiscalData?: boolean) {
  const cols = ['70px', '1fr', '45px', '100px', '100px'];
  if (!hideDistribucion) cols.push('55px');
  if (hasFiscalData) cols.push('120px');
  cols.push('30px');
  return cols.join(' ');
}
