import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const Uhome = () => {
  const { user } = useContext(AuthContext);
  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Nearby Search filter states
  const [searchCity, setSearchCity] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async (cityVal = '', typeVal = '') => {
    setLoading(true);
    setError('');
    try {
      let url = '/cars?status=Available';
      if (cityVal) url += `&city=${cityVal}`;
      if (typeVal) url += `&type=${typeVal}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setCabs(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve available cabs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCabs(searchCity, selectedType);
  };

  const handleClear = () => {
    setSearchCity('');
    setSelectedType('');
    fetchCabs('', '');
  };

  const handleBook = (cab) => {
    navigate('/book-cab', { state: { cab } });
  };

  return (
    <div>
      <Unav />
      <div className="container py-4">
        {/* Dashboard Title & Welcome */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0">Available Cabs</h2>
            <p className="text-muted mb-0">Find and book nearby rides in your city instantly.</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-pill shadow-sm border border-warning border-opacity-25">
            <span className="fw-semibold small"><i className="bi bi-geo-alt text-warning me-1"></i> Current Location: New York</span>
          </div>
        </div>

        {/* Search / Filter Box */}
        <div className="card ucab-card p-3 mb-4 shadow-sm">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label fw-semibold small text-muted">Search by City / Location</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="e.g. New York, Los Angeles, Chicago..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-muted">Cab Class</label>
              <select
                className="form-select py-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Car Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV (6-Seater)</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary-ucab w-100 py-2">
                Search Nearby
              </button>
              {(searchCity || selectedType) && (
                <button type="button" onClick={handleClear} className="btn btn-outline-secondary btn-sm px-3">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Cabs List Grid */}
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Searching nearby...</span>
            </div>
            <p className="mt-2 text-muted fw-semibold">Scanning for nearby drivers...</p>
          </div>
        ) : cabs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm border border-warning border-opacity-10">
            <span className="fs-1">🚕</span>
            <h4 className="fw-bold mt-3">No Available Cabs Found</h4>
            <p className="text-muted px-3">We couldn't locate any free cabs matching your filters in this area. Try clearing search or entering a different city.</p>
            <button onClick={handleClear} className="btn btn-primary-ucab mt-2">View All Available Cabs</button>
          </div>
        ) : (
          <div className="row g-4">
            {cabs.map((cab) => (
              <div key={cab._id} className="col-md-4">
                <div className="card ucab-card h-100 overflow-hidden shadow-sm">
                  {/* Car Image Banner */}
                  <div style={{ height: '180px', overflow: 'hidden', background: '#f8f9fa', position: 'relative' }}>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/${cab.image}`}
                      alt={cab.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span className="badge bg-dark position-absolute top-2 end-2 text-warning fw-bold px-3 py-2 rounded-pill shadow-sm">
                      {cab.type}
                    </span>
                  </div>

                  {/* Cab Details */}
                  <div className="card-body p-4">
                    <h5 className="card-title fw-bold mb-1">{cab.name}</h5>
                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt-fill text-warning me-1"></i> Located in: <strong>{cab.city}</strong></p>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="bg-light p-2 rounded text-center">
                          <span className="text-muted d-block small">Plate Number</span>
                          <span className="fw-bold small text-dark">{cab.number}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-light p-2 rounded text-center">
                          <span className="text-muted d-block small">Capacity</span>
                          <span className="fw-bold small text-dark"><i className="bi bi-people-fill me-1"></i>{cab.seats} Seats</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span className="text-muted small d-block">Rate / KM</span>
                        <span className="fs-5 fw-bold text-dark">${cab.pricePerKm}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-muted small d-block">Driver Assigned</span>
                        <span className="fw-semibold text-warning">
                          {cab.assignedDriverId ? (
                            <span><i className="bi bi-person-badge-fill me-1"></i>{cab.assignedDriverId.name}</span>
                          ) : (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(cab)}
                      className="btn btn-primary-ucab w-100 py-2.5 rounded-pill shadow-sm fw-bold mt-2"
                    >
                      Book Now 🚕
                    </button>
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

export default Uhome;
