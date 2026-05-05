import { useState } from 'react';
import { Box } from '@mui/material';
import { DistribucionDialog } from '@/shared/ui';
import type { Comercio } from '@/entities/borrador';
import { RegistroHeader } from './RegistroHeader';
import { FormularioComercio } from './FormularioComercio';
import { ConceptosTable } from './ConceptosTable';
import { AdjuntosSection } from './AdjuntosSection';
import { ObservacionesSection } from './ObservacionesSection';
import { RegistroFormSkeleton } from './RegistroFormSkeleton';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface RegistroFormProps {
  data?: Comercio;
  borradorConceptos?: import('@/entities/borrador').ConceptoRadicacion[];
  isPending?: boolean;
  fromOcr?: boolean;
  errorFields?: string[];
  onTotalChange?: (total: number) => void;
  onFiscalChange?: (summary: import('../hooks/useConceptosTable').FiscalSummary) => void;
  montoOverride?: number | null;
  onMontoChange?: (v: number) => void;
  mode?: 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';
  oxpId?: string;
  archivosVinculados?: import('@/entities/borrador').StorageInfo[];
  archivoNombre?: string;
  highlightsEnabled?: boolean;
  onOpenDocument?: (url: string, nombre: string) => void;
  onClearHighlights?: () => void;
  onRestoreHighlights?: () => void;
}

export const RegistroForm = ({ data, borradorConceptos, isPending, fromOcr, errorFields = [], onTotalChange, onFiscalChange, montoOverride, onMontoChange, mode = 'borrador', oxpId, archivosVinculados, archivoNombre, highlightsEnabled, onOpenDocument, onClearHighlights, onRestoreHighlights }: RegistroFormProps) => {
  const [sugeridaOpen, setSugeridaOpen] = useState(false);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {isPending ? (
        <RegistroFormSkeleton />
      ) : (
        <>
          <RegistroHeader data={data} mode={mode} />

          <FormularioComercio data={data} onVerSugerida={() => setSugeridaOpen(true)} hideDistribucion={fromOcr} errorFields={errorFields} montoOverride={montoOverride} onMontoChange={onMontoChange} mode={mode} highlightsEnabled={highlightsEnabled} />

          <ConceptosTable data={data} borradorConceptos={borradorConceptos} hideDistribucion={fromOcr} hasError={errorFields.includes('conceptos')} onTotalChange={onTotalChange} onFiscalChange={onFiscalChange} highlightsEnabled={highlightsEnabled} />

          <AdjuntosSection mode={mode} oxpId={oxpId} archivosVinculados={archivosVinculados} archivoNombre={archivoNombre} onOpenDocument={onOpenDocument} onClearHighlights={onClearHighlights} onRestoreHighlights={onRestoreHighlights} />

          <ObservacionesSection data={data} hasError={errorFields.includes('descripcion')} mode={mode} />

          {!fromOcr && (
            <DistribucionDialog
              open={sugeridaOpen}
              onClose={() => setSugeridaOpen(false)}
              options={[]}
              initialItems={[]}
              aiGenerated
              confirmLabel="Aplicar distribución"
              cancelLabel="Descartar"
            />
          )}
        </>
      )}
    </Box>
  );
};
