import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { IconCircleCheck, IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

type Severity = 'success' | 'error' | 'warning' | 'info';

const ICON_MAP: Record<Severity, React.ReactNode> = {
  success: <IconCircleCheck size={20} />,
  error: <IconAlertCircle size={20} />,
  warning: <IconAlertTriangle size={20} />,
  info: <IconInfoCircle size={20} />,
};

const ACCENT: Record<Severity, string> = {
  success: '#2e7d32',
  error: '#d14343',
  warning: '#ed6c02',
  info: '#2F43D0',
};

export function showToast(message: string, severity: Severity = 'info') {
  const opts: ToastOptions = {
    toastId: message,
    icon: () => ICON_MAP[severity],
    style: {
      borderLeft: `4px solid ${ACCENT[severity]}`,
    },
  };
  toast(message, opts);
}
