export { useCompletarExtracto, useCompletarComercio, useCompletarAnticipo, useDescartarAnticipo } from './api/confirmar-borrador.mutation';
export { useDescartarComercio, useConfirmarOxpComercio, useDevolverOxpComercio, useCorregirOxpComercio, useCausarObligacion } from './api/confirmar-borrador.mutation';
export { useEditarValorMonetario, useEditarInformacionTercero, useEditarConceptos, useEditarMedioDePago, useEditarTrm, useEditarSoportePresupuestal, useEditarDistribucion } from './api/confirmar-borrador.mutation';
export type { CompletarExtractoParams, CompletarComercioParams, CompletarAnticipoParams, CompletarAnticipoBody, DescartarAnticipoParams, DescartarComercioParams, DevolverOxpParams } from './api/confirmar-borrador.mutation';
export { useDescartarExtracto } from './api/rechazar-borrador.mutation';
export { validarFormulario } from './lib/validar-borrador';
export type { ValidationError, FormValues, ConceptoValues, MovimientoValues } from './lib/validar-borrador';
export { obtenerWarningsCompra, obtenerWarningsExtracto } from './lib/validar-warnings';
export type { ValidationWarning } from './lib/validar-warnings';
