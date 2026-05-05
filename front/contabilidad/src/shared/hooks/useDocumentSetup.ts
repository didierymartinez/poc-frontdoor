import { useEffect } from 'react';
import { useDocumentViewerStore } from '@/shared/model';
import { base64ToBlobUrl } from '@/shared/lib';

interface UseDocumentSetupOptions {
  id?: string;
  isPending: boolean;
  archivo?: { base64?: string; tipo?: string; nombre?: string };
  ocr?: { unidadMedidaCoordenadas?: string };
  openDocument: (url: string, name: string) => void;
}

/**
 * Handles document viewer loading state, blob URL creation, and OCR unit setup.
 * Shared across all radicacion page hooks.
 */
export function useDocumentSetup({ id, isPending, archivo, ocr, openDocument }: UseDocumentSetupOptions) {
  const setDocumentLoading = useDocumentViewerStore((s) => s.setDocumentLoading);
  const setUnidadMedida = useDocumentViewerStore((s) => s.setUnidadMedidaCoordenadas);
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);

  useEffect(() => {
    if (id && isPending) setDocumentLoading(true);
  }, [id, isPending, setDocumentLoading]);

  useEffect(() => {
    if (!archivo && !ocr) return;
    if (ocr?.unidadMedidaCoordenadas) setUnidadMedida(ocr.unidadMedidaCoordenadas);

    if (archivo?.base64) {
      const url = base64ToBlobUrl(archivo.base64, archivo.tipo || 'application/pdf');
      openDocument(url, archivo.nombre || 'documento');
      return () => URL.revokeObjectURL(url);
    }
    setDocumentLoading(false);
  }, [archivo, ocr, openDocument, setDocumentLoading, setUnidadMedida]);

  return { setHighlightSource };
}
