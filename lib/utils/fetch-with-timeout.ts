// src/lib/utils/fetch-with-timeout.ts
// Utility for making fetch requests with timeout support
// Prevents API calls from hanging indefinitely

export class TimeoutError extends Error {
  constructor(message: string, public timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Fetch with timeout - wraps native fetch with AbortController timeout
 * @param url - The URL to fetch
 * @param options - Fetch options (method, headers, body, etc.)
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms / 10 seconds)
 * @returns Promise<Response>
 * @throws TimeoutError if the request times out
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(
        `Request to ${new URL(url).hostname} timed out after ${timeoutMs}ms`,
        timeoutMs
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch JSON with timeout - fetches and parses JSON with timeout
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise<T> - Parsed JSON response
 */
export async function fetchJsonWithTimeout<T = unknown>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<T> {
  const response = await fetchWithTimeout(url, options, timeoutMs);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operationName - Name of the operation for error messages
 * @returns Promise<T>
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'Operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`, timeoutMs)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Safe fetch that returns null on error instead of throwing
 * Useful for optional/non-critical API calls
 */
export async function safeFetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<T | null> {
  try {
    return await fetchJsonWithTimeout<T>(url, options, timeoutMs);
  } catch (error) {
    console.warn(`safeFetchJson failed for ${new URL(url).hostname}:`, error instanceof Error ? error.message : error);
    return null;
  }
}
