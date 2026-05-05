import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthKitProvider } from '@workos-inc/authkit-react'
import 'dayjs/locale/es'
import cosmosTheme from '@/app/styles/cosmosTheme'
import { router } from '@/app/routes'
import { queryClient } from '@/shared/api'
import { ToastProvider } from '@/shared/ui'
import { SignalRProvider } from '@/app/providers'
import { WORKOS_CLIENT_ID, VITE_APP_BASE } from '@/shared/config'
import { LicenseInfo } from '@mui/x-license';

LicenseInfo.setLicenseKey("77d49a57fbc5f4af35ddb05c5f1742e0Tz0xMTI3MjgsRT0xNzc4MzcxMTk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1RMy0yMDI0LEtWPTI=");

const redirect = `${window.location.origin}${VITE_APP_BASE}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthKitProvider 
      clientId={WORKOS_CLIENT_ID}
      redirectUri="https://cosmos-contabilidad-poc.pages.dev/api/auth/callback"
    >
      <QueryClientProvider client={queryClient}>
        <SignalRProvider>
          <ThemeProvider theme={cosmosTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <CssBaseline />
              <RouterProvider router={router} />
              <ToastProvider />
            </LocalizationProvider>
          </ThemeProvider>
        </SignalRProvider>
      </QueryClientProvider>
    </AuthKitProvider>
  </StrictMode>
)
