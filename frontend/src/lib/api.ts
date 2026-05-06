const API_URL = "http://localhost:3000";

export async function apiFetch(path: string, options: any = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // Required for cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "API Error");
  }

  return res.json();
}
