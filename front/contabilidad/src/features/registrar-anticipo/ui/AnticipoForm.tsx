import type { Anticipo as AnticipoData, AgregadoAnticipo } from '@/entities/borrador';
import { FormularioAnticipoComplete } from './FormularioAnticipoComplete';
import { FormularioAnticipoEmpty } from './FormularioAnticipoEmpty';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnticipoForm({ variant = 'complete', data, agregado, hideDistribucion, errorFields = [], onMontoChange }: { variant?: 'complete' | 'empty'; data?: AnticipoData; agregado?: AgregadoAnticipo; hideDistribucion?: boolean; errorFields?: string[]; onMontoChange?: (v: number) => void }) {
  return variant === 'complete' ? <FormularioAnticipoComplete data={data} agregado={agregado} hideDistribucion={hideDistribucion} errorFields={errorFields} onMontoChange={onMontoChange} /> : <FormularioAnticipoEmpty />;
}
