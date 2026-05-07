const API_URL = "http://localhost:5000";

export async function apiFetch(path: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "API Error");
    }

    return res.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error("Server connection lost. Please ensure the backend is running.");
    }
    throw error;
  }
}
