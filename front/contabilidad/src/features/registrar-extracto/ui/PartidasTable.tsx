import {
  Box,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { Extracto, CargoFinancieroExtracto } from '@/entities/borrador';
import {
  IconX,
  IconCheck,
} from '@tabler/icons-react';
import { CurrencyInput } from '@/shared/ui';
import { OCR_ROW_HOVER, TIPO_CARGO_LABEL } from './extracto-helpers';
import { usePartidasTable } from '../hooks/usePartidasTable';

// ---------------------------------------------------------------------------
// EditableCell (private helper — only used inside PartidasTable)
// ---------------------------------------------------------------------------

/** Inline editable cell */
function EditableCell({ value, onChange, align = 'left', fontWeight = 400 }: { value: string; onChange: (v: string) => void; align?: 'left' | 'right'; fontWeight?: number }) {
  const theme = useTheme();
  const empty = !value;
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <InputBase
        value={value} onChange={(e) => onChange(e.target.value)}
        sx={{
          ...theme.typography.body2, fontWeight, width: '100%',
          '& .MuiInputBase-input': {
            p: 0, textAlign: align, color: empty ? 'transparent' : theme.palette.text.primary,
            ...(empty && { borderBottom: '1px solid', borderColor: theme.palette.grey[300], width: '70%' }),
            '&:focus': { color: theme.palette.text.primary, borderBottom: 'none', width: '100%' },
          },
        }}
      />
      {empty && <Typography variant="body2" color="text.disabled" sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>!</Typography>}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PartidasTable
// ---------------------------------------------------------------------------

import type { ExtractoFiscalSummary } from '../hooks/usePartidasTable';

export function PartidasTable({ data, cargos, periodo, hasError, onTotalChange, onFiscalChange, onCargosChange }: { data?: Extracto; cargos?: CargoFinancieroExtracto[]; periodo?: { desde?: string | null; hasta?: string | null } | null; hasError?: boolean; onTotalChange?: (total: number) => void; onFiscalChange?: (summary: ExtractoFiscalSummary) => void; onCargosChange?: (cargos: CargoFinancieroExtracto[]) => void }) {
  const {
    theme,
    partidas,
    cargoRows,
    newRowDate,
    setNewRowDate,
    newCodigo,
    setNewCodigo,
    newDescripcion,
    setNewDescripcion,
    newValorNum,
    setNewValorNum,
    newMoneda,
    setNewMoneda,
    newCargoTipo,
    setNewCargoTipo,
    newCargoValor,
    setNewCargoValor,
    newCargoMoneda,
    setNewCargoMoneda,
    highlightRow,
    clearHighlight,
    updateRow,
    deleteRow,
    updateCargoRow,
    deleteCargoRow,
    handleAddRow,
    handleAddCargo,
    isRowIncomplete,
  } = usePartidasTable({ data, cargos, periodo, onTotalChange, onFiscalChange, onCargosChange });

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '30px 110px 70px 1fr 1fr 62px 30px', borderBottom: '1px solid', borderColor: 'divider', py: 0.75 }}>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>#</Typography>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Transaccion</Typography>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Codigo</Typography>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Descripcion</Typography>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5, textAlign: 'right' }}>Valor</Typography>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5, textAlign: 'center' }}>Moneda</Typography>
        <Box />
      </Box>

      {partidas.map((row) => (
        <Box
          key={row._key}
          data-row-id={row._key}
          onMouseEnter={highlightRow(row.ubicacion)}
          onMouseLeave={clearHighlight}
          sx={{
            display: 'grid', gridTemplateColumns: '30px 110px 70px 1fr 1fr 62px 30px',
            alignItems: 'center', borderBottom: '0.5px solid', borderColor: 'grey.200', py: 0.75,
            ...(hasError && isRowIncomplete(row) && { bgcolor: 'error.50', borderRadius: 0.5 }),
            '&:hover': { bgcolor: row.ubicacion ? OCR_ROW_HOVER : 'action.hover' },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.numero}</Typography>
          <Box data-cell="fecha" sx={{ px: 0.5 }}>
            <DatePicker
              value={row.transaccion ? dayjs(row.transaccion, 'DD/MM/YYYY') : null}
              onChange={(v: Dayjs | null) => updateRow(row._key, 'transaccion', v?.format('DD/MM/YYYY') ?? '')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  variant: 'standard', size: 'small', placeholder: '',
                  sx: {
                    '& .MuiInput-root': { fontSize: '0.8125rem', fontWeight: 500, '&::before': { borderColor: row.transaccion ? 'transparent' : 'grey.300' }, '&::after': { borderColor: 'primary.main' } },
                    '& .MuiInputBase-input': { p: 0, height: 16 },
                  },
                },
                openPickerButton: { sx: { p: 0 } },
                openPickerIcon: { sx: { fontSize: 14 } },
              }}
            />
          </Box>
          <Box sx={{ px: 0.5 }}><EditableCell value={row.codigo} onChange={(v) => updateRow(row._key, 'codigo', v)} /></Box>
          <Box data-cell="descripcion" sx={{ px: 0.5 }}><EditableCell value={row.descripcion} onChange={(v) => updateRow(row._key, 'descripcion', v)} /></Box>
          <Box data-cell="valor" sx={{ px: 0.5 }}>
            <CurrencyInput
              value={row.valor}
              onChange={(v) => updateRow(row._key, 'valor', v)}
              sx={{ ...theme.typography.body2, width: '100%', '& .MuiInputBase-input': { p: 0, textAlign: 'right' } }}
            />
          </Box>
          <Box sx={{ px: 0.5 }}>
            <Select
              value={row.moneda} onChange={(e) => updateRow(row._key, 'moneda', e.target.value)}
              displayEmpty variant="standard" disableUnderline={!!row.moneda}
              MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
              sx={{ fontSize: '0.8125rem', width: '100%', '& .MuiSelect-select': { p: 0, textAlign: 'center' }, '& .MuiSelect-icon': { right: -4, top: 'calc(50% - 8px)' } }}
              renderValue={(v) => v || <Typography variant="body3" color="text.disabled">—</Typography>}
            >
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="MXN">MXN</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => deleteRow(row._key)}>
              <IconX size={14} color={theme.palette.text.secondary} />
            </IconButton>
          </Box>
        </Box>
      ))}

      {/* Add new row */}
      <Box sx={{
        display: 'grid', gridTemplateColumns: '30px 110px 70px 1fr 1fr 62px 30px', alignItems: 'center',
        bgcolor: 'background.paper', border: '1.5px dashed', borderColor: 'primary.light', borderRadius: 1,
        py: 0.5, mt: 0.5, transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:focus-within': { borderColor: 'primary.main', boxShadow: `0 0 0 2px ${theme.palette.primary.main}20` },
      }}>
        <Box sx={{ gridColumn: '1 / 3', px: 0.5 }}>
          <DatePicker
            value={newRowDate} onChange={(v: Dayjs | null) => setNewRowDate(v)} format="DD/MM/YYYY"
            slotProps={{
              textField: { variant: 'standard', size: 'small', placeholder: 'Seleccionar fecha', sx: { '& .MuiInput-root': { fontSize: '0.75rem', height: 20, border: '1px solid', borderColor: 'primary.main', borderRadius: 0.5, bgcolor: 'background.paper', px: 0.5, '&::before, &::after': { display: 'none' } }, '& .MuiInputBase-input': { p: 0 } } },
              openPickerButton: { sx: { p: 0 } }, openPickerIcon: { sx: { fontSize: 14 } },
            }}
          />
        </Box>
        <Box sx={{ px: 0.5 }}>
          <InputBase value={newCodigo} onChange={(e) => setNewCodigo(e.target.value)} placeholder="Codigo"
            sx={{ fontSize: '0.75rem', '& .MuiInputBase-input': { p: '2px 0', borderBottom: '1px solid', borderColor: theme.palette.grey[300], transition: 'border-color 0.15s', '&:hover': { borderColor: theme.palette.grey[500] }, '&:focus': { borderColor: theme.palette.primary.main, borderBottomWidth: '2px', marginBottom: '-1px' }, '&::placeholder': { color: theme.palette.text.secondary, opacity: 0.7, fontStyle: 'italic' } } }} />
        </Box>
        <Box sx={{ px: 0.5 }}>
          <InputBase value={newDescripcion} onChange={(e) => setNewDescripcion(e.target.value)} placeholder="Escribir descripcion..."
            sx={{ fontSize: '0.75rem', width: '100%', '& .MuiInputBase-input': { p: '2px 0', borderBottom: '1px solid', borderColor: theme.palette.grey[300], transition: 'border-color 0.15s', '&:hover': { borderColor: theme.palette.grey[500] }, '&:focus': { borderColor: theme.palette.primary.main, borderBottomWidth: '2px', marginBottom: '-1px' }, '&::placeholder': { color: theme.palette.text.secondary, opacity: 0.7, fontStyle: 'italic' } } }} />
        </Box>
        <Box sx={{ px: 0.5 }}>
          <CurrencyInput
            value={newValorNum}
            onChange={setNewValorNum}
            placeholder="$ 0,00"
            sx={{ fontSize: '0.75rem', width: '100%', '& .MuiInputBase-input': { p: '2px 0', textAlign: 'right' } }}
          />
        </Box>
        <Box sx={{ px: 0.5 }}>
          <Select size="small" displayEmpty value={newMoneda} onChange={(e) => setNewMoneda(e.target.value)}
            MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
            sx={{ fontSize: '0.75rem', height: 20, '& .MuiSelect-select': { py: 0, px: 0.5 } }}
            renderValue={(v) => { if (!v) return <Typography variant="body3" color="text.secondary" sx={{ fontStyle: 'italic' }}>Mon.</Typography>; return v; }}
          >
            <MenuItem value="COP">COP</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="MXN">MXN</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </Select>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={handleAddRow}>
            <IconCheck size={14} color={theme.palette.primary.main} />
          </IconButton>
        </Box>
      </Box>

      {/* Cargos financieros section */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body3" color="text.secondary" fontWeight={600} sx={{ mb: 0.75 }}>
          Cargos financieros
        </Typography>

        {cargoRows.map((row) => (
          <Box
            key={row._key}
            sx={{
              display: 'grid', gridTemplateColumns: '30px 180px 1fr 1fr 62px 30px',
              alignItems: 'center', borderBottom: '0.5px solid', borderColor: 'grey.200', py: 0.75,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.numero}</Typography>
            <Box sx={{ px: 0.5 }}>
              <Select
                value={row.tipoCargo ?? 0}
                onChange={(e) => {
                  const tipo = Number(e.target.value);
                  updateCargoRow(row._key, 'tipoCargo', tipo);
                  updateCargoRow(row._key, 'descripcion', TIPO_CARGO_LABEL[tipo] ?? `Cargo ${tipo}`);
                }}
                variant="standard" disableUnderline
                MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
                sx={{ fontSize: '0.8125rem', width: '100%', '& .MuiSelect-select': { p: 0 }, '& .MuiSelect-icon': { right: -4, top: 'calc(50% - 8px)' } }}
              >
                {Object.entries(TIPO_CARGO_LABEL).map(([val, label]) => (
                  <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box data-cell="valor" sx={{ px: 0.5 }}>
              <CurrencyInput
                value={row.valor}
                onChange={(v) => updateCargoRow(row._key, 'valor', v)}
                sx={{ ...theme.typography.body2, width: '100%', '& .MuiInputBase-input': { p: 0, textAlign: 'right' } }}
              />
            </Box>
            <Box sx={{ px: 0.5 }}>
              <Select
                value={row.moneda} onChange={(e) => updateCargoRow(row._key, 'moneda', e.target.value)}
                displayEmpty variant="standard" disableUnderline={!!row.moneda}
                MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
                sx={{ fontSize: '0.8125rem', width: '100%', '& .MuiSelect-select': { p: 0, textAlign: 'center' }, '& .MuiSelect-icon': { right: -4, top: 'calc(50% - 8px)' } }}
                renderValue={(v) => v || <Typography variant="body3" color="text.disabled">—</Typography>}
              >
                <MenuItem value="COP">COP</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="MXN">MXN</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </Box>
            <Box />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton size="small" sx={{ p: 0.25 }} onClick={() => deleteCargoRow(row._key)}>
                <IconX size={14} color={theme.palette.text.secondary} />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Add new cargo row */}
        <Box sx={{
          display: 'grid', gridTemplateColumns: '30px 180px 1fr 1fr 62px 30px', alignItems: 'center',
          bgcolor: 'background.paper', border: '1.5px dashed', borderColor: 'secondary.light', borderRadius: 1,
          py: 0.5, mt: 0.5, transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': { borderColor: 'secondary.main', boxShadow: `0 0 0 2px ${theme.palette.secondary.main}20` },
        }}>
          <Box />
          <Box sx={{ px: 0.5 }}>
            <Select
              size="small" displayEmpty value={newCargoTipo}
              onChange={(e) => setNewCargoTipo(Number(e.target.value))}
              MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
              sx={{ fontSize: '0.75rem', height: 20, width: '100%', '& .MuiSelect-select': { py: 0, px: 0.5 } }}
            >
              {Object.entries(TIPO_CARGO_LABEL).map(([val, label]) => (
                <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ px: 0.5 }}>
            <CurrencyInput
              value={newCargoValor}
              onChange={setNewCargoValor}
              placeholder="$ 0,00"
              sx={{ fontSize: '0.75rem', width: '100%', '& .MuiInputBase-input': { p: '2px 0', textAlign: 'right' } }}
            />
          </Box>
          <Box sx={{ px: 0.5 }}>
            <Select size="small" displayEmpty value={newCargoMoneda} onChange={(e) => setNewCargoMoneda(e.target.value)}
              MenuProps={{ slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } }}
              sx={{ fontSize: '0.75rem', height: 20, '& .MuiSelect-select': { py: 0, px: 0.5 } }}
              renderValue={(v) => { if (!v) return <Typography variant="body3" color="text.secondary" sx={{ fontStyle: 'italic' }}>Mon.</Typography>; return v; }}
            >
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="MXN">MXN</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </Box>
          <Box />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconButton size="small" sx={{ p: 0.25 }} onClick={handleAddCargo}>
              <IconCheck size={14} color={theme.palette.secondary.main} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
