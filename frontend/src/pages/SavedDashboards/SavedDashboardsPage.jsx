import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDashboards, deleteDashboard, updateDashboard } from '../../services/api/dashboards';
import { useAuth } from '../../AuthContext';

function SavedDashboardsPage() {
	const [dashboards, setDashboards] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [editingId, setEditingId] = useState(null);
	const [newName, setNewName] = useState('');

	useEffect(() => {
		if (!isAuthenticated) {
			alert('You must be logged in to view your dashboards.');
			navigate('/login');
			return;
		}

		const loadDashboards = async () => {
			try {
				const data = await getUserDashboards();
				setDashboards(data);
			} catch (err) {
				console.error('Failed to fetch dashboards:', err);
			} finally {
				setLoading(false);
			}
		};

		loadDashboards();
	}, [isAuthenticated]);

	const handleDelete = async (id) => {
		const confirmDelete = window.confirm('Are you sure you want to delete this dashboard?');
		if (!confirmDelete) return;

		try {
			await deleteDashboard(id);
			setDashboards((prev) => prev.filter((d) => d.id !== id));
		} catch (err) {
			console.error('Failed to delete dashboard:', err);
			alert('Failed to delete dashboard. Try again.');
		}
	};

	const handleSave = async (id) => {
		try {
			await updateDashboard(id, { name: newName });
			const updated = dashboards.map((d) => (d.id === id ? { ...d, name: newName } : d));
			setDashboards(updated);
			setEditingId(null);
		} catch (err) {
			console.error('Failed to update dashboard:', err);
		}
	};

	return (
		<div className='container py-4 themed-gradient'>
			<h2 className='mb-4 themed-title'>📊 Your Saved Dashboards</h2>

			{loading ? (
				<div className='alert alert-info'>⏳ Loading dashboards...</div>
			) : dashboards.length === 0 ? (
				<div className='alert alert-warning'>⚠️ No dashboards found. Go build one!</div>
			) : (
				<div className='row gy-3'>
					{dashboards.map((dashboard) => (
						<div key={dashboard.id} className='mb-3 border p-3 rounded'>
							{editingId === dashboard.id ? (
								<div>
									<input
										type='text'
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										className='form-control mb-2'
									/>
									<button className='btn btn-success btn-sm me-2' onClick={() => handleSave(dashboard.id)}>
										Save
									</button>
									<button className='btn btn-secondary btn-sm' onClick={() => setEditingId(null)}>
										Cancel
									</button>
								</div>
							) : (
								<>
									<strong>{dashboard.name}</strong>
									<div className='mt-2'>
										<button className='btn btn-view btn-sm' onClick={() => navigate(`/dashboard/${dashboard.id}`)}>
											🔍 View
										</button>
										<button
											className='btn btn-secondary btn-sm me-2'
											onClick={() => {
												setEditingId(dashboard.id);
												setNewName(dashboard.name);
											}}
										>
											✏️ Rename
										</button>
										<button className='btn btn-danger btn-sm' onClick={() => handleDelete(dashboard.id)}>
											🗑 Delete
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default SavedDashboardsPage;
