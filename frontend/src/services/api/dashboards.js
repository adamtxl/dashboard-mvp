import { getAuthHeaders } from './auth'; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getUserDashboards = async () => {
    
	const res = await fetch(`${BASE_URL}/dashboards/`, {
		headers: getAuthHeaders(),
	});

	const text = await res.text(); // read raw response
	console.log('🔍 Raw dashboard response:', text);

	if (!res.ok) throw new Error(`Failed to fetch dashboards: ${res.status}`);
	
	try {
		return JSON.parse(text);
	} catch (e) {
		throw new Error("❌ Failed to parse JSON: " + e.message);
	}
};


export const deleteDashboard = async (id) => {
	const res = await fetch(`${BASE_URL}/dashboards/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
	});
	if (!res.ok) throw new Error('Failed to delete dashboard');
	return await res.json();
};


export const createDashboard = async (dashboardData) => {
  const response = await fetch(`${BASE_URL}/dashboards/`, {
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
	const res = await fetch(`${BASE_URL}/dashboards/${id}`, {
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

export const updateDashboard = async (id, updatedData) => {
	const res = await fetch(`${BASE_URL}/dashboards/${id}`, {
		method: 'PUT',
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
		body: JSON.stringify(updatedData),
	});
	if (!res.ok) throw new Error('Failed to update dashboard');
	return await res.json();
};
