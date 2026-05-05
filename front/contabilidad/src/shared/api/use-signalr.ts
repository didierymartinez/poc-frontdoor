import { createContext, useContext } from 'react';
import type { HubConnection } from '@microsoft/signalr';

export interface SignalRContextValue {
  connection: HubConnection;
  isConnected: boolean;
}

export const SignalRContext = createContext<SignalRContextValue | null>(null);

export function useSignalR(): SignalRContextValue {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error('useSignalR must be used within <SignalRProvider>');
  return ctx;
}
