import { setupServer } from 'msw/node';

export const server = setupServer();

export const requestLog: { method: string; url: string; body?: unknown }[] = [];

server.events.on('request:match', async ({ request }) => {
  let body: unknown;
  try {
    body = await request.clone().json();
  } catch {
    /* no JSON body */
  }
  requestLog.push({ method: request.method, url: request.url, body });
});

export function clearRequestLog() {
  requestLog.length = 0;
}
