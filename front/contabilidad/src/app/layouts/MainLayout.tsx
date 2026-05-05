import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import {
  IconArrowBackUp,
  IconArrowLeft,
  IconChartBubble,
  IconCheckbox,
  IconClipboardList,
  IconCoin,
  IconFileInvoice,
  IconLicense,
  IconHome,
  IconMenu2,
  IconReceipt,
  IconScale,
  IconWallet,
} from '@tabler/icons-react';
import { AssistantPanel } from '@/widgets/assistant-panel';
import { useFileUpload } from '@/features/subir-documento';
import { SplitViewHandle } from '@/shared/ui';
import { useDocumentViewerStore } from '@/shared/model';
import type { MainLayoutContext } from '@/shared/model';
export type { MainLayoutContext } from '@/shared/model';

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 900;
const DEFAULT_PANEL_WIDTH = 400;

const PARENT_ROUTE_MAP: Record<string, string> = {
  '/registro-compra': '/obligaciones-pendientes',
  '/registro-anticipo': '/obligaciones-pendientes',
  '/registro-extracto': '/obligaciones-pendientes',
  '/registro-devolucion': '/obligaciones-pendientes',
  '/conciliar-extracto': '/conciliacion',
  '/confirmacion-compra': '/causacion',
  '/confirmacion-extracto-conciliado': '/conciliacion',
  '/anticipo': '/causacion',
  '/devolucion': '/causacion',
};

function resolveParentRoute(pathname: string): string {
  for (const [prefix, parent] of Object.entries(PARENT_ROUTE_MAP)) {
    if (pathname.startsWith(prefix)) return parent;
  }
  return '/';
}

const NAV_REGISTROS = [
  { icon: IconReceipt, label: 'Registro de compra', path: '/registro-compra' },
  { icon: IconLicense, label: 'Registro de extracto', path: '/registro-extracto' },
  { icon: IconCoin, label: 'Registro de anticipo', path: '/registro-anticipo' },
  { icon: IconArrowBackUp, label: 'Registro de devolución', path: '/registro-devolucion' },
];

const NAV_GESTION = [
  { icon: IconFileInvoice, label: 'Obligaciones pendientes', path: '/obligaciones-pendientes' },
  { icon: IconCheckbox, label: 'Causación', path: '/causacion' },
  { icon: IconScale, label: 'Conciliación', path: '/conciliacion' },
  { icon: IconWallet, label: 'Pendientes de pago', path: '/pendientes-pago' },
  { icon: IconClipboardList, label: 'Borradores pendientes', path: '/entradas-pendientes' },
];

interface RouteHandle {
  title?: string;
}

