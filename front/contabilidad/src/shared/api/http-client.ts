import { API_BASE_URL } from '@/shared/config';
import { getSessionUserId } from '@/shared/lib/session-user-id';

class HttpError extends Error {
  status: number;
  statusText: string;
  body?: unknown;

  constructor(status: number, statusText: string, body?: unknown) {
    super(statusText);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* empty */
    }
    // Extract detail from ProblemDetails (RFC 7807) if available
    const detail = (body as { detail?: string } | undefined)?.detail;
    throw new HttpError(res.status, detail ?? res.statusText, body);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

class HttpClient {
  private accessTokenGetter: (() => Promise<string>) | null = null;

  configure({ getAccessToken }: { getAccessToken: () => Promise<string> }) {
    this.accessTokenGetter = getAccessToken;
  }

  private async defaultHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': getSessionUserId(),
    };

    if (this.accessTokenGetter) {
      headers['Authorization'] = `Bearer ${await this.accessTokenGetter()}`;
    }

    return headers;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'X-User-Id': getSessionUserId(),
    };

    if (this.accessTokenGetter) {
      headers['Authorization'] = `Bearer ${await this.accessTokenGetter()}`;
    }

    return headers;
  }

  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'GET',
      headers: await this.defaultHeaders(),
      signal,
    });
    return handleResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: await this.defaultHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    return handleResponse<T>(res);
  }

  async postForm<T>(path: string, formData: FormData, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: await this.authHeaders(),
      body: formData,
      signal,
    });
    return handleResponse<T>(res);
  }

  async put<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: await this.defaultHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    return handleResponse<T>(res);
  }

  async delete<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers: await this.defaultHeaders(),
      signal,
    });
    return handleResponse<T>(res);
  }
}

export const httpClient = new HttpClient();
