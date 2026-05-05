import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { IconChartPie3, IconPaperclip } from '@tabler/icons-react';
import iaLabelSrc from '@/shared/assets/IA-label.svg';
import { DistribucionDialog, EmptyState } from '@/shared/ui';
import { EncabezadoDevolucion } from './EncabezadoDevolucion';
import type { ObligacionFuente } from './EncabezadoDevolucion';
import { ConceptosDevolucionTable } from './ConceptosDevolucionTable';
import { useFormularioDevolucion } from '../hooks/useFormularioDevolucion';
import type { TipoDevolucion } from '../hooks/useFormularioDevolucion';
import type { AgregadoOxpComercio, AgregadoOxpExtracto, AgregadoAnticipo } from '@/entities/borrador';
import { TIPO_CARGO_LABEL, MONEDA_MAP } from '@/entities/borrador';
import type { TipoOrigen } from '@/shared/model';

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FormularioDevolucionProps {
  data: ObligacionFuente;
  tipoOrigen: TipoOrigen | null;
  origenAgregado: AgregadoOxpComercio | AgregadoOxpExtracto | AgregadoAnticipo | null;
  onCambiarSeleccion?: () => void;
  onBuildPayload?: (buildPayload: () => FormData | null) => void;
  onTotalChange?: (total: number) => void;
  onDocumentoClick?: () => void;
}

