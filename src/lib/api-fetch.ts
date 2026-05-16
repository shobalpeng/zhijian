import { toast } from "sonner";

/**
 * Wrapper around fetch that handles auth errors and provides consistent error handling.
 * Returns parsed JSON on success, or null on handled error.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit & { errorMessage?: string }
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const { errorMessage, ...fetchOptions } = options ?? {};
  try {
    const res = await fetch(url, fetchOptions);
    if (res.status === 401) {
      // Auth errors are typically handled by redirect, but provide a fallback
      return { ok: false, error: "登录已过期，请重新登录" };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? errorMessage ?? "请求失败";
      return { ok: false, error: msg };
    }
    const data = await res.json();
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: errorMessage ?? "网络错误，请检查连接" };
  }
}

/**
 * Convenience: fetch and toast on error, return data or null.
 */
export async function fetchWithToast<T = unknown>(
  url: string,
  options?: RequestInit & { errorMessage?: string }
): Promise<T | null> {
  const result = await apiFetch<T>(url, options);
  if (!result.ok) {
    toast.error(result.error);
    return null;
  }
  return result.data;
}