export function MainLayout() {
  const [showAssistant, setShowAssistant] = useState(true);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();

  const { openFilePicker } = useFileUpload();
  const { documentUrl, documentName, documentLoading, initialTab, openDocument, resetTab, clearDocument } =
    useDocumentViewerStore();

  const handleOpenDocument = useCallback(
    (url: string, name: string) => {
      openDocument(url, name);
      setShowAssistant(true);
    },
    [openDocument],
  );

  const currentHandle = matches.at(-1)?.handle as RouteHandle | undefined;
  const pageTitle = currentHandle?.title;

  const handleResize = useCallback((deltaX: number) => {
    setPanelWidth((prev) => {
      const newWidth = prev - deltaX;
      return Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));
    });
  }, []);

  // When the store signals a document is ready (e.g. after OCR), show assistant.
  // Uses the "adjust state during render" pattern instead of an effect.
  const [lastDocTrigger, setLastDocTrigger] = useState<string | null>(null);
  const docTrigger = initialTab === 1 && documentUrl ? documentUrl : null;
  if (docTrigger && docTrigger !== lastDocTrigger) {
    setLastDocTrigger(docTrigger);
    setShowAssistant(true);
  }

  // Clear document only when leaving registro/conciliar pages (not when navigating between them)
  const isOcrPage = location.pathname === '/registro-ocr';
  const isRegistroPage = location.pathname.startsWith('/registro-') || location.pathname.startsWith('/conciliar-extracto');

  useEffect(() => {
    if (!isOcrPage && !isRegistroPage) {
      clearDocument();
    }
  }, [location.pathname, isOcrPage, isRegistroPage, clearDocument]);

  // Hide assistant panel when on /registro-ocr (page has its own embedded visor)
  const mainRoutes = ['/','/obligaciones-pendientes', '/causacion', '/conciliacion', '/pendientes-pago', '/entradas-pendientes'];
  const isSubPage = !mainRoutes.includes(location.pathname) && !isOcrPage;
  const assistantVisible = showAssistant && !isOcrPage;

  // On registro pages, always show assistant tab by default
  const effectiveTab = isRegistroPage && !isOcrPage ? 0 : initialTab;

  // 50/50 split on registro pages when a document is loaded
  const isSplitView = isRegistroPage && !isOcrPage && !!documentUrl;

  // Adjust panel width to ~50% when entering split view.
  // Uses the "adjust state during render" pattern instead of an effect.
  const [wasSplitView, setWasSplitView] = useState(isSplitView);
  if (isSplitView !== wasSplitView) {
    setWasSplitView(isSplitView);
    if (isSplitView && panelWidth < 500) {
      setPanelWidth(Math.round(window.innerWidth / 2));
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Shared header */}
        {pageTitle && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => setDrawerOpen(true)}>
                <IconMenu2 size={20} />
              </IconButton>
              {isSubPage && (
                <IconButton size="small" onClick={() => navigate(resolveParentRoute(location.pathname))}>
                  <IconArrowLeft size={18} />
                </IconButton>
              )}
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                {pageTitle}
              </Typography>
            </Box>

            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 280, pt: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ px: 2, mb: 1 }}>
                  Obligaciones por pagar
                </Typography>
                <List dense>
                  <ListItemButton
                    selected={location.pathname === '/'}
                    onClick={() => { navigate('/'); setDrawerOpen(false); }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}><IconHome size={20} /></ListItemIcon>
                    <ListItemText primary="Inicio" />
                  </ListItemButton>
                  <Divider sx={{ my: 1 }} />
                  <ListSubheader sx={{ lineHeight: '32px' }}>Gestión</ListSubheader>
                  {NAV_GESTION.map(({ icon: Icon, label, path }) => (
                    <ListItemButton
                      key={path}
                      selected={location.pathname === path}
                      onClick={() => { navigate(path); setDrawerOpen(false); }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}><Icon size={20} /></ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <ListSubheader sx={{ lineHeight: '32px' }}>Registrar nueva obligación</ListSubheader>
                  {NAV_REGISTROS.map(({ icon: Icon, label, path }) => (
                    <ListItemButton
                      key={path}
                      selected={location.pathname.startsWith(path)}
                      onClick={() => { navigate(path); setDrawerOpen(false); }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}><Icon size={20} /></ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </Drawer>
            {!assistantVisible && !isOcrPage && (
              <Button
                variant="outlined"
                startIcon={<IconChartBubble size={16} />}
                onClick={() => setShowAssistant(true)}
                sx={{
                  borderRadius: '100px',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  height: 26,
                  px: '10px',
                  py: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  gap: '2px',
                  textTransform: 'none',
                  '& .MuiButton-startIcon': { mr: '2px' },
                }}
              >
                Asistente
              </Button>
            )}
          </Box>
        )}

        {/* Page content */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Outlet context={{ openDocument: handleOpenDocument } satisfies MainLayoutContext} />
        </Box>
      </Box>

      {/* Split view handle + Assistant panel */}
      {assistantVisible && (
        <>
          <SplitViewHandle onResize={handleResize} />
          <AssistantPanel
            onClose={() => {
              setShowAssistant(false);
              resetTab();
            }}
            width={panelWidth}
            documentUrl={documentUrl}
            documentName={documentName}
            documentLoading={documentLoading}
            showDocumentTab={isRegistroPage || !!documentUrl}
            initialTab={effectiveTab}
            onFileUpload={openFilePicker}
          />
        </>
      )}
    </Box>
  );
}
