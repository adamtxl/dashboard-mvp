import { getAuthHeaders } from './auth'; 

const API_BASE = '/api/dashboards';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getUserDashboards = async () => {
	const res = await fetch(API_BASE, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) throw new Error('Failed to fetch dashboards');
	return await res.json();
};

export const deleteDashboard = async (id) => {
	const res = await fetch(`${API_BASE}/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
	});
	if (!res.ok) throw new Error('Failed to delete dashboard');
	return await res.json();
};

export const createDashboard = async (dashboardData) => {
  const response = await fetch(`${BASE_URL}/dashboards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(dashboardData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save dashboard: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const getDashboardById = async (id) => {
	const res = await fetch(`${API_BASE}/${id}`, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) throw new Error('Failed to fetch dashboard');
	return await res.json();
};

export async function getDashboard(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboards/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return await response.json();
}
