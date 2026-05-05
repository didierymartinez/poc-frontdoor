import type { MetadatosOcr, CampoOcr } from '@/shared/model/ocr.types';
import type { HighlightSource } from '@/shared/model';

/**
 * Builds a lookup map from OCR campo names to HighlightSource objects.
 *
 * Usage:
 *   const lookup = buildOcrHighlightMap(ocr);
 *   const hl = lookup('Acreedor.Nombre'); // HighlightSource | null
 *   setHighlightSource(hl);
 *
 * Campo name conventions:
 *   Comercio: Acreedor.Nombre, Referencia.Numero, Total.Subtotal, Total.TotalAPagar, Concepto[N]
 *   Extracto: Tarjeta.Numero, EntidadFinanciera.Nombre, Periodo.Hasta, FechaPago, Movimiento[N]
 */
export function buildOcrHighlightMap(
  ocr: MetadatosOcr | undefined | null,
): (fieldName: string) => HighlightSource | null {
  if (!ocr?.campos?.length) return () => null;

  const map = new Map<string, CampoOcr>();
  for (const campo of ocr.campos) {
    map.set(campo.nombreCampo, campo);
  }

  return (fieldName: string): HighlightSource | null => {
    const campo = map.get(fieldName);
    if (!campo) return null;
    const u = campo.ubicacion;
    return {
      pageNumber: u.numeroPagina,
      ubicacion: {
        superiorIzquierda: { x: u.superiorIzquierda.x, y: u.superiorIzquierda.y },
        superiorDerecha: { x: u.superiorDerecha.x, y: u.superiorDerecha.y },
        inferiorIzquierda: { x: u.inferiorIzquierda.x, y: u.inferiorIzquierda.y },
        inferiorDerecha: { x: u.inferiorDerecha.x, y: u.inferiorDerecha.y },
      },
    };
  };
}
