import { useState } from 'react';
import { Box, Divider, Skeleton } from '@mui/material';
import { DistribucionDialog } from '@/shared/ui';
import type { DestinoNegocio } from '@/entities/borrador';
import { ViewHeader } from './ViewHeader';
import { DatosCompra } from './DatosCompra';
import { ResumenFinanciero } from './ResumenFinanciero';
import { ConceptosTable } from './ConceptosSection';

interface ConceptoView {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor: number;
  impuestos: { tipo: string; base: string; tarifa: string; valor: string; valorNum: number }[];
  retenciones: { tipo: string; base: string; tarifa: string; valor: string; valorNum: number }[];
}

export interface CompraViewProps {
  loading?: boolean;
  codigo?: string;
  estado?: string;
  estadoColor?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';
  tercero?: string;
  descripcion?: string;
  documento?: { numero: string; tipo: number; fecha: string } | null;
  moneda?: string;
  totalFormatted?: string;
  totalBruto?: string;
  totalImpuestos?: string;
  totalRetenciones?: string;
  funcional?: string;
  trm?: { moneda: number; valor: number } | null;
  conceptos?: ConceptoView[];
  distribucion?: DestinoNegocio[];
  archivos?: { container: string; key: string }[];
  onOpenSoporte?: () => void;
}

export function CompraView({
  loading,
  codigo = '',
  estado = 'Pendiente',
  estadoColor = 'warning',
  tercero,
  descripcion,
  documento,
  moneda = 'COP',
  totalFormatted = '$0,00',
  totalBruto = '$0,00',
  totalImpuestos = '$0,00',
  totalRetenciones = '$0,00',
  funcional,
  trm,
  conceptos = [],
  distribucion = [],
  archivos = [],
  onOpenSoporte,
}: CompraViewProps) {
  const [distribucionOpen, setDistribucionOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)', p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Header: código + chip estado */}
        <Skeleton variant="rectangular" height={40} width={320} sx={{ borderRadius: 1 }} />

        {/* Datos + Resumen financiero */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* No. Documento + Fecha */}
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Skeleton width={90} height={14} />
                <Skeleton width={60} height={18} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Skeleton width={100} height={14} />
                <Skeleton width={80} height={18} />
              </Box>
            </Box>
            {/* Tercero */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Skeleton width={50} height={14} />
              <Skeleton width={340} height={18} />
            </Box>
            {/* Soporte */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Skeleton width={50} height={14} />
              <Skeleton width={280} height={18} />
            </Box>
            {/* Observaciones */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Skeleton width={90} height={14} />
              <Skeleton width={250} height={18} />
            </Box>
          </Box>
          {/* Resumen financiero */}
          <Skeleton variant="rectangular" width={280} height={120} sx={{ borderRadius: 1 }} />
        </Box>

        <Divider />

        {/* Conceptos header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={80} height={22} />
          <Skeleton width={90} height={22} />
        </Box>
        {/* Conceptos rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Skeleton variant="rectangular" height={24} sx={{ borderRadius: 0.5 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 0.5 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <ViewHeader codigo={codigo} estado={estado} estadoColor={estadoColor} />

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <DatosCompra
            tercero={tercero}
            descripcion={descripcion}
            documento={documento}
            archivos={archivos}
            distribucion={distribucion}
            onDistribuir={() => setDistribucionOpen(true)}
            onOpenSoporte={onOpenSoporte}
          />
        </Box>
        <ResumenFinanciero
          totalFormatted={totalFormatted}
          moneda={moneda}
          totalBruto={totalBruto}
          totalImpuestos={totalImpuestos}
          totalRetenciones={totalRetenciones}
          funcional={funcional}
          trm={trm}
          conceptos={conceptos}
        />
      </Box>

      {conceptos.length > 0 && (
        <>
          <Divider />
          <ConceptosTable conceptos={conceptos} />
        </>
      )}

      <DistribucionDialog
        open={distribucionOpen}
        onClose={() => setDistribucionOpen(false)}
        options={[]}
        initialItems={[]}
      />
    </Box>
  );
}
