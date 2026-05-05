import { Box, Typography } from '@mui/material';
import { DevolucionViewHeader } from './DevolucionViewHeader';
import { DatosDevolucion } from './DatosDevolucion';
import { ResumenDevolucion } from './ResumenDevolucion';
import { ConceptosDevueltosTable } from './ConceptosDevueltosTable';
import { CargosFinancierosTable } from './CargosFinancierosTable';
import type { AgregadoDevolucion } from '@/entities/borrador';
import { ESTADO_DEVOLUCION, MONEDA_MAP } from '@/entities/borrador';

const ESTADO_LABEL: Record<number, string> = {
  [ESTADO_DEVOLUCION.Pendiente]: 'Pendiente',
  [ESTADO_DEVOLUCION.Confirmada]: 'Confirmada',
  [ESTADO_DEVOLUCION.Causada]: 'Causada',
};

const ORIGEN_LABEL: Record<string, string> = {
  Comercio: 'Compra',
  Extracto: 'Extracto',
  Anticipo: 'Anticipo',
};

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getOrigenId(origen: AgregadoDevolucion['origen']): string {
  return origen.oxpComercioId ?? origen.oxpExtractoId ?? origen.anticipoId ?? '';
}

function buildResumen(d: AgregadoDevolucion) {
  const valor = d.valorMonetario;
  const conceptos = d.conceptosDevueltos ?? [];
  const allImpuestos: { nombre: string; porcentaje: string; valor: string }[] = [];
  const allRetenciones: { nombre: string; porcentaje: string; valor: string }[] = [];
  let totalImp = 0;
  let totalRet = 0;
  let totalBruto = 0;

  for (const c of conceptos) {
    totalBruto += c.valorBruto.valor;
    if (c.desgloseFiscal) {
      for (const imp of c.desgloseFiscal.impuestos) {
        totalImp += imp.valor.valor;
        allImpuestos.push({ nombre: imp.tipo, porcentaje: `${(imp.tarifa * 100).toFixed(1)}%`, valor: fmt(imp.valor.valor) });
      }
      for (const ret of c.desgloseFiscal.retenciones) {
        totalRet += ret.valor.valor;
        allRetenciones.push({ nombre: ret.tipo, porcentaje: `${(ret.tarifa * 100).toFixed(1)}%`, valor: fmt(ret.valor.valor) });
      }
    }
  }

  return {
    totalDevolucion: fmt(valor.valor),
    moneda: MONEDA_MAP[valor.moneda] ?? 'COP',
    trm: d.trm ? fmt(d.trm.valor) : '-',
    funcional: d.trm ? fmt(valor.valor * d.trm.valor) : '-',
    valorBruto: totalBruto > 0 ? fmt(totalBruto) : fmt(valor.valor),
    totalImpuestos: fmt(totalImp),
    impuestos: allImpuestos,
    totalRetenciones: fmt(totalRet),
    retenciones: allRetenciones,
  };
}

function buildDistribucion(d: AgregadoDevolucion) {
  const instrucciones = d.instruccionesDistribucion ?? [];
  return instrucciones
    .filter((i) => i.tipo === 'ConceptoDevuelto')
    .flatMap((i) =>
      i.destinos.map((dest) => ({
        codigo: dest.unidadOrganizacional,
        nombre: '',
        porcentaje: `${(dest.porcentaje * 100).toFixed(0)}%`,
        valor: '',
      })),
    );
}

interface DevolucionViewProps {
  devolucion: AgregadoDevolucion;
}

export function DevolucionView({ devolucion }: DevolucionViewProps) {
  const d = devolucion;
  const origenLabel = ORIGEN_LABEL[d.origen.$type] ?? d.origen.$type;
  const origenId = getOrigenId(d.origen);
  const resumen = buildResumen(d);
  const distribucion = buildDistribucion(d);
  const hasConceptos = (d.conceptosDevueltos?.length ?? 0) > 0;
  const hasCargos = (d.cargosDevueltos?.length ?? 0) > 0;

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
      <Box p={2} bgcolor="background.paper">
        <DevolucionViewHeader
          codigo={d.id}
          estado={ESTADO_LABEL[d.estado] ?? 'Pendiente'}
          radicador={d.informacionTercero.nombre}
          tiempoRadicacion={new Date(d.fechaRadicacion).toLocaleDateString('es-CO')}
        />
      </Box>

      {/* Two-column layout: datos + resumen */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <DatosDevolucion
            origen={origenLabel}
            codigoOrigen={origenId}
            documentoFuente={d.documento ? `${d.documento.numero}` : '-'}
            totalCompra={resumen.valorBruto}
            moneda={resumen.moneda}
            soporte={d.soporte?.blobName ?? ''}
            distribucion={distribucion}
            tipoDevolucion={hasConceptos ? 'por_concepto' : 'total'}
          />
        </Box>
        <ResumenDevolucion {...resumen} />
      </Box>

      {/* Motivo de devolución (reversa de anticipo) */}
      {d.reversa && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Motivo de devolución
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1,
                px: 2,
                py: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="subtitle2" color="text.primary">
                {d.reversa.motivoReversa}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {d.reversa.descripcion}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
          </Box>
        </Box>
      )}

      {/* Cargos financieros devueltos */}
      {hasCargos && (
        <CargosFinancierosTable
          cargos={d.cargosDevueltos!.map((c, i) => ({
            no: String(i + 1).padStart(2, '0'),
            codigo: c.referenciaCargoFinanciero,
            movimiento: c.descripcion,
            valor: fmt(c.valor.valor),
            moneda: MONEDA_MAP[c.valor.moneda] ?? 'COP',
            trm: '-',
          }))}
        />
      )}

      {/* Tabla de conceptos devueltos */}
      {hasConceptos && <ConceptosDevueltosTable conceptos={d.conceptosDevueltos!} />}
    </Box>
  );
}
