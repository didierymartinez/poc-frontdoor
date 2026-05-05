import {  createHashRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/app/layouts/ProtectedRoute';
import { ObligacionesPorPagarPage } from '@/pages/entrada-radicador';
import { ConfirmacionPage } from '@/pages/confirmacion';
import { ConciliacionPage } from '@/pages/conciliacion';
import { PendientesPagoPage } from '@/pages/pendientes-pago';
import { AnticipoDetallePage } from '@/pages/anticipo-detalle';
import { RadicacionAnticipoPage, RadicacionCompraPage, RadicacionExtractoPage } from '@/pages/radicacion';
import { ConciliarExtractoPage } from '@/pages/conciliar-extracto';
import { ConfirmacionCompraPage } from '@/pages/confirmacion-compra';
import { RegistroOCRPage } from '@/pages/registro-ocr';
import { EntradasPendientesPage } from '@/pages/borradores-pendientes';
import { RegistroDevolucionPage } from '@/pages/registro-devolucion';
import { DevolucionDetallePage } from '@/pages/devolucion-detalle';
import { HomePage } from '@/pages/home';

export const routes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <HomePage />,
        handle: { title: 'Inicio' },
      },
      {
        path: '/obligaciones-pendientes',
        element: <ObligacionesPorPagarPage />,
        handle: { title: 'Obligaciones por pagar' },
      },
      {
        path: '/causacion',
        element: <ConfirmacionPage />,
        handle: { title: 'Causación' },
      },
      {
        path: '/conciliacion',
        element: <ConciliacionPage />,
        handle: { title: 'Conciliación' },
      },
      {
        path: '/pendientes-pago',
        element: <PendientesPagoPage />,
        handle: { title: 'Pendientes de pago' },
      },
      {
        path: '/entradas-pendientes',
        element: <EntradasPendientesPage />,
        handle: { title: 'Borradores pendientes' },
      },
      {
        path: '/registro-ocr',
        element: <RegistroOCRPage />,
        handle: { title: 'Procesando documento' },
      },
      {
        path: '/registro-anticipo/:id?',
        element: <RadicacionAnticipoPage />,
        handle: { title: 'Registro de anticipo' },
      },
      {
        path: '/registro-compra/:id?',
        element: <RadicacionCompraPage />,
        handle: { title: 'Registro de compra' },
      },
      {
        path: '/registro-extracto/:id?',
        element: <RadicacionExtractoPage />,
        handle: { title: 'Registro de extracto' },
      },
      {
        path: '/registro-devolucion',
        element: <RegistroDevolucionPage />,
        handle: { title: 'Registro de devolución' },
      },
      {
        path: '/conciliar-extracto/:id',
        element: <ConciliarExtractoPage />,
        handle: { title: 'Conciliar extracto' },
      },
      {
        path: '/confirmacion-compra/:id',
        element: <ConfirmacionCompraPage />,
        handle: { title: 'Confirmar compra' },
      },
      {
        path: '/anticipo/:id',
        element: <AnticipoDetallePage />,
        handle: { title: 'Detalle de anticipo' },
      },
      {
        path: '/devolucion/:id',
        element: <DevolucionDetallePage />,
        handle: { title: 'Detalle de devolución' },
      }
    ],
  },
];

export const router = createHashRouter(routes);
