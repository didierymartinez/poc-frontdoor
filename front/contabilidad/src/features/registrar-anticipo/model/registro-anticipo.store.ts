import { create } from 'zustand';

export interface FormularioAnticipoData {
  medioPago: string;
  tarjeta: string;
  fechaTransaccion: string;
  tipoDocumento: string;
  numeroDocumento: string;
  terceroLabel: string;
  terceroId: string;
  moneda: string;
  monto: number;
  soporte: string;
  justificacion: string;
  archivoSoporte: File | null;
}

interface RegistroAnticipoState {
  formulario: FormularioAnticipoData;

  setFormField: <K extends keyof FormularioAnticipoData>(key: K, value: FormularioAnticipoData[K]) => void;
  setFormulario: (data: Partial<FormularioAnticipoData>) => void;
  reset: () => void;
}

const initialFormulario: FormularioAnticipoData = {
  medioPago: '',
  tarjeta: 'visa-default',
  fechaTransaccion: '',
  tipoDocumento: '',
  numeroDocumento: '',
  terceroLabel: '',
  terceroId: '',
  moneda: '',
  monto: 0,
  soporte: '',
  justificacion: '',
  archivoSoporte: null,
};

export const useRegistroAnticipoStore = create<RegistroAnticipoState>((set) => ({
  formulario: initialFormulario,

  setFormField: (key, value) =>
    set((s) => ({ formulario: { ...s.formulario, [key]: value } })),

  setFormulario: (data) =>
    set((s) => ({ formulario: { ...s.formulario, ...data } })),

  reset: () => set({ formulario: initialFormulario }),
}));
