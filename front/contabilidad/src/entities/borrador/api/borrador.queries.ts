import { queryOptions } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import type {
  VistaOxpExtracto,
  VistaOxpComercio,
  VistaAnticipo,
  VistaExtractoConciliacion,
  BorradorExtractoDetalle,
  BorradorComercioDetalle,
  AnticipoDetalle,
  VistaComercioDevolucion,
  VistaExtractoDevolucion,
  VistaAnticipoDevolucion,
  VistaDevolucion,
  DevolucionDetalle,
} from '../model/borrador-api.types';

export const borradorQueries = {

  /** GET /api/radicacion/consultas/OxpExtracto/Borradores */
  borradoresExtracto: () =>
    queryOptions({
      queryKey: ['borradores', 'extracto'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpExtracto[]>('/api/radicacion/consultas/OxpExtracto/Borradores', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpComercio/Borradores */
  borradoresComercio: () =>
    queryOptions({
      queryKey: ['borradores', 'comercio'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpComercio[]>('/api/radicacion/consultas/OxpComercio/Borradores', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpComercio/Pendientes */
  pendientesComercio: () =>
    queryOptions({
      queryKey: ['obligaciones', 'comercio', 'pendientes'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpComercio[]>('/api/radicacion/consultas/OxpComercio/Pendientes', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpExtracto/Pendientes */
  pendientesExtracto: () =>
    queryOptions({
      queryKey: ['obligaciones', 'extracto', 'pendientes'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpExtracto[]>('/api/radicacion/consultas/OxpExtracto/Pendientes', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpComercio/Confirmadas */
  confirmadasComercio: () =>
    queryOptions({
      queryKey: ['obligaciones', 'comercio', 'confirmadas'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpComercio[]>('/api/radicacion/consultas/OxpComercio/Confirmadas', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpComercio/Causadas */
  causadasComercio: () =>
    queryOptions({
      queryKey: ['obligaciones', 'comercio', 'causadas'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpComercio[]>('/api/radicacion/consultas/OxpComercio/Causadas', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpExtracto/Conciliados */
  conciliadosExtracto: () =>
    queryOptions({
      queryKey: ['obligaciones', 'extracto', 'conciliados'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaOxpExtracto[]>('/api/radicacion/consultas/OxpExtracto/Conciliados', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxpExtracto/EnConciliacion */
  enConciliacionExtracto: () =>
    queryOptions({
      queryKey: ['obligaciones', 'extracto', 'en-conciliacion'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaExtractoConciliacion[]>('/api/radicacion/consultas/OxpExtracto/EnConciliacion', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/OxPExtracto/{id} */
  detalleExtracto: (id: string) =>
    queryOptions({
      queryKey: ['borradores', 'extracto', id] as const,
      queryFn: ({ signal }) =>
        httpClient.get<BorradorExtractoDetalle>(`/api/radicacion/consultas/OxPExtracto/${id}`, signal),
      enabled: !!id,
    }),

  /** GET /api/radicacion/consultas/OxpComercio/{id} */
  detalleComercio: (id: string) =>
    queryOptions({
      queryKey: ['borradores', 'comercio', id] as const,
      queryFn: ({ signal }) =>
        httpClient.get<BorradorComercioDetalle>(`/api/radicacion/consultas/OxpComercio/${id}`, signal),
      enabled: !!id,
    }),

  /** GET /api/radicacion/consultas/Anticipo/Borradores */
  borradoresAnticipo: () =>
    queryOptions({
      queryKey: ['borradores', 'anticipo'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaAnticipo[]>('/api/radicacion/consultas/Anticipo/Borradores', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Anticipo/Vigentes */
  vigentesAnticipo: () =>
    queryOptions({
      queryKey: ['anticipos', 'vigentes'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaAnticipo[]>('/api/radicacion/consultas/Anticipo/Vigentes', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Anticipo/Todos */
  todosAnticipo: () =>
    queryOptions({
      queryKey: ['anticipos', 'todos'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaAnticipo[]>('/api/radicacion/consultas/Anticipo/Todos', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Anticipo/{id} */
  detalleAnticipo: (id: string) =>
    queryOptions({
      queryKey: ['anticipos', id] as const,
      queryFn: ({ signal }) =>
        httpClient.get<AnticipoDetalle>(`/api/radicacion/consultas/Anticipo/${id}`, signal),
      enabled: !!id,
    }),

  /** GET /api/radicacion/consultas/Devolucion/ComerciosDisponibles */
  comerciosDisponiblesDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'comercios-disponibles'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaComercioDevolucion[]>('/api/radicacion/consultas/Devolucion/ComerciosDisponibles', signal),
      staleTime: 30_000,
    }),

  /** GET /api/radicacion/consultas/Devolucion/ExtractosDisponibles */
  extractosDisponiblesDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'extractos-disponibles'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaExtractoDevolucion[]>('/api/radicacion/consultas/Devolucion/ExtractosDisponibles', signal),
      staleTime: 30_000,
    }),

  /** GET /api/radicacion/consultas/Devolucion/AnticiposDisponibles */
  anticiposDisponiblesDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'anticipos-disponibles'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaAnticipoDevolucion[]>('/api/radicacion/consultas/Devolucion/AnticiposDisponibles', signal),
      staleTime: 30_000,
    }),

  /** GET /api/radicacion/consultas/Devolucion/Todas */
  todasDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'todas'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaDevolucion[]>('/api/radicacion/consultas/Devolucion/Todas', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Devolucion/Pendientes */
  pendientesDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'pendientes'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaDevolucion[]>('/api/radicacion/consultas/Devolucion/Pendientes', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Devolucion/Confirmadas */
  confirmadasDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'confirmadas'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaDevolucion[]>('/api/radicacion/consultas/Devolucion/Confirmadas', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Devolucion/Causadas */
  causadasDevolucion: () =>
    queryOptions({
      queryKey: ['devoluciones', 'causadas'] as const,
      queryFn: ({ signal }) =>
        httpClient.get<VistaDevolucion[]>('/api/radicacion/consultas/Devolucion/Causadas', signal),
      staleTime: 0,
    }),

  /** GET /api/radicacion/consultas/Devolucion/{id} */
  detalleDevolucion: (id: string) =>
    queryOptions({
      queryKey: ['devoluciones', id] as const,
      queryFn: ({ signal }) =>
        httpClient.get<DevolucionDetalle>(`/api/radicacion/consultas/Devolucion/${id}`, signal),
      enabled: !!id,
    }),
};
