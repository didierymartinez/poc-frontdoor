import type { ConceptoValues, MovimientoValues } from './validar-borrador';

export interface ValidationWarning {
  mensaje: string;
}

export function obtenerWarningsCompra(conceptos: ConceptoValues[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Short descriptions
  for (const c of conceptos) {
    if (c.descripcion && c.descripcion.length < 5) {
      warnings.push({ mensaje: `Descripcion muy corta: "${c.descripcion}"` });
    }
  }

  // Duplicate concepts (same descripcion + same valor)
  const seen = new Set<string>();
  for (const c of conceptos) {
    const key = `${c.descripcion.toLowerCase().trim()}|${c.valor}`;
    if (seen.has(key)) {
      warnings.push({ mensaje: `Posible concepto duplicado: "${c.descripcion}"` });
    }
    seen.add(key);
  }

  return warnings;
}

export function obtenerWarningsExtracto(movimientos: MovimientoValues[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Movements with value 0
  const ceroCount = movimientos.filter((m) => !m.valor).length;
  if (ceroCount > 0) {
    warnings.push({ mensaje: `${ceroCount} movimiento(s) con valor $0` });
  }

  return warnings;
}
