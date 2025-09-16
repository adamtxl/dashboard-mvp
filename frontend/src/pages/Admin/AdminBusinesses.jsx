import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/admin/businesses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBusinesses(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="custom-error-message text-center my-3">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Businesses</h2>
      <ul className="list-group">
        {businesses.map((biz) => (
          <li key={biz.id} className="list-group-item">
            {biz.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminBusinesses;
