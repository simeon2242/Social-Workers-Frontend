const API_BASE_URL = window.SWF_API_BASE_URL || "http://127.0.0.1:8000/api";

export async function getResource(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function sendContactMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/contact/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || Object.values(data).flat().join(" ") || "Message invalide");
  }
  return data;
}

export { API_BASE_URL };