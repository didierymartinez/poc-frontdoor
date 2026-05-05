import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import { API_BASE_URL } from '@/shared/config';
import type {
  CausarDevolucionRequest,
  DistribucionConceptoRequest,
  DistribucionTributoRequest,
} from '@/entities/borrador';

// ---------------------------------------------------------------------------
// Radicar devolucion (→ Pendiente)
// POST /api/radicacion/comandos/Devolucion
// Response: 201 Created with Location header containing the devolucionId
// ---------------------------------------------------------------------------

export function useRadicarDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<string> => {
      const res = await fetch(`${API_BASE_URL}/api/radicacion/comandos/Devolucion`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        let detail: string | undefined;
        try {
          const body = await res.json();
          detail = (body as { detail?: string })?.detail;
        } catch { /* empty */ }
        throw new Error(detail ?? res.statusText);
      }
      // Extract ID from Location header: "Devolucion/{id}"
      const location = res.headers.get('Location') ?? '';
      const id = location.split('/').pop() ?? '';
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Confirmar devolucion (Pendiente → Confirmada)
// POST /api/radicacion/comandos/Devolucion/{id}/Confirmar
// ---------------------------------------------------------------------------

export function useConfirmarDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (devolucionId: string) =>
      httpClient.post<string | null>(
        `/api/radicacion/comandos/Devolucion/${devolucionId}/Confirmar`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
      queryClient.invalidateQueries({ queryKey: ['anticipos'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Causar devolucion (Confirmada → Causada)
// POST /api/radicacion/comandos/Devolucion/{id}/Causar
// ---------------------------------------------------------------------------

export interface CausarDevolucionParams {
  devolucionId: string;
  body: CausarDevolucionRequest;
}

export function useCausarDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ devolucionId, body }: CausarDevolucionParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/Devolucion/${devolucionId}/Causar`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Distribuir concepto devuelto (solo origen Comercio, estado Pendiente)
// POST /api/radicacion/comandos/Devolucion/{id}/ConfigurarInstruccionDistribucionConcepto
// ---------------------------------------------------------------------------

export interface DistribuirConceptoParams {
  devolucionId: string;
  body: DistribucionConceptoRequest;
}

export function useDistribuirConceptoDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ devolucionId, body }: DistribuirConceptoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/Devolucion/${devolucionId}/ConfigurarInstruccionDistribucionConcepto`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Distribuir tributo de concepto devuelto (solo origen Comercio, estado Pendiente)
// POST /api/radicacion/comandos/Devolucion/{id}/ConfigurarInstruccionDistribucionTributo
// ---------------------------------------------------------------------------

export interface DistribuirTributoParams {
  devolucionId: string;
  body: DistribucionTributoRequest;
}

export function useDistribuirTributoDevolucion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ devolucionId, body }: DistribuirTributoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/Devolucion/${devolucionId}/ConfigurarInstruccionDistribucionTributo`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devoluciones'] });
    },
  });
}
