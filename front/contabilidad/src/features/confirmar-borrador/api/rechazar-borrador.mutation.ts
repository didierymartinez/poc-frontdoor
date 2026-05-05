import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';

// ---------------------------------------------------------------------------
// Descartar Extracto borrador
// POST /api/radicacion/comandos/OxpExtracto/{id}/DescartarBorrador
// ---------------------------------------------------------------------------

interface DescartarExtractoParams {
  oxpExtractoId: string;
  usuarioId: string;
  motivo: string;
}

export function useDescartarExtracto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ oxpExtractoId, usuarioId, motivo }: DescartarExtractoParams) =>
      httpClient.post<void>(
        `/api/radicacion/comandos/OxpExtracto/${oxpExtractoId}/DescartarBorrador`,
        { UsuarioId: usuarioId, Motivo: motivo },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
  });
}
