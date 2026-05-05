import { create } from 'zustand';
import type { ConceptoRow } from '@/entities/concepto';

export interface FormularioComercioData {
  medioPago: string;
  tarjeta: string;
  fechaTransaccion: string;
  tipoDocumento: string;
  numeroDocumento: string;
  terceroLabel: string;
  moneda: string;
  monto: number;
  soporte: string;
  descripcion: string;
}

interface RegistroCompraState {
  // Form fields
  formulario: FormularioComercioData;
  // Conceptos table
  conceptos: ConceptoRow[];
  // Pending files (uploaded on submit, not immediately)
  pendingFiles: File[];

  // Actions
  setFormField: <K extends keyof FormularioComercioData>(key: K, value: FormularioComercioData[K]) => void;
  setFormulario: (data: Partial<FormularioComercioData>) => void;
  setConceptos: (conceptos: ConceptoRow[]) => void;
  addPendingFile: (file: File) => void;
  removePendingFile: (index: number) => void;
  clearPendingFiles: () => void;
  reset: () => void;
}

const initialFormulario: FormularioComercioData = {
  medioPago: '',
  tarjeta: 'visa-default',
  fechaTransaccion: '',
  tipoDocumento: '',
  numeroDocumento: '',
  terceroLabel: '',
  moneda: '',
  monto: 0,
  soporte: '',
  descripcion: '',
};

export const useRegistroCompraStore = create<RegistroCompraState>((set) => ({
  formulario: initialFormulario,
  conceptos: [],
  pendingFiles: [],

  setFormField: (key, value) =>
    set((s) => ({ formulario: { ...s.formulario, [key]: value } })),

  setFormulario: (data) =>
    set((s) => ({ formulario: { ...s.formulario, ...data } })),

  setConceptos: (conceptos) => set({ conceptos }),

  addPendingFile: (file) =>
    set((s) => ({ pendingFiles: [...s.pendingFiles, file] })),

  removePendingFile: (index) =>
    set((s) => ({ pendingFiles: s.pendingFiles.filter((_, i) => i !== index) })),

  clearPendingFiles: () => set({ pendingFiles: [] }),

  reset: () => set({ formulario: initialFormulario, conceptos: [], pendingFiles: [] }),
}));
