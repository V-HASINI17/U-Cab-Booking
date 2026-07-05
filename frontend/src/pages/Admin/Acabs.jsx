import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anav from './Anav';

const Acabs = () => {
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/cars');
      if (res.data.success) {
        setCabs(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch the registered cabs fleet database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cabId) => {
    if (!window.confirm('Are you sure you want to permanently delete this cab from the registry?')) return;
    try {
      const res = await axios.delete(`/cars/${cabId}`);
      if (res.data.success) {
        alert('Cab deleted successfully.');
        fetchCabs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  return (
    <div>
      <Anav />
      <div className="container py-4">
        {/* Fleet Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Fleet Management</h2>
            <p className="text-muted mb-0">Register new taxi cars, assign drivers, or adjust maintenance logs.</p>
          </div>
          <Link to="/admin/cabs/add" className="btn btn-primary-ucab rounded-pill">
            <i className="bi bi-plus-lg me-1"></i> Add New Cab
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : cabs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm border border-warning border-opacity-10">
            <span className="fs-1">🚕</span>
            <h4 className="fw-bold mt-3">Fleet is Empty</h4>
            <p className="text-muted">No cabs registered yet. Click the button above to register your first cab.</p>
          </div>
        ) : (
          <div className="row g-4">
            {cabs.map((cab) => (
              <div key={cab._id} className="col-md-3">
                <div className="card ucab-card h-100 overflow-hidden shadow-sm">
                  {/* Image banner */}
                  <div style={{ height: '150px', overflow: 'hidden', background: '#f8f9fa', position: 'relative' }}>
                    <img
                      src={`http://localhost:8000/uploads/${cab.image}`}
                      alt={cab.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span className={`badge position-absolute top-2 end-2 px-2.5 py-1.5 rounded-pill shadow ${
                      cab.status === 'Available' ? 'bg-success' : cab.status === 'Booked' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {cab.status}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-1">{cab.name}</h6>
                    <span className="badge bg-dark text-warning small mb-2">{cab.type}</span>
                    
                    <div className="small text-muted mb-2">
                      <div><strong>Plate:</strong> {cab.number}</div>
                      <div><strong>City Area:</strong> {cab.city}</div>
                      <div><strong>Rate:</strong> ${cab.pricePerKm} / KM</div>
                    </div>

                    <div className="bg-light p-2 rounded small text-muted mb-3 border">
                      <strong>Driver assigned:</strong>
                      <div className="text-dark fw-semibold text-truncate">
                        {cab.assignedDriverId ? (
                          <span><i className="bi bi-person-badge-fill me-1 text-warning"></i> {cab.assignedDriverId.name}</span>
                        ) : (
                          <span className="text-muted italic">No Driver Assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/cabs/edit/${cab._id}`)}
                        className="btn btn-outline-dark btn-sm rounded-pill w-50 py-1.5"
                      >
                        <i className="bi bi-pencil-fill me-1"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cab._id)}
                        className="btn btn-danger btn-sm rounded-pill w-50 py-1.5 text-white"
                      >
                        <i className="bi bi-trash-fill"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Acabs;
