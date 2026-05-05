import { useMemo, useState } from 'react';
import { Box, Button, Chip, Collapse, Typography, useTheme } from '@mui/material';
import { IconArrowsMoveVertical, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { ConceptoDevueltoApi } from '@/entities/borrador';

interface ImpuestoRow {
  tipo: string;
  base: string;
  tarifa: string;
  valorAplicado: string;
  valorADevolver: string;
}

interface ConceptoDevueltoRow {
  id: string;
  codigo: string;
  descripcion: string;
  cantidadInicial: number;
  valorInicial: number;
  cantidadADevolver: number;
  valorADevolver: number;
  desgloseFiscal: string[];
  impuestos: ImpuestoRow[];
  retenciones: ImpuestoRow[];
  totalImpuestosInicial: string;
  totalImpuestosDevolver: string;
  totalRetencionesInicial: string;
  totalRetencionesDevolver: string;
  totalADevolver: string;
}

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapConcepto(c: ConceptoDevueltoApi): ConceptoDevueltoRow {
  const impuestos = c.desgloseFiscal?.impuestos ?? [];
  const retenciones = c.desgloseFiscal?.retenciones ?? [];
  const totalImp = impuestos.reduce((s, i) => s + i.valor.valor, 0);
  const totalRet = retenciones.reduce((s, r) => s + r.valor.valor, 0);
  const desgloseFiscal = [...impuestos.map((i) => i.tipo), ...retenciones.map((r) => r.tipo)];

  return {
    id: c.id,
    codigo: c.codigo,
    descripcion: c.descripcion,
    cantidadInicial: c.cantidad,
    valorInicial: c.valorBruto.valor,
    cantidadADevolver: c.cantidad,
    valorADevolver: c.valorBruto.valor,
    desgloseFiscal,
    impuestos: impuestos.map((i) => ({
      tipo: i.tipo,
      base: fmt(i.base.valor),
      tarifa: `${(i.tarifa * 100).toFixed(1)}`,
      valorAplicado: fmt(i.valor.valor),
      valorADevolver: fmt(i.valor.valor),
    })),
    retenciones: retenciones.map((r) => ({
      tipo: r.tipo,
      base: fmt(r.base.valor),
      tarifa: `${(r.tarifa * 100).toFixed(1)}`,
      valorAplicado: fmt(r.valor.valor),
      valorADevolver: fmt(r.valor.valor),
    })),
    totalImpuestosInicial: fmt(totalImp),
    totalImpuestosDevolver: fmt(totalImp),
    totalRetencionesInicial: fmt(totalRet),
    totalRetencionesDevolver: fmt(totalRet),
    totalADevolver: fmt(c.valorBruto.valor + totalImp - totalRet),
  };
}

function DesgloseTable({ title, totalInicial, totalDevolver, rows }: {
  title: string;
  totalInicial: string;
  totalDevolver: string;
  rows: ImpuestoRow[];
}) {
  const theme = useTheme();
  const headers = ['Tipo', 'Base', 'Tarifa', 'Valor aplicado', 'Valor a devolver'];

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total iniciado aplicado: {totalInicial}
        </Typography>
        <Typography variant="caption" color="text.secondary">|</Typography>
        <Typography variant="caption" color="primary.main" fontWeight={500}>
          Total a devolver: {totalDevolver}
        </Typography>
      </Box>
      <Box
        component="table"
        sx={{ width: '100%', borderCollapse: 'collapse', ...theme.typography.caption }}
      >
        <Box component="thead">
          <Box component="tr">
            {headers.map((h) => (
              <Box
                component="th"
                key={h}
                sx={{ textAlign: 'left', py: 0.5, px: 0.5, borderBottom: '1px solid', borderColor: 'grey.200' }}
              >
                <Typography variant="caption" color="text.secondary">{h}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {rows.map((row, i) => (
            <Box component="tr" key={i}>
              {[row.tipo, row.base, row.tarifa, row.valorAplicado, row.valorADevolver].map((val, j) => (
                <Box
                  component="td"
                  key={j}
                  sx={{ py: 0.5, px: 0.5, borderBottom: '1px solid', borderColor: 'grey.100' }}
                >
                  <Typography variant="caption" color="text.primary">{val}</Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function ExpandedDetail({ row }: { row: ConceptoDevueltoRow }) {
  return (
    <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {row.impuestos.length > 0 && (
          <DesgloseTable
            title="Impuestos"
            totalInicial={row.totalImpuestosInicial}
            totalDevolver={row.totalImpuestosDevolver}
            rows={row.impuestos}
          />
        )}
        {row.retenciones.length > 0 && (
          <DesgloseTable
            title="Retenciones"
            totalInicial={row.totalRetencionesInicial}
            totalDevolver={row.totalRetencionesDevolver}
            rows={row.retenciones}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="subtitle2" color="primary.main">
          Total a devolver: {row.totalADevolver}
        </Typography>
      </Box>
    </Box>
  );
}

const COLUMN_HEADERS = [
  { label: 'Cód...', width: 60, align: 'left' as const },
  { label: 'Descripción', flex: true, align: 'left' as const },
  { label: 'Cant. Inicial', width: 90, align: 'right' as const },
  { label: 'Vlr. Inicial', width: 120, align: 'right' as const },
  { label: 'Cant. A devolver', width: 110, align: 'right' as const },
  { label: 'Valor a devolver', width: 130, align: 'right' as const },
  { label: 'Desglose fiscal', width: 180, align: 'left' as const },
  { label: '', width: 40, align: 'center' as const },
];

interface ConceptosDevueltosTableProps {
  conceptos: ConceptoDevueltoApi[];
}

export function ConceptosDevueltosTable({ conceptos }: ConceptosDevueltosTableProps) {
  const theme = useTheme();
  const rows = useMemo(() => conceptos.map(mapConcepto), [conceptos]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set(rows[0] ? [rows[0].id] : []));

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedRows.size === rows.length) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(rows.map((c) => c.id)));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          sx={{
            bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200',
            borderRadius: 1, px: 1.5, py: 0.5, height: 32,
            display: 'flex', alignItems: 'center', gap: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Conceptos devueltos:
          </Typography>
          <Typography variant="h6" color="text.primary">
            {rows.length}
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<IconArrowsMoveVertical size={16} />}
          onClick={toggleAll}
          sx={{ color: 'primary.main' }}
        >
          Expandir
        </Button>
      </Box>

      {/* Table */}
      <Box>
        {/* Column headers */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center',
            bgcolor: 'grey.50',
            borderBottom: '1px solid', borderColor: 'grey.200',
            py: 0.75, px: 1,
          }}
        >
          {COLUMN_HEADERS.map((col) => (
            <Box
              key={col.label}
              sx={{
                width: col.flex ? undefined : col.width,
                flex: col.flex ? 1 : undefined,
                textAlign: col.align,
                px: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">{col.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Rows */}
        {rows.map((row) => {
          const isExpanded = expandedRows.has(row.id);
          const visible = row.desgloseFiscal.slice(0, 3);
          const extra = row.desgloseFiscal.length - 3;

          return (
            <Box key={row.id}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center',
                  py: 1, px: 1,
                  borderBottom: isExpanded ? 'none' : '1px solid',
                  borderColor: 'grey.100',
                  bgcolor: isExpanded ? 'primary.50' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: isExpanded ? 'primary.50' : 'action.hover' },
                }}
                onClick={() => toggleRow(row.id)}
              >
                <Box sx={{ width: 60, px: 0.5 }}>
                  <Typography variant="body2" color="text.primary">{row.codigo}</Typography>
                </Box>
                <Box sx={{ flex: 1, px: 0.5 }}>
                  <Typography variant="body2" color="text.primary">{row.descripcion}</Typography>
                </Box>
                <Box sx={{ width: 90, textAlign: 'right', px: 0.5 }}>
                  <Typography variant="body2" color="text.primary">{row.cantidadInicial}</Typography>
                </Box>
                <Box sx={{ width: 120, textAlign: 'right', px: 0.5 }}>
                  <Typography variant="body2" color="text.primary">{fmt(row.valorInicial)}</Typography>
                </Box>
                <Box sx={{ width: 110, textAlign: 'right', px: 0.5 }}>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    {row.cantidadADevolver}
                  </Typography>
                </Box>
                <Box sx={{ width: 130, textAlign: 'right', px: 0.5 }}>
                  <Typography variant="body2" color="text.primary" fontWeight={600}>
                    {fmt(row.valorADevolver)}
                  </Typography>
                </Box>
                <Box sx={{ width: 180, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {visible.map((label) => (
                    <Typography key={label} variant="caption" color="text.secondary">{label}</Typography>
                  ))}
                  {extra > 0 && (
                    <Chip
                      label={`+${extra}`}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.6875rem',
                        bgcolor: 'grey.100', color: 'text.secondary',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                  {isExpanded
                    ? <IconChevronUp size={16} color={theme.palette.action.active} />
                    : <IconChevronDown size={16} color={theme.palette.action.active} />}
                </Box>
              </Box>

              {/* Expanded detail */}
              <Collapse in={isExpanded} unmountOnExit>
                <ExpandedDetail row={row} />
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
