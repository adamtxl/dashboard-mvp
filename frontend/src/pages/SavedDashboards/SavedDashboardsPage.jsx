// pages/SavedDashboardsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDashboards, deleteDashboard } from '../services/api/dashboards';

function SavedDashboardsPage() {
	const [dashboards, setDashboards] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDashboards = async () => {
			try {
				const result = await getUserDashboards();
				setDashboards(result);
			} catch (err) {
				console.error('Failed to fetch dashboards:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchDashboards();
	}, []);

	const handleLoad = (id) => {
		navigate(`/dashboard/load/${id}`);
	};

	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this dashboard?')) {
			await deleteDashboard(id);
			setDashboards((prev) => prev.filter((d) => d.id !== id));
		}
	};

	if (loading) return <div className='container mt-4'>⏳ Loading your dashboards...</div>;

	return (
		<div className='container mt-4'>
			<h2>💾 Your Saved Dashboards</h2>
			{dashboards.length === 0 ? (
				<p>You haven't saved any dashboards yet.</p>
			) : (
				<ul className='list-group'>
					{dashboards.map((dash) => (
						<li key={dash.id} className='list-group-item d-flex justify-content-between align-items-center'>
							<div>
								<strong>{dash.name}</strong> <small className='text-muted'>(Saved {new Date(dash.created_at).toLocaleString()})</small>
							</div>
							<div>
								<button className='btn btn-primary me-2' onClick={() => handleLoad(dash.id)}>Load</button>
								<button className='btn btn-danger' onClick={() => handleDelete(dash.id)}>Delete</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default SavedDashboardsPage;
