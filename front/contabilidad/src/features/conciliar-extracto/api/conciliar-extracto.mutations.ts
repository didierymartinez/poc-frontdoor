import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import { showToast } from '@/shared/ui';
import { getSessionUserId } from '@/shared/lib/session-user-id';

/** Extract detail from RFC 7807 ProblemDetails or fall back to Error.message */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'body' in err) {
    const body = (err as { body?: unknown }).body;
    if (body && typeof body === 'object' && 'detail' in body) {
      return (body as { detail: string }).detail;
    }
  }
  return err instanceof Error ? err.message : 'Error desconocido';
}

function onMutationError(err: unknown) {
  showToast(extractErrorMessage(err), 'error');
}

// ---------------------------------------------------------------------------
// Vincular partida con OXP de Comercio
// POST /api/radicacion/comandos/OxpExtracto/{id}/Vinculacion
// ---------------------------------------------------------------------------

export interface VincularPartidaParams {
  extractoId: string;
  partidaId: string;
  oxpComercioId: string;
  monto: { valor: number; moneda: number };
}

export function useVincularPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, oxpComercioId, monto }: VincularPartidaParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Vinculacion`,
        {
          partidaId,
          oxpComercioId,
          fecha: new Date().toISOString(),
          monto: { valor: monto.valor, moneda: monto.moneda },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Cubrir partida con anticipo
// POST /api/radicacion/comandos/OxpExtracto/{id}/Partidas/CubrirConAnticipo
// ---------------------------------------------------------------------------

export interface CubrirConAnticipoParams {
  extractoId: string;
  partidaId: string;
  anticipoId: string;
  valorCubierto: { valor: number; moneda: number };
}

export function useCubrirConAnticipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, anticipoId, valorCubierto }: CubrirConAnticipoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Partidas/CubrirConAnticipo`,
        {
          partidaId,
          anticipoId,
          valorCubierto: { valor: valorCubierto.valor, moneda: valorCubierto.moneda },
          fecha: new Date().toISOString(),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Cubrir partida con devolución
// POST /api/radicacion/comandos/OxpExtracto/{id}/Partidas/CubrirConDevolucion
// ---------------------------------------------------------------------------

export interface CubrirConDevolucionParams {
  extractoId: string;
  partidaId: string;
  devolucionId: string;
  valorCubierto: { valor: number; moneda: number };
}

export function useCubrirConDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, devolucionId, valorCubierto }: CubrirConDevolucionParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Partidas/CubrirConDevolucion`,
        {
          partidaId,
          devolucionId,
          valorCubierto: { valor: valorCubierto.valor, moneda: valorCubierto.moneda },
          fecha: new Date().toISOString(),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Marcar partida en disputa
// POST /api/radicacion/comandos/OxpExtracto/{id}/Partidas/Disputa
// ---------------------------------------------------------------------------

export interface MarcarDisputaParams {
  extractoId: string;
  partidaId: string;
  motivo: number;
}

export function useMarcarDisputa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, motivo }: MarcarDisputaParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Partidas/Disputa`,
        {
          partidaId,
          motivo,
          usuarioId: getSessionUserId(),
          fecha: new Date().toISOString(),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Reclasificar partida en disputa (disputa → vinculada)
// POST /api/radicacion/comandos/OxpExtracto/{id}/Partidas/Reclasificar
// ---------------------------------------------------------------------------

export interface ReclasificarPartidaParams {
  extractoId: string;
  partidaId: string;
  oxpComercioId: string;
}

export function useReclasificarPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, oxpComercioId }: ReclasificarPartidaParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Partidas/Reclasificar`,
        {
          partidaId,
          oxpComercioId,
          usuarioId: getSessionUserId(),
          fecha: new Date().toISOString(),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Descartar partida en disputa (disputa → descartada)
// POST /api/radicacion/comandos/OxpExtracto/{id}/Partidas/Descartar
// ---------------------------------------------------------------------------

export interface DescartarPartidaParams {
  extractoId: string;
  partidaId: string;
  extractoReversoBancarioId: string;
  lineaReversoBancario: string;
}

export function useDescartarPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ extractoId, partidaId, extractoReversoBancarioId, lineaReversoBancario }: DescartarPartidaParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Partidas/Descartar`,
        {
          partidaId,
          extractoReversoBancarioId,
          lineaReversoBancario,
          usuarioId: getSessionUserId(),
          fecha: new Date().toISOString(),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Confirmar extracto (Conciliado → Confirmado)
// POST /api/radicacion/comandos/OxpExtracto/{id}/Confirmar
// ---------------------------------------------------------------------------

export function useConfirmarExtracto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extractoId: string) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Confirmar`,
        { usuarioId: getSessionUserId() },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Causar extracto (Confirmado → Causada)
// POST /api/radicacion/comandos/OxpExtracto/{id}/Causar
// ---------------------------------------------------------------------------

export function useCausarExtracto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extractoId: string) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${extractoId}/Causar`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
    onError: onMutationError,
  });
}

// ---------------------------------------------------------------------------
// Registrar anticipo (nace Pagado desde conciliación)
// POST /api/radicacion/comandos/RegistrarAnticipoCompra
// ---------------------------------------------------------------------------

export interface RegistrarAnticipoParams {
  informacionTercero: { nombre: string; identificacion: { tipo: string; numero: string } };
  valorMonetario: { valor: number; moneda: number };
  medioPago: { tipo: number; numero: string; entidadBancaria: string };
  fecha: string;
  justificacion?: string;
  instruccionDistribucion?: { unidadOrganizacional: string; porcentaje: number }[];
  archivoId?: string | null;
}

export function useRegistrarAnticipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RegistrarAnticipoParams) =>
      httpClient.post<string>(
        '/api/radicacion/comandos/RegistrarAnticipoCompra',
        params,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['anticipos'] });
    },
    onError: onMutationError,
  });
}