export function FormularioDevolucion({ data, tipoOrigen, origenAgregado, onCambiarSeleccion, onBuildPayload, onTotalChange, onDocumentoClick }: FormularioDevolucionProps) {
  const theme = useTheme();
  const {
    tipoDevolucion, setTipoDevolucion,
    soporte, setSoporte,
    handleSoporteFileChange,
    montoParcial, setMontoParcial,
    conceptos,
    distribucionOpen, setDistribucionOpen,
    motivoReversa, setMotivoReversa,
    cargosFromOrigin, selectedCargoIds, toggleCargoSelection, toggleAllCargos,
    totalDevolucion,
    handleCantidadChange, handleValorChange,
    buildPayload,
  } = useFormularioDevolucion(data.totalCompra, tipoOrigen, origenAgregado);

  // Expose buildPayload and total to parent
  if (onBuildPayload) {
    onBuildPayload(buildPayload);
  }
  if (onTotalChange) {
    onTotalChange(totalDevolucion);
  }

  const showConceptos = tipoOrigen === 'compra';
  const showCargos = tipoOrigen === 'extracto';
  const showReversa = tipoOrigen === 'anticipo';

  return (
    <Stack spacing={3}>
      {/* Encabezado con datos de la obligación fuente */}
      <EncabezadoDevolucion data={data} tipoOrigen={tipoOrigen} onCambiarSeleccion={onCambiarSeleccion} onDocumentoClick={onDocumentoClick} />

      {/* Sección Devolución — solo para Comercio */}
      {showConceptos && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Devolución
            </Typography>
            <RadioGroup
              row
              value={tipoDevolucion}
              onChange={(e) => setTipoDevolucion(e.target.value as TipoDevolucion)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel value="total" control={<Radio size="small" />} label="Total" />
              <FormControlLabel value="parcial" control={<Radio size="small" />} label="Parcial" />
              <FormControlLabel value="por_concepto" control={<Radio size="small" />} label="Por concepto" />
            </RadioGroup>
          </Box>

          {/* Por concepto: DataGrid */}
          {tipoDevolucion === 'por_concepto' && (
            <Box sx={{ width: '100%', minHeight: 180 }}>
              <ConceptosDevolucionTable
                rows={conceptos}
                onCantidadChange={handleCantidadChange}
                onValorChange={handleValorChange}
              />
            </Box>
          )}

          {/* Parcial: TextField monto */}
          {tipoDevolucion === 'parcial' && (
            <TextField
              label="Monto"
              size="small"
              type="number"
              placeholder="0"
              value={montoParcial}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') { setMontoParcial(''); return; }
                const num = Number(val);
                if (num >= 0 && num <= data.totalCompra) setMontoParcial(val);
              }}
              slotProps={{ htmlInput: { min: 0, max: data.totalCompra, step: 'any' } }}
              sx={{ width: 258 }}
            />
          )}

          {/* Total pill (visible only for total) */}
          {tipoDevolucion === 'total' && (
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 1,
              px: 1.5, py: 0.5, width: 265, height: 32,
            }}>
              <Typography variant="subtitle2" color="text.primary">Total</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h6" color="text.primary">{fmt(totalDevolucion)}</Typography>
                <Typography variant="caption" color="text.primary">{data.moneda}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Extracto: tabla de cargos financieros con selección */}
      {showCargos && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Cargos financieros a devolver
          </Typography>
          {cargosFromOrigin.length === 0 ? (
            <EmptyState
              title="No hay cargos financieros"
              description="Este extracto no tiene cargos financieros disponibles para devolución."
            />
          ) : (
            <>
              {/* Header */}
              <Box sx={{
                display: 'grid', gridTemplateColumns: '36px 48px 120px 1fr 1fr',
                alignItems: 'center', bgcolor: 'grey.100', borderRadius: 1, height: 24, px: 1,
              }}>
                <Checkbox
                  size="small"
                  indeterminate={selectedCargoIds.size > 0 && selectedCargoIds.size < cargosFromOrigin.length}
                  checked={selectedCargoIds.size === cargosFromOrigin.length}
                  onChange={toggleAllCargos}
                  sx={{ p: 0 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>No.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Código</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Movimiento</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1, textAlign: 'right' }}>Valor</Typography>
              </Box>

              {/* Rows */}
              {cargosFromOrigin.map((c, i) => {
                const monedaLabel = MONEDA_MAP[c.valor.moneda] ?? 'COP';
                return (
                  <Box
                    key={c.id}
                    sx={{
                      display: 'grid', gridTemplateColumns: '36px 48px 120px 1fr 1fr',
                      alignItems: 'center', borderBottom: '0.5px solid', borderColor: 'grey.200',
                      height: 38, px: 1,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedCargoIds.has(c.id)}
                      onChange={() => toggleCargoSelection(c.id)}
                      sx={{ p: 0 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                      {c.id.slice(0, 6)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                      {TIPO_CARGO_LABEL[c.tipo] ?? `Cargo ${c.tipo}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, px: 1 }}>
                      <Typography variant="body2" color="text.primary">
                        {fmt(c.valor.valor)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {monedaLabel}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              {/* Total */}
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 1,
                px: 1.5, py: 0.5, width: 265, height: 32, mt: 1,
              }}>
                <Typography variant="subtitle2" color="text.primary">Total</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="h6" color="text.primary">{fmt(totalDevolucion)}</Typography>
                  <Typography variant="caption" color="text.primary">{data.moneda}</Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Anticipo: motivo de devolución con radio cards */}
      {showReversa && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Motivo de devolución
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { value: 'Proveedor incorrecto', description: 'Se registró el anticipo con un tercero equivocado.' },
              { value: 'Valor incorrecto', description: 'Se registró el anticipo con un valor equivocado.' },
            ].map((option) => {
              const selected = motivoReversa === option.value;
              return (
                <Box
                  key={option.value}
                  onClick={() => setMotivoReversa(option.value)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: selected ? 'rgba(47,67,208,0.5)' : 'grey.200',
                    bgcolor: selected ? 'rgba(47,67,208,0.08)' : 'grey.50',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: selected ? 'rgba(47,67,208,0.5)' : 'grey.400' },
                  }}
                >
                  <Radio size="small" checked={selected} sx={{ p: 0 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                    <Typography variant="subtitle2" color="text.primary">
                      {option.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Información adicional */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Información adicional
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Distribución de costos — solo Comercio */}
          {showConceptos && (
            <Box sx={{ flex: 1, position: 'relative', borderRadius: 1, px: 1.5, pt: 1.125, pb: 0.875 }}>
              <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: -7, left: 16 }}>
                Distribución de costos
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={() => setDistribucionOpen(true)}
                >
                  <Typography variant="body1" color="text.primary">Distribuir</Typography>
                  <IconChartPie3 size={16} color={theme.palette.text.primary} />
                </Box>
                <Link
                  component="button" underline="none"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}
                >
                  <Typography variant="body2" color="primary.main">Ver sugerida</Typography>
                  <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18 }} />
                </Link>
              </Box>
            </Box>
          )}

          {/* Soporte + Adjuntar */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <TextField
              label="Soporte"
              size="small"
              value={soporte}
              onChange={(e) => setSoporte(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' },
              }}
            />
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300',
              borderLeft: 'none', borderTopRightRadius: 4, borderBottomRightRadius: 4,
              px: 1.5, height: 32,
            }}>
              <Button
                variant="text"
                size="small"
                component="label"
                startIcon={<IconPaperclip size={14} />}
                sx={{ color: 'primary.main', whiteSpace: 'nowrap', minWidth: 'auto', fontSize: '0.75rem' }}
              >
                {soporte || 'Adjuntar archivo'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleSoporteFileChange(e.target.files?.[0] ?? null)}
                />
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Distribución de costos dialog */}
      {showConceptos && (
        <DistribucionDialog
          open={distribucionOpen}
          onClose={() => setDistribucionOpen(false)}
          options={[]}
          initialItems={[]}
          onConfirm={() => setDistribucionOpen(false)}
        />
      )}
    </Stack>
  );
}
