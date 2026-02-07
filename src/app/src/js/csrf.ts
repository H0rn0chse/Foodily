let csrfToken = "";

export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch("/csrf-token");
    const data = await response.json();
    csrfToken = data.csrfToken;
  } catch (err) {
    console.error("Failed to fetch CSRF token", err);
  }
  return csrfToken;
}

export function getCsrfToken(): string {
  return csrfToken;
}

export function csrfHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "x-csrf-token": csrfToken,
    ...extra
  };
}
