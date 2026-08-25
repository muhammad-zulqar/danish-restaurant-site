const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getMenu() {
  return request('/menu');
}

export function createReservation(data) {
  return request('/reservations', { method: 'POST', body: JSON.stringify(data) });
}

export function createOrder(data) {
  return request('/orders', { method: 'POST', body: JSON.stringify(data) });
}

export function adminLogin(credentials) {
  return request('/admin/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export function getAdminStats(token) {
  return request('/admin/stats', { headers: { Authorization: 'Bearer ' + token } });
}

export function getAdminMenu(token) {
  return request('/admin/menu', { headers: { Authorization: 'Bearer ' + token } });
}

export function createAdminMenuItem(token, payload) {
  return request('/admin/menu', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload),
  });
}

export function updateAdminMenuItem(token, id, payload) {
  return request(`/admin/menu/${id}`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload),
  });
}

export function deleteAdminMenuItem(token, id) {
  return request(`/admin/menu/${id}`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
}

export function getAdminReservations(token) {
  return request('/admin/reservations', { headers: { Authorization: 'Bearer ' + token } });
}

export function updateReservationStatus(token, id, status) {
  return request(`/admin/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify({ status }),
  });
}

export function getAdminOrders(token) {
  return request('/admin/orders', { headers: { Authorization: 'Bearer ' + token } });
}

export function updateOrderStatus(token, id, status) {
  return request(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify({ status }),
  });
}
