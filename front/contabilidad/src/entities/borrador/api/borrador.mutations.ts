import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';

// ---------------------------------------------------------------------------
// Vincular archivo soporte (multipart/form-data)
// POST /api/radicacion/comandos/ObligacionPorPagar/{id}/ArchivoSoporte
// ---------------------------------------------------------------------------

export function useVincularArchivoSoporte() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return httpClient.postForm<void>(
        `/api/radicacion/comandos/ObligacionPorPagar/${id}/ArchivoSoporte`,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}
