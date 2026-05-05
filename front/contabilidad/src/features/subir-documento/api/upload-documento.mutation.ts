import { useMutation } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';

export function useUploadDocumento() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return httpClient.postForm<void>(
        '/api/reconocimiento/comandos/ObligacionesPorPagar/AnalizarEvidenciaEconomica',
        formData,
      );
    },
  });
}
