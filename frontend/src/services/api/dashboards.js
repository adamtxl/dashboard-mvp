import axios from '../axiosInstance';

export const getUserDashboards = async () => {
	const response = await axios.get('/dashboards');
	return response.data;
};

export const deleteDashboard = async (id) => {
	await axios.delete(`/dashboards/${id}`);
};

export const createDashboard = async (dashboardPayload) => {
	const response = await axios.post('/dashboards', dashboardPayload);
	return response.data;
};

export const getDashboardById = async (id) => {
	const response = await axios.get(`/dashboards/${id}`);
	return response.data;
};
