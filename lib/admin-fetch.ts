"use client";

import { auth } from "@/lib/firebase";

/**
 * Fetch wrapper that automatically includes the Firebase Auth ID token.
 * Use this in admin pages instead of bare `fetch()` for authenticated API calls.
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}
