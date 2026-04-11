const base = "/api";

function authHeaders() {
  const token = localStorage.getItem("nyaya_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiJson(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export async function apiUpload(path, formData) {
  const token = localStorage.getItem("nyaya_token");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
