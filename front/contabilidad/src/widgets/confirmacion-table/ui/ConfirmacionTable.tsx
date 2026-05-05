import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ObligacionesPanel } from './ObligacionesPanel';
import { ConciliacionesPanel } from './ConciliacionesPanel';

const TAB_LABELS = ['Obligaciones', 'Conciliaciones'];

export function ConfirmacionTable() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={(_e, val: number) => setActiveTab(val)}
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
        {activeTab === 0 && <ObligacionesPanel />}
        {activeTab === 1 && <ConciliacionesPanel />}
      </Box>
    </Box>
  );
}
