import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Anav from './Anav';

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    if (!window.confirm(`Are you sure you want to update ride status to ${nextStatus}?`)) return;
    try {
      const res = await axios.put(`/bookings/${bookingId}/status`, { status: nextStatus });
      if (res.data.success) {
        alert(`Status updated successfully`);
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div>
      <Anav />
      <div className="container py-4">
        <h2 className="fw-bold mb-1">Ride Bookings Registry</h2>
        <p className="text-muted mb-4">Oversee active trips, audit transaction details, and cancel dispatches.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="alert alert-info text-center">No bookings registered in database.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-ucab table-hover align-middle">
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Cab Details</th>
                  <th>Driver Assigned</th>
                  <th>Route (Distance)</th>
                  <th>Fare details</th>
                  <th>Status</th>
                  <th>Override Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong className="text-dark d-block">{b.userId?.name}</strong>
                      <span className="text-muted small">{b.userId?.mobile}</span>
                    </td>
                    <td>
                      <div className="small">
                        <strong>{b.carId?.name || 'Cab'}</strong>
                        <div className="text-muted">No: {b.carId?.number}</div>
                      </div>
                    </td>
                    <td>
                      {b.driverId ? (
                        <div className="small">
                          <strong>{b.driverId.name}</strong>
                          <div className="text-muted">{b.driverId.mobile}</div>
                        </div>
                      ) : (
                        <span className="text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="small">
                        <div className="text-truncate" style={{ maxWidth: '180px' }}><strong>From:</strong> {b.pickup}</div>
                        <div className="text-truncate" style={{ maxWidth: '180px' }}><strong>To:</strong> {b.drop}</div>
                        <div className="text-muted">{b.distance} KM on {b.date} ({b.time})</div>
                      </div>
                    </td>
                    <td>
                      <strong className="text-dark fs-6">${b.fare}</strong>
                      <span className={`badge d-block mt-1 ${b.paymentStatus === 'Paid' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status !== 'Cancelled' && b.status !== 'Completed' ? (
                        <div className="dropdown">
                          <button
                            className="btn btn-outline-dark btn-sm dropdown-toggle rounded-pill px-3"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Set Status
                          </button>
                          <ul className="dropdown-menu">
                            {b.status === 'Pending' && (
                              <li>
                                <button className="dropdown-item" onClick={() => handleStatusUpdate(b._id, 'Confirmed')}>
                                  Confirm Dispatch
                                </button>
                              </li>
                            )}
                            {b.status === 'Confirmed' && (
                              <li>
                                <button className="dropdown-item" onClick={() => handleStatusUpdate(b._id, 'Arriving')}>
                                  Driver Arrived
                                </button>
                              </li>
                            )}
                            {b.status === 'Arriving' && (
                              <li>
                                <button className="dropdown-item" onClick={() => handleStatusUpdate(b._id, 'In Progress')}>
                                  Start Ride
                                </button>
                              </li>
                            )}
                            {b.status === 'In Progress' && (
                              <li>
                                <button className="dropdown-item" onClick={() => handleStatusUpdate(b._id, 'Completed')}>
                                  End / Complete Ride
                                </button>
                              </li>
                            )}
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleStatusUpdate(b._id, 'Cancelled')}>
                                Cancel Ride
                              </button>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <span className="text-muted small">Ride Finished</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
