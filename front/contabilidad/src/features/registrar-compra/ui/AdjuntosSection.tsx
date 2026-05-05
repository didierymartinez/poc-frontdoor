import { useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, useTheme } from '@mui/material';
import { IconEye, IconPaperclip, IconX } from '@tabler/icons-react';
import { showToast } from '@/shared/ui';
import { httpClient } from '@/shared/api';
import { base64ToBlobUrl } from '@/shared/lib';
import type { StorageInfo } from '@/entities/borrador';
import { useRegistroCompraStore } from '../model/registro-compra.store';

interface AdjuntosSectionProps {
  oxpId?: string;
  mode?: 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';
  archivosVinculados?: StorageInfo[];
  archivoNombre?: string;
  onOpenDocument?: (url: string, nombre: string) => void;
  onClearHighlights?: () => void;
  onRestoreHighlights?: () => void;
}

const VIEWER_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function canOpenInViewer(tipo: string): boolean {
  return VIEWER_TYPES.some((t) => tipo.startsWith(t));
}

function downloadBlob(url: string, nombre: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function extractFileName(key: string): string {
  // key format: "2026/04/01_uuid_filename.pdf" → extract "filename.pdf"
  const parts = key.split('_');
  return parts.length >= 3 ? parts.slice(2).join('_') : parts[parts.length - 1] ?? key;
}

export function AdjuntosSection({ oxpId, mode = 'borrador', archivosVinculados = [], archivoNombre, onOpenDocument, onClearHighlights, onRestoreHighlights }: AdjuntosSectionProps) {
  const theme = useTheme();
  const [cargando, setCargando] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFiles = useRegistroCompraStore((s) => s.pendingFiles);
  const addPendingFile = useRegistroCompraStore((s) => s.addPendingFile);
  const removePendingFile = useRegistroCompraStore((s) => s.removePendingFile);

  if (mode === 'borrador' || mode === 'confirmada') return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addPendingFile(file);
    e.target.value = '';
  };

  const handleVerArchivo = async (key: string) => {
    if (!oxpId) return;
    setCargando(key);
    try {
      const data = await httpClient.get<{ nombre: string; tipo: string; base64: string }>(
        `/api/radicacion/consultas/OxpComercio/${oxpId}/Soportes?key=${encodeURIComponent(key)}`,
      );
      const url = base64ToBlobUrl(data.base64, data.tipo || 'application/pdf');
      const nombre = data.nombre || extractFileName(key);

      if (canOpenInViewer(data.tipo)) {
        const esDocumentoOcr = archivoNombre && key.includes(archivoNombre);
        if (esDocumentoOcr) {
          onRestoreHighlights?.();
        } else {
          onClearHighlights?.();
        }
        onOpenDocument?.(url, nombre);
      } else {
        downloadBlob(url, nombre);
      }
    } catch (err) {
      showToast((err as Error).message || 'Error al cargar archivo', 'error');
    } finally {
      setCargando(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Archivos vinculados */}
      {archivosVinculados.map((archivo) => (
        <Chip
          key={archivo.key}
          label={extractFileName(archivo.key)}
          size="small"
          variant="outlined"
          onClick={() => handleVerArchivo(archivo.key)}
          icon={cargando === archivo.key ? <CircularProgress size={12} /> : <IconEye size={14} />}
          sx={{
            bgcolor: theme.palette.grey[100],
            color: 'text.primary',
            fontSize: '0.75rem',
            height: 26,
            cursor: 'pointer',
          }}
        />
      ))}

      {/* Archivos pendientes (se suben al enviar) */}
      {pendingFiles.map((file, idx) => (
        <Chip
          key={`pending-${idx}`}
          label={file.name}
          size="small"
          variant="outlined"
          onDelete={() => removePendingFile(idx)}
          deleteIcon={<IconX size={14} />}
          sx={{
            bgcolor: theme.palette.grey[100],
            color: 'text.primary',
            fontSize: '0.75rem',
            height: 26,
            '& .MuiChip-deleteIcon': { color: 'text.secondary', fontSize: 14 },
          }}
        />
      ))}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileSelect}
        accept=".pdf,.png,.jpg,.jpeg"
      />
      <Button
        variant="text"
        startIcon={<IconPaperclip size={16} />}
        onClick={() => fileInputRef.current?.click()}
        sx={{ color: 'primary.main', fontSize: '0.8125rem' }}
      >
        Adjuntar
      </Button>
    </Box>
  );
}
