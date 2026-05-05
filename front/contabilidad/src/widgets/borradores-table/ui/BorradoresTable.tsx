import { Box, Tab, Tabs } from '@mui/material';
import { useBorradoresTable } from '../hooks/useBorradoresTable';
import { ObligacionesPanel } from './ObligacionesPanel';
import { ExtractosPanel } from './ExtractosPanel';
import { AnticiposBorradoresPanel } from './AnticiposBorradoresPanel';

const TAB_LABELS = ['Obligaciones', 'Extractos', 'Anticipos'];

export function BorradoresTable() {
  const { activeTab, setActiveTab, comercios, isPendingComercio, extractos, isPendingExtracto, anticipos, isPendingAnticipo } =
    useBorradoresTable();

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={(_e, val: number) => setActiveTab(val)}
        sx={{
          minHeight: 40,
          '& .MuiTab-root': { minHeight: 40, textTransform: 'none' },
        }}
      >
        {TAB_LABELS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 0 && <ObligacionesPanel rows={comercios} isPending={isPendingComercio} />}
        {activeTab === 1 && <ExtractosPanel rows={extractos} isPending={isPendingExtracto} />}
        {activeTab === 2 && <AnticiposBorradoresPanel rows={anticipos} isPending={isPendingAnticipo} />}
      </Box>
    </Box>
  );
}
