import { Box, Tab, Tabs } from '@mui/material';
import { ComprasPanel } from './ComprasPanel';
import { DevolucionesPanel } from './DevolucionesPanel';
import { AnticiposPanel } from './AnticiposPanel';
import { ExtractosPanel } from './ExtractosPanel';
import { useObligacionesTable } from '../hooks/useObligacionesTable';

const TAB_LABELS = ['Compras', 'Devoluciones', 'Anticipos', 'Extractos'];

interface ObligacionesTableProps {
  onTabChange?: (tabLabel: string) => void;
}

export const ObligacionesTable = ({ onTabChange }: ObligacionesTableProps) => {
  const { activeTab, setActiveTab, comercios, isPendingComercio, extractos, isPendingExtracto, anticipos, isPendingAnticipo, devoluciones, isPendingDevolucion } = useObligacionesTable();

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={(_e, val: number) => {
          setActiveTab(val);
          onTabChange?.(TAB_LABELS[val]);
        }}
        sx={{
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
          },
        }}
      >
        {TAB_LABELS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 0 && <ComprasPanel rows={comercios} isPending={isPendingComercio} />}
        {activeTab === 1 && <DevolucionesPanel rows={devoluciones} isPending={isPendingDevolucion} />}
        {activeTab === 2 && <AnticiposPanel apiRows={anticipos} isPendingApi={isPendingAnticipo} />}
        {activeTab === 3 && <ExtractosPanel rows={extractos} isPending={isPendingExtracto} />}
      </Box>
    </Box>
  );
};
