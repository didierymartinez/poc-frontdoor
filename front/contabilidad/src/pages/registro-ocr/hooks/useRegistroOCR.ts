import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocumentViewerStore } from '@/shared/model';
import { useUploadDocumento } from '@/features/subir-documento';
import { useOnNotificacion } from '@/shared/api';
import type { RadicacionNotificacion, RegistroNotificacion } from '@/entities/borrador';

const TIMEOUT_MS = 120_000;

export type PageStatus = 'uploading' | 'processing' | 'error' | 'timeout';

export function useRegistroOCR() {
  const location = useLocation();
  const navigate = useNavigate();
  const storeOpenDocument = useDocumentViewerStore((s) => s.openDocument);
  const cleanupRef = useRef<string | null>(null);
  const [status, setStatus] = useState<PageStatus>('uploading');
  const [errorMsg, setErrorMsg] = useState('');
  const uploadedRef = useRef(false);

  const pendingFile = location.state?.pendingFile as File | undefined;

  const fileUrl = useMemo(() => {
    if (!pendingFile) return undefined;
    const url = URL.createObjectURL(pendingFile);
    cleanupRef.current = url;
    return url;
  }, [pendingFile]);

  const uploadMutation = useUploadDocumento();

  const openDocAndNavigate = useCallback(
    (id: string, route: string) => {
      if (fileUrl && pendingFile) {
        storeOpenDocument(fileUrl, pendingFile.name);
        cleanupRef.current = null;
      }
      navigate(`${route}/${id}`, { replace: true, state: { fromOcr: true } });
    },
    [fileUrl, pendingFile, storeOpenDocument, navigate],
  );

  const isListening = status === 'uploading' || status === 'processing';

  useOnNotificacion<RadicacionNotificacion>({
    tipo: 'ComercioRadicado',
    enabled: isListening,
    onMessage: (p) => openDocAndNavigate(p.id, '/registro-compra'),
  });

  useOnNotificacion<RadicacionNotificacion>({
    tipo: 'ExtractoRadicado',
    enabled: isListening,
    onMessage: (p) => openDocAndNavigate(p.id, '/registro-extracto'),
  });

  useOnNotificacion<RegistroNotificacion>({
    tipo: 'AnticipoRegistrado',
    enabled: isListening,
    onMessage: (p) => openDocAndNavigate(p.id, '/registro-anticipo'),
  });

  useOnNotificacion<RegistroNotificacion>({
    tipo: 'DevolucionRadicada',
    enabled: isListening,
    onMessage: (p) => openDocAndNavigate(p.id, '/registro-devolucion'),
  });

  // Timeout
  useEffect(() => {
    if (!isListening) return;
    const timer = setTimeout(() => setStatus('timeout'), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isListening]);

  // Upload on mount
  useEffect(() => {
    if (!pendingFile || uploadedRef.current) return;
    uploadedRef.current = true;
    uploadMutation.mutate(pendingFile, {
      onSuccess: () => setStatus('processing'),
      onError: (err) => { setStatus('error'); setErrorMsg(err.message); },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFile]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (cleanupRef.current) { URL.revokeObjectURL(cleanupRef.current); cleanupRef.current = null; }
    };
  }, []);

  // Redirect if no file
  useEffect(() => {
    if (!pendingFile) navigate('/', { replace: true });
  }, [pendingFile, navigate]);

  const handleRetry = () => {
    setStatus('uploading');
    setErrorMsg('');
    uploadMutation.mutate(pendingFile!, {
      onSuccess: () => setStatus('processing'),
      onError: (err) => { setStatus('error'); setErrorMsg(err.message); },
    });
  };

  return { status, errorMsg, pendingFile, fileUrl, handleRetry, navigate };
}
