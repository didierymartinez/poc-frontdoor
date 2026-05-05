import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '@/shared/config';

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let accessTokenGetter: (() => Promise<string>) | null = null;

export function configureSignalR({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string>;
}) {
  accessTokenGetter = getAccessToken;
}

export function getConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () =>
          accessTokenGetter ? accessTokenGetter() : '',
      })
      .withAutomaticReconnect([0, 2_000, 5_000])
      .configureLogging(LogLevel.Warning)
      .build();
  }
  return connection;
}

export function startConnection(): Promise<void> {
  const conn = getConnection();
  if (conn.state === HubConnectionState.Connected) {
    return Promise.resolve();
  }
  if (!startPromise) {
    startPromise = conn.start().finally(() => {
      startPromise = null;
    });
  }
  return startPromise;
}

export async function stopConnection(): Promise<void> {
  if (connection && connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

export function sendWsMessage(type: string, data: object): Promise<void> {
  const conn = getConnection();
  if (conn.state !== HubConnectionState.Connected) {
    return Promise.resolve();
  }
  const cloudEvent = JSON.stringify({ type, data });
  return conn.invoke('ReceiveMessage', cloudEvent);
}

export function joinGroup(grupoId: string): Promise<void> {
  return sendWsMessage('unirse_a_grupo', { grupoId });
}

export function leaveGroup(grupoId: string): Promise<void> {
  return sendWsMessage('salir_de_grupo', { grupoId });
}
