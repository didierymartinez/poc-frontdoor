import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/shared/config';

export function useRegistrarAnticipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<string> => {
      const res = await fetch(`${API_BASE_URL}/api/radicacion/comandos/Anticipo`, {
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
      const location = res.headers.get('Location') ?? '';
      const id = location.split('/').pop() ?? '';
      return id || await res.text();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anticipos'] });
      queryClient.invalidateQueries({ queryKey: ['borradores'] });
    },
  });
}
