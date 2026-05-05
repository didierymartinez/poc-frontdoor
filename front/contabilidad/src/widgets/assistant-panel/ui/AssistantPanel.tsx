import { useEffect, useState } from 'react';
import { Box, IconButton, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material';
import {
  IconChartBubble,
  IconChevronRight,
  IconFileText,
  IconMicrophone,
  IconPlus,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import OrbitsIllustration from '@/shared/assets/icono-cosmos.svg';
import { DocumentViewer } from '@/shared/ui';

export interface SuggestionItem {
  title: string;
  description: string;
}

const defaultSuggestions: SuggestionItem[] = [
  {
    title: 'Anticipo próximo a vencer',
    description: 'OXP-YUDGF 2 días sin soporte',
  },
  {
    title: '# Anticipos con fecha de hoy',
    description: 'Hace 14 minutos',
  },
];

const quickActions = [
  'Registrar compra',
  'Registrar anticipo',
  'Registrar devolución',
];

interface AssistantPanelProps {
  onClose?: () => void;
  suggestions?: SuggestionItem[];
  width?: number;
  documentUrl?: string;
  documentName?: string;
  documentLoading?: boolean;
  showDocumentTab?: boolean;
  initialTab?: number;
  onFileUpload?: () => void;
}

export const AssistantPanel = ({
  onClose,
  suggestions = defaultSuggestions,
  width,
  documentUrl,
  documentName,
  documentLoading,
  showDocumentTab = true,
  initialTab = 0,
  onFileUpload,
}: AssistantPanelProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <Box
      sx={{
        ...(width ? { width, flexShrink: 0 } : { flex: 1, minWidth: 0 }),
        height: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'grey.400',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 1,
          pr: 2,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v: number) => setActiveTab(v)}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
        >
          <Tab
            icon={<IconChartBubble size={16} />}
            iconPosition="start"
            label="Asistente"
            sx={{
              gap: 1,
              color: 'primary.main',
              '&.Mui-selected': { color: 'primary.main' },
            }}
          />
          {showDocumentTab && (
            <Tab
              icon={<IconFileText size={16} />}
              iconPosition="start"
              label="Documento"
              sx={{
                gap: 1,
                color: 'primary.main',
                '&.Mui-selected': { color: 'primary.main' },
              }}
            />
          )}
        </Tabs>
        <IconButton size="small" onClick={onClose}>
          <IconX size={16} />
        </IconButton>
      </Box>

      {/* Drawer content */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {activeTab === 1 ? (
          <DocumentViewer url={documentUrl} name={documentName} isLoading={documentLoading} />
        ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            p: 2,
            overflow: 'hidden',
          }}
        >
          {/* Suggestions section */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pt: 5,
              px: 1,
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                pt: 1.5,
                pb: 3,
                borderRadius: '12px 12px 8px 8px',
                background:
                  'linear-gradient(178deg, rgba(225, 230, 255, 0.8) 17%, rgba(225, 230, 255, 0) 94%)',
              }}
            >
              {/* Illustration */}
              <Box
                component="img"
                src={OrbitsIllustration}
                alt=""
                sx={{ width: 72, height: 72 }}
              />

              {/* Title */}
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                Sugerencias
              </Typography>

              {/* Suggestion items */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pl: 1,
                  pr: '34px',
                  overflow: 'auto',
                }}
              >
                {suggestions.map((item) => (
                  <Box
                    key={item.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      width: '100%',
                    }}
                  >
                    <Box sx={{ width: 22, height: 22, flexShrink: 0 }} />
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: '4px',
                        p: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                      <IconButton size="small" sx={{ p: '3px' }}>
                        <IconChevronRight size={16} color={theme.palette.action.active} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Bottom section: Quick actions + Input */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
            {/* Quick actions */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {quickActions.map((action) => (
                <Box key={action} sx={{ position: 'relative' }}>
                  {/* Blurred shadow */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 4,
                      top: 4,
                      width: 'calc(100% - 0px)',
                      height: 30,
                      borderRadius: '8px',
                      bgcolor: 'primary.main',
                      opacity: 0.2,
                      filter: 'blur(3.1px)',
                    }}
                  />
                  {/* Button */}
                  <Box
                    component="button"
                    sx={{
                      position: 'relative',
                      bgcolor: 'background.paper',
                      border: 'none',
                      borderRadius: '8px',
                      height: 30,
                      px: 1,
                      py: 0.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': { bgcolor: 'grey.50' },
                    }}
                  >
                    <Typography variant="caption" color="primary.main">
                      {action}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Input prompt */}
            <Box
              sx={{
              
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: '20px',
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ minHeight: 16 }}
              >
                Podemos continuar con validar, radicar o revisar pagos ...
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <IconButton size="small" sx={{ p: '1px' }} onClick={onFileUpload}>
                  <IconPlus size={20} color={theme.palette.action.active} />
                </IconButton>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <IconButton size="small" sx={{ p: '1px' }}>
                    <IconMicrophone size={20} color={theme.palette.action.active} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'action.disabledBackground',
                      borderRadius: '100px',
                      p: '1px',
                    }}
                  >
                    <IconSend size={20} color={theme.palette.action.active} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Disclaimer */}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textAlign: 'center', width: '100%' }}
            >
              El contenido generado por IA puede ser incorrecto.
            </Typography>
          </Box>
        </Box>
        )}
      </Paper>
    </Box>
  );
};
