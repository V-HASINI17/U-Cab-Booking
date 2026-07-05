import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Anav from './Anav';

const Ahome = () => {
  const [stats, setStats] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch stats
      const statsRes = await axios.get('/admin/dashboard-stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data.stats);
        setStatusCounts(statsRes.data.data.bookingsByStatus);
      }

      // Fetch pending drivers
      const usersRes = await axios.get('/users');
      if (usersRes.data.success) {
        const drivers = usersRes.data.data.filter(
          (u) => u.role === 'driver' && u.driverDetails?.status === 'Pending'
        );
        setPendingDrivers(drivers);
      }
    } catch (err) {
      setError('Failed to aggregate dashboard telemetry metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDriver = async (driverId, newStatus) => {
    if (!window.confirm(`Are you sure you want to set status to ${newStatus}?`)) return;
    try {
      const res = await axios.put(`/admin/drivers/${driverId}/verify`, { status: newStatus });
      if (res.data.success) {
        alert(`Driver status updated to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Driver verification update failed');
    }
  };

  // Find max value in statusCounts to scale the custom bar chart heights
  const getMaxCount = () => {
    if (!statusCounts) return 1;
    const values = Object.values(statusCounts);
    return Math.max(...values, 1);
  };

  return (
    <div>
      <Anav />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0">Admin Dashboard</h2>
            <p className="text-muted mb-0">Aggregate system statistics, verify drivers, and oversee dispatches.</p>
          </div>
          <button onClick={fetchDashboardData} className="btn btn-outline-dark rounded-pill py-2">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card ucab-card p-3 border-0 bg-white text-center shadow-sm">
                  <div className="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-people-fill fs-4 text-warning"></i>
                  </div>
                  <h6 className="text-muted small fw-semibold">Total Passengers</h6>
                  <h3 className="fw-bold mb-0">{stats?.users}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card ucab-card p-3 border-0 bg-white text-center shadow-sm">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-person-badge-fill fs-4 text-success"></i>
                  </div>
                  <h6 className="text-muted small fw-semibold">Driver Partners</h6>
                  <h3 className="fw-bold mb-0">{stats?.drivers}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card ucab-card p-3 border-0 bg-white text-center shadow-sm">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-car-front-fill fs-4 text-info"></i>
                  </div>
                  <h6 className="text-muted small fw-semibold">Registered Cabs</h6>
                  <h3 className="fw-bold mb-0">{stats?.cars}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card ucab-card p-3 border-0 bg-white text-center shadow-sm">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-wallet2 fs-4 text-danger"></i>
                  </div>
                  <h6 className="text-muted small fw-semibold">Completed Revenue</h6>
                  <h3 className="fw-bold mb-0">${stats?.revenue}</h3>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-5">
              {/* Custom styled HTML/CSS Bar Chart Column */}
              <div className="col-lg-7">
                <div className="card ucab-card p-4 h-100 shadow-sm">
                  <h5 className="fw-bold mb-4">Rides Analytics by Status</h5>
                  {statusCounts ? (
                    <div className="d-flex align-items-end justify-content-around bg-light p-3 rounded" style={{ height: '300px' }}>
                      {Object.entries(statusCounts).map(([status, count]) => {
                        const pct = Math.max(5, (count / getMaxCount()) * 80);
                        return (
                          <div key={status} className="d-flex flex-column align-items-center" style={{ width: '60px' }}>
                            {/* Bar segment */}
                            <div className="text-dark small fw-bold mb-2">{count}</div>
                            <div
                              className="w-100 rounded-top"
                              style={{
                                height: `${pct}px`,
                                backgroundColor: status === 'Completed' ? '#2E7D32' : status === 'Cancelled' ? '#C62828' : 'var(--primary-color)',
                                transition: 'height 0.6s ease'
                              }}
                            ></div>
                            <span className="text-muted small mt-2 text-center text-truncate w-100" style={{ fontSize: '0.7rem' }}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="alert alert-secondary text-center">No analytic details to show.</div>
                  )}
                </div>
              </div>

              {/* Driver Verification Column */}
              <div className="col-lg-5">
                <div className="card ucab-card p-4 h-100 shadow-sm">
                  <h5 className="fw-bold mb-3 text-warning"><i className="bi bi-shield-check"></i> Pending Verification ({pendingDrivers.length})</h5>
                  
                  {pendingDrivers.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded">
                      <i className="bi bi-person-check fs-2 text-muted mb-2 d-block"></i>
                      <p className="text-muted small mb-0">All drivers are approved and verified.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {pendingDrivers.map((driver) => (
                        <div key={driver._id} className="p-3 mb-2 rounded bg-light border border-warning border-opacity-10">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="text-dark d-block">{driver.name}</strong>
                              <span className="text-muted small d-block"><i className="bi bi-envelope"></i> {driver.email}</span>
                              <span className="text-muted small d-block"><i className="bi bi-telephone"></i> {driver.mobile}</span>
                            </div>
                            <span className="badge bg-warning text-dark">Pending</span>
                          </div>
                          
                          <div className="mt-2 p-2 bg-white rounded border small text-muted">
                            <div><strong>License:</strong> {driver.driverDetails?.licenseNumber}</div>
                            <div><strong>Vehicle:</strong> {driver.driverDetails?.vehicleModel} ({driver.driverDetails?.vehicleNumber})</div>
                            <div><strong>Class:</strong> {driver.driverDetails?.vehicleType}</div>
                          </div>

                          <div className="d-flex gap-2 mt-3">
                            <button
                              onClick={() => handleVerifyDriver(driver._id, 'Verified')}
                              className="btn btn-success btn-sm rounded-pill w-50 py-1.5 fw-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyDriver(driver._id, 'Rejected')}
                              className="btn btn-danger btn-sm rounded-pill w-50 py-1.5"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ahome;
