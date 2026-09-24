import { Platform } from 'react-native';

// Android emulators can't reach the host machine via `localhost` — 10.0.2.2 is the
// standard loopback alias for the AVD. A physical device needs the machine's LAN
// IP instead; override with EXPO_PUBLIC_API_URL in that case.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:3000/api/v1`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Session tokens now persist across app restarts (see authStore), so a stale
// token that the server has since revoked/expired needs a way to force a
// fresh login instead of every screen just silently failing forever. Set by
// authStore itself to avoid a circular import.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        // Fastify rejects a JSON content-type on a request with no body
        // (e.g. the bodiless POST/DELETE of article favorites).
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Network request failed', 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized();
    throw new ApiError(data?.message ?? 'Request failed', response.status);
  }
  return data;
}

// For file uploads (multipart/form-data) — fetch sets its own boundary-aware
// Content-Type when the body is a FormData instance, so it must NOT be set manually.
// Uses XMLHttpRequest rather than fetch: Expo's global fetch (expo/fetch)
// can't send React Native's `{ uri, name, type }` file parts in a FormData —
// such an upload fails instantly with a generic network error.
export function apiUpload(path, { fileUri, fileName, mimeType, token }) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType });

    const request = new XMLHttpRequest();
    request.open('POST', `${API_URL}${path}`);
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.onload = () => {
      let data = null;
      try {
        data = JSON.parse(request.responseText);
      } catch {
        // non-JSON body (e.g. a proxy error page)
      }
      if (request.status >= 200 && request.status < 300) {
        resolve(data);
        return;
      }
      if (request.status === 401 && token) onUnauthorized();
      reject(new ApiError(data?.message ?? 'Request failed', request.status));
    };
    request.onerror = () => reject(new ApiError('Network request failed', 0));
    request.send(formData);
  });
}
