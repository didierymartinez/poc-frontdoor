import { useEffect, useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconPaperclip,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import type { ConceptoViewRow, ImpuestoDetalle, RetencionDetalle } from './compra-view-types';
import { formatCurrency } from './compra-view-types';

// ---------------------------------------------------------------------------
// Desglose fiscal expandible
// ---------------------------------------------------------------------------

function DesgloseSubTable({ title, total, items }: {
  title: string;
  total: string;
  items: ImpuestoDetalle[] | RetencionDetalle[];
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body3" color="text.primary" fontWeight={600}>{title}</Typography>
        <Typography variant="body3" color="text.primary">Total: {total}</Typography>
      </Box>

      {/* Sub-table header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '80px 80px 50px 1fr', py: 0.5, borderBottom: '0.5px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">Tipo</Typography>
        <Typography variant="caption" color="text.secondary">Base</Typography>
        <Typography variant="caption" color="text.secondary">Tarifa</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>Valor</Typography>
      </Box>

      {items.map((item, idx) => (
        <Box key={idx} sx={{ py: 0.5, borderBottom: '0.5px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '80px 80px 50px 1fr' }}>
            <Typography variant="caption" color="text.primary" fontWeight={500}>{item.tipo}</Typography>
            <Typography variant="caption" color="text.primary">{item.base}</Typography>
            <Typography variant="caption" color="text.primary">{item.tarifa}</Typography>
            <Typography variant="caption" color="primary.main" sx={{ textAlign: 'right' }}>{item.valor}</Typography>
          </Box>
          {item.distribucion.length > 0 && (
            <Box sx={{ pl: 1, mt: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                Distribución de costos
              </Typography>
              {item.distribucion.map((d, di) => (
                <Typography key={di} variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.625rem' }}>
                  {d.centro} {d.nombre} | {d.porcentaje} | {d.monto}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ConceptoRow
// ---------------------------------------------------------------------------

function ConceptoRow({ row, expanded: externalExpanded }: { row: ConceptoViewRow; expanded: boolean }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(externalExpanded);

  useEffect(() => { setExpanded(externalExpanded); }, [externalExpanded]);

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Main row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr 45px 120px 1fr 1fr 30px',
          alignItems: 'start',
          py: 0.75,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {/* Código */}
        <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {row.descripcion === 'Devolución' && (
            <IconPaperclip size={12} color={theme.palette.text.secondary} />
          )}
          <Typography variant="body2" color="text.primary" noWrap fontWeight={500}>{row.codigo}</Typography>
        </Box>

        {/* Descripción */}
        <Typography variant="body2" color="text.primary" noWrap sx={{ px: 1 }}>{row.descripcion}</Typography>

        {/* Cantidad */}
        <Typography variant="body2" color="text.primary" sx={{ px: 1, textAlign: 'right' }}>{row.cantidad}</Typography>

        {/* Valor */}
        <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ px: 1, textAlign: 'right' }}>
          {formatCurrency(row.valor)}
        </Typography>

        {/* Distribución — detalle con count */}
        <Box sx={{ px: 1, textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, justifyContent: 'flex-end' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {row.distribuciones.map((d, i) => (
                <Typography key={i} variant="caption" color="text.secondary" display="block" noWrap>
                  {d.centro} {d.nombre} | {d.porcentaje} | {d.monto}
                </Typography>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, ml: 'auto' }}>
              {row.distribuciones.length}
            </Typography>
          </Box>
        </Box>

        {/* Desglose fiscal summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            Impuestos: {row.impuestosCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">|</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Retenciones: {row.retencionesCount}
          </Typography>
        </Box>

        {/* Expand chevron */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={() => setExpanded(!expanded)}>
            {expanded
              ? <IconChevronUp size={14} color={theme.palette.text.secondary} />
              : <IconChevronDown size={14} color={theme.palette.text.secondary} />
            }
          </IconButton>
        </Box>
      </Box>

      {/* Expanded detail: Impuestos + Retenciones */}
      <Collapse in={expanded}>
        {(row.impuestos.length > 0 || row.retenciones.length > 0) && (
          <Box sx={{ display: 'flex', gap: 3, px: 2, py: 1.5, bgcolor: 'grey.50', borderTop: '0.5px solid', borderColor: 'grey.200' }}>
            {row.impuestos.length > 0 && (
              <DesgloseSubTable title="Impuestos" total={row.impuestosTotal} items={row.impuestos} />
            )}
            {row.retenciones.length > 0 && (
              <DesgloseSubTable title="Retenciones" total={row.retencionesTotal} items={row.retenciones} />
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ConceptosTable
// ---------------------------------------------------------------------------

export function ConceptosTable({ conceptos: externalConceptos }: { conceptos?: { id: string; codigo: string; descripcion: string; cantidad: number; valor: number; impuestos: { tipo: string; base: string; tarifa: string; valor: string }[]; retenciones: { tipo: string; base: string; tarifa: string; valor: string }[] }[] }) {
  // Map external conceptos to ConceptoViewRow if provided
  const conceptosData: ConceptoViewRow[] = externalConceptos
    ? externalConceptos.map((c, i) => ({
        id: i + 1,
        codigo: c.codigo,
        descripcion: c.descripcion,
        cantidad: c.cantidad,
        valor: c.valor,
        distribuciones: [],
        impuestosCount: c.impuestos.length,
        retencionesCount: c.retenciones.length,
        impuestosTotal: c.impuestos.length > 0 ? c.impuestos.reduce((s, imp) => s + parseFloat(imp.valor.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')), 0).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0',
        retencionesTotal: c.retenciones.length > 0 ? c.retenciones.reduce((s, ret) => s + parseFloat(ret.valor.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')), 0).toLocaleString('es-CO', { minimumFractionDigits: 2 }) : '0',
        impuestos: c.impuestos.map((imp) => ({ ...imp, distribucion: [] })),
        retenciones: c.retenciones.map((ret) => ({ ...ret, distribucion: [] })),
      }))
    : [];
  const [allExpanded, setAllExpanded] = useState(false);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          Conceptos
        </Typography>
        <Link
          component="button"
          underline="none"
          onClick={() => setAllExpanded((prev) => !prev)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            color: 'text.primary', fontWeight: 500, fontSize: '0.8125rem',
          }}
        >
          {allExpanded ? 'Colapsar' : 'Expandir'}
          {allExpanded ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
        </Link>
      </Box>

      {/* Table header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr 45px 120px 1fr 1fr 30px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 0.75,
        }}
      >
        {['Código', 'Descripción', 'Cant.', 'Valor', 'Distribución', 'Desglose fiscal', ''].map((header) => (
          <Typography
            key={header || 'empty'}
            variant="body3"
            color="text.secondary"
            sx={{ px: 1, ...(['Cant.', 'Valor', 'Distribución'].includes(header) && { textAlign: 'right' }) }}
          >
            {header}
          </Typography>
        ))}
      </Box>

      {/* Data rows */}
      {conceptosData.map((row) => (
        <ConceptoRow key={row.id} row={row} expanded={allExpanded} />
      ))}
    </Box>
  );
}
