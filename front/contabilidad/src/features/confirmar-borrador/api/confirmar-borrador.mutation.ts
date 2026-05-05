import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import { getSessionUserId } from '@/shared/lib/session-user-id';

// ---------------------------------------------------------------------------
// Completar Comercio borrador
// POST /api/radicacion/comandos/OxpComercio/{id}/CompletarBorrador
// Body mirrors backend OxpComercioRequest.CompletarBorrador
// ---------------------------------------------------------------------------

export interface CompletarComercioParams {
  oxpComercioId: string;
  body: Record<string, unknown>;
}

export function useCompletarComercio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oxpComercioId, body }: CompletarComercioParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpComercio/${oxpComercioId}/CompletarBorrador`,
        { ...body, usuarioId: getSessionUserId() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Completar Anticipo borrador
// PUT /api/radicacion/comandos/Anticipo/{id}/Completar
// ---------------------------------------------------------------------------

export interface CompletarAnticipoBody {
  informacionTercero: {
    nombre: string;
    identificacion: { tipo: string; numero: string };
  };
  valorMonetario: { moneda: number; valor: number };
  medioPago: { tipo: number; numero: string; entidadBancaria: string };
  justificacion?: string | null;
  instruccionDistribucion?: { unidadOrganizacional: string; porcentaje: number }[];
}

export interface CompletarAnticipoParams {
  anticipoId: string;
  body: CompletarAnticipoBody;
}

export function useCompletarAnticipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ anticipoId, body }: CompletarAnticipoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/Anticipo/${anticipoId}/Completar`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['anticipos'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Descartar Anticipo borrador
// POST /api/radicacion/comandos/Anticipo/{id}/DescartarBorrador
// ---------------------------------------------------------------------------

export interface DescartarAnticipoParams {
  anticipoId: string;
  motivo: string;
}

export function useDescartarAnticipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ anticipoId, motivo }: DescartarAnticipoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/Anticipo/${anticipoId}/DescartarBorrador`,
        { usuarioId: getSessionUserId(), motivo },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['anticipos'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Descartar Comercio borrador
// POST /api/radicacion/comandos/OxpComercio/{id}/DescartarBorrador
// ---------------------------------------------------------------------------

export interface DescartarComercioParams {
  oxpComercioId: string;
  motivo: string;
}

export function useDescartarComercio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oxpComercioId, motivo }: DescartarComercioParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpComercio/${oxpComercioId}/DescartarBorrador`,
        { usuarioId: getSessionUserId(), motivo },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Confirmar OXP (Pendiente → Confirmada)
// POST /api/radicacion/comandos/ObligacionPorPagar/{id}/Confirmar
// ---------------------------------------------------------------------------

export function useConfirmarOxpComercio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/Confirmar`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Devolver OXP (Pendiente → Devuelta)
// POST /api/radicacion/comandos/ObligacionPorPagar/{id}/Devolver
// ---------------------------------------------------------------------------

export interface DevolverOxpParams {
  id: string;
  motivo: string;
}

export function useDevolverOxpComercio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivo }: DevolverOxpParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/Devolver`,
        { motivo },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Causar OXP (Confirmada → Causada)
// POST /api/radicacion/comandos/ObligacionPorPagar/{id}/Causar
// ---------------------------------------------------------------------------

export function useCausarObligacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/Causar`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Corregir OXP (Devuelta → Pendiente)
// POST /api/radicacion/comandos/ObligacionPorPagar/{id}/Corregir
// ---------------------------------------------------------------------------

export function useCorregirOxpComercio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/Corregir`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Granular field mutations (for Pendiente/Devuelta editing)
// ---------------------------------------------------------------------------

export function useEditarValorMonetario() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/ValorMonetario`,
        body,
      ),
  });
}

export function useEditarInformacionTercero() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/InformacionTercero`,
        body,
      ),
  });
}

export function useEditarConceptos() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/Conceptos`,
        body,
      ),
  });
}

export function useEditarMedioDePago() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/MedioDePago`,
        body,
      ),
  });
}

export function useEditarTrm() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/TasaRepresentativaMercado`,
        body,
      ),
  });
}

export function useEditarSoportePresupuestal() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/SoportePresupuestal`,
        body,
      ),
  });
}

export function useEditarDistribucion() {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/ConfigurarInstruccionDistribucion`,
        body,
      ),
  });
}

// ---------------------------------------------------------------------------
// Completar Extracto borrador
// POST /api/radicacion/comandos/OxpExtracto/{id}/CompletarBorrador
// Body mirrors backend OxpExtractoRequest.CompletarBorrador
// ---------------------------------------------------------------------------

export interface CompletarExtractoParams {
  oxpExtractoId: string;
  body: Record<string, unknown>;
}

export function useCompletarExtracto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ oxpExtractoId, body }: CompletarExtractoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${oxpExtractoId}/CompletarBorrador`,
        { ...body, usuarioId: getSessionUserId() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}
