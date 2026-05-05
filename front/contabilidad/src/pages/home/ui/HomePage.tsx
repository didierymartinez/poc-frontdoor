import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardActionArea, Chip, Divider, Stack, Typography, useTheme } from '@mui/material';
import {
  IconFileInvoice,
  IconCheckbox,
  IconClipboardList,
  IconCoin,
  IconReceipt,
  IconLicense,
  IconArrowBackUp,
  IconArrowRight,
  IconScale,
  IconWallet,
} from '@tabler/icons-react';
import { useAuth } from '@workos-inc/authkit-react';
import { OrganizationSwitcher, WorkOsWidgets } from '@workos-inc/widgets';
import { queryClient } from '@/shared/api';
import '@radix-ui/themes/styles.css';
import '@workos-inc/widgets/styles.css';


interface QuickAccessCardProps {
  icon: typeof IconFileInvoice;
  title: string;
  description: string;
  path: string;
  color: string;
  badge?: string;
}

const AuthWrapper = ({ getAccessToken, switchToOrganization, isLoading }: Pick<ReturnType<typeof useAuth>, 'getAccessToken' | 'switchToOrganization' | 'isLoading'>) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    getAccessToken().then(setToken);
  }, [isLoading, getAccessToken]);

  if (!token) return null;

  return (
    <WorkOsWidgets
      queryClient={queryClient}
      theme={{hasBackground:false}}
    >
      <OrganizationSwitcher authToken={token} switchToOrganization={switchToOrganization} />
    </WorkOsWidgets>
  );
};

function QuickAccessCard({ icon: Icon, title, description, path, color, badge }: QuickAccessCardProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'grey.200',
        borderRadius: 2,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 0 0 1px ${color}20`,
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(path)}
        sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 1.5 }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={color} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography variant="subtitle2" color="text.primary">
              {title}
            </Typography>
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  bgcolor: `${color}18`,
                  color,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <IconArrowRight size={16} color={theme.palette.text.disabled} style={{ marginTop: 4, flexShrink: 0 }} />
      </CardActionArea>
    </Card>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
      {children}
    </Typography>
  );
}

export const HomePage = () => {
  const theme = useTheme();
  const { getAccessToken, switchToOrganization, isLoading } = useAuth();

  const registros: QuickAccessCardProps[] = [
    {
      icon: IconReceipt,
      title: 'Registro de compra',
      description: 'Crear nueva obligación de compra con OCR',
      path: '/registro-compra',
      color: theme.palette.primary.main,
    },
    {
      icon: IconLicense,
      title: 'Registro de extracto',
      description: 'Radicar extracto bancario con partidas',
      path: '/registro-extracto',
      color: theme.palette.secondary.main,
    },
    {
      icon: IconCoin,
      title: 'Registro de anticipo',
      description: 'Crear anticipo sin documento adjunto',
      path: '/registro-anticipo',
      color: theme.palette.warning.main,
    },
    {
      icon: IconArrowBackUp,
      title: 'Registro de devolución',
      description: 'Iniciar proceso de devolución',
      path: '/registro-devolucion',
      color: theme.palette.error.main,
    },
  ];

  const gestion: QuickAccessCardProps[] = [
    {
      icon: IconFileInvoice,
      title: 'Obligaciones pendientes',
      description: 'Obligaciones por pagar en proceso de radicación',
      path: '/obligaciones-pendientes',
      color: theme.palette.primary.main,
    },
    {
      icon: IconCheckbox,
      title: 'Causación',
      description: 'Revisar y confirmar obligaciones radicadas',
      path: '/causacion',
      color: theme.palette.success.main,
    },
    {
      icon: IconScale,
      title: 'Conciliación',
      description: 'Conciliar extractos bancarios',
      path: '/conciliacion',
      color: theme.palette.secondary.main,
    },
    {
      icon: IconWallet,
      title: 'Pendientes de pago',
      description: 'Compras causadas pendientes de pago',
      path: '/pendientes-pago',
      color: theme.palette.warning.main,
    },
    {
      icon: IconClipboardList,
      title: 'Borradores pendientes',
      description: 'Documentos en proceso de reconocimiento OCR',
      path: '/entradas-pendientes',
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
            Obligaciones por pagar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistema de gestión de obligaciones financieras
          </Typography>
        </Box>

      </Box>


      <Stack spacing={3}>
        {/* Registros */}
        <Box>
          <SectionTitle>Registrar nueva obligación</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            {registros.map((item) => (
              <QuickAccessCard key={item.path} {...item} />
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Gestión */}
        <Box>
          <SectionTitle>Gestión</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            {gestion.map((item) => (
              <QuickAccessCard key={item.path} {...item} />
            ))}
          </Box>
        </Box>
      </Stack>

      <AuthWrapper  getAccessToken={getAccessToken} switchToOrganization={switchToOrganization} isLoading={isLoading} />

    </Box>
  );
}
