// ---------------------------------------------------------------------------
// OCR metadata types — generic OCR structures, not business-domain specific
// ---------------------------------------------------------------------------

export interface MetadatosOcr {
  unidadMedidaCoordenadas: string;
  campos?: CampoOcr[];
}

export interface CampoOcr {
  nombreCampo: string;
  ubicacion: UbicacionOcr;
}

export interface UbicacionOcr {
  numeroPagina: number;
  superiorIzquierda: { x: number; y: number };
  superiorDerecha: { x: number; y: number };
  inferiorIzquierda: { x: number; y: number };
  inferiorDerecha: { x: number; y: number };
}
