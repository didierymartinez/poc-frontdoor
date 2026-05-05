import { create } from 'zustand';

// Highlight source for OCR bounding boxes (mirrored from entities/borrador types to avoid upward import)
export interface HighlightCoord {
  x: number;
  y: number;
}

export interface HighlightUbicacion {
  superiorIzquierda: HighlightCoord;
  superiorDerecha: HighlightCoord;
  inferiorIzquierda: HighlightCoord;
  inferiorDerecha: HighlightCoord;
}

export interface HighlightSource {
  pageNumber: number;
  ubicacion: HighlightUbicacion;
}

interface DocumentViewerState {
  documentUrl: string | undefined;
  documentName: string | undefined;
  documentLoading: boolean;
  initialTab: number;
  highlightSource: HighlightSource | null;
  unidadMedidaCoordenadas: string;

  openDocument: (url: string, name: string) => void;
  setDocumentLoading: (loading: boolean) => void;
  setHighlightSource: (source: HighlightSource | null) => void;
  setUnidadMedidaCoordenadas: (unit: string) => void;
  clearDocument: () => void;
  resetTab: () => void;
}

export const useDocumentViewerStore = create<DocumentViewerState>((set) => ({
  documentUrl: undefined,
  documentName: undefined,
  documentLoading: false,
  initialTab: 0,
  highlightSource: null,
  unidadMedidaCoordenadas: 'pixel',

  openDocument: (url, name) =>
    set({ documentUrl: url, documentName: name, documentLoading: false, initialTab: 1 }),

  setDocumentLoading: (loading) =>
    set({ documentLoading: loading }),

  setHighlightSource: (source) =>
    set({ highlightSource: source }),

  setUnidadMedidaCoordenadas: (unit) =>
    set({ unidadMedidaCoordenadas: unit }),

  clearDocument: () =>
    set({ documentUrl: undefined, documentName: undefined, documentLoading: false, highlightSource: null, initialTab: 0 }),

  resetTab: () => set({ initialTab: 0 }),
}));
