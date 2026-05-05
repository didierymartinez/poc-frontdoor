import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import {
  configureSignalR,
  getConnection,
  startConnection,
  joinGroup,
  SignalRContext,
} from '@/shared/api';
import { getSessionUserId } from '@/shared/lib/session-user-id';

function tryJoinUserGroup() {
  joinGroup(getSessionUserId());
}

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { user, getAccessToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const connection = useMemo(() => {
    if (!user) return null;
    configureSignalR({ getAccessToken });
    return getConnection();
  }, [user, getAccessToken]);

  useEffect(() => {
    if (!connection) return;

    const onReconnecting = () => setIsConnected(false);
    const onReconnected = () => {
      setIsConnected(true);
      tryJoinUserGroup();
    };
    const onClose = () => setIsConnected(false);

    connection.onreconnecting(onReconnecting);
    connection.onreconnected(onReconnected);
    connection.onclose(onClose);

    startConnection().then(() => {
      setIsConnected(true);
      tryJoinUserGroup();
    });
  }, [connection]);

  const value = connection ? { connection, isConnected } : null;

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}
