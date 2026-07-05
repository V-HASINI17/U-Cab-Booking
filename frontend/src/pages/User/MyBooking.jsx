import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const MyBooking = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ref to hold simulation interval for memory cleanup
  const trackingIntervalRef = useRef(null);

  // Payment checkout states
  const [payingBooking, setPayingBooking] = useState(null);
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Tracking states (simulated)
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [trackingSpeed, setTrackingSpeed] = useState(45); // km/h
  const [trackingEta, setTrackingEta] = useState(10); // mins
  const [trackingProgress, setTrackingProgress] = useState(0); // 0 to 100 %
  const [trackingStatusText, setTrackingStatusText] = useState('Driver is arriving');

  // Receipt states
  const [receiptBooking, setReceiptBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Driver status change triggers
  const handleStatusChange = async (bookingId, currentStatus) => {
    let nextStatus = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Confirmed';
    else if (currentStatus === 'Confirmed') nextStatus = 'Arriving';
    else if (currentStatus === 'Arriving') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';

    try {
      const res = await axios.put(`/bookings/${bookingId}/status`, { status: nextStatus });
      if (res.data.success) {
        // Refresh list
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await axios.put(`/bookings/${bookingId}/status`, { status: 'Cancelled' });
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Payment checkout submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const res = await axios.post(`/bookings/${payingBooking._id}/pay`, {
        paymentMethod: 'Card',
        cardDetails: { cardNumber: cardNo, expiry: cardExpiry, cvv: cardCvv }
      });
      if (res.data.success) {
        setPayingBooking(null);
        setCardNo('');
        setCardExpiry('');
        setCardCvv('');
        fetchBookings();
        alert('Payment processed successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment checkout failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Stop simulated tracking and cleanup interval
  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setTrackingBooking(null);
    setTrackingProgress(0);
  };

  // Start simulated tracking
  const startTracking = (booking) => {
    // Clear any active tracking simulation before launching a new one
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    setTrackingBooking(booking);
    setTrackingProgress(0);
    setTrackingSpeed(50);
    setTrackingEta(booking.distance * 1.5);
    setTrackingStatusText('Driver Assigned');

    // Simulate tracking updates over time
    trackingIntervalRef.current = setInterval(() => {
      setTrackingProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
          }
          setTrackingStatusText('Ride Completed');
          setTrackingEta(0);
          setTrackingSpeed(0);
          return 100;
        }

        // Change ETAs and statuses based on progress
        if (next < 30) {
          setTrackingStatusText('Driver is arriving at pickup');
          setTrackingEta(Math.round(booking.distance * 1.2 * (1 - next / 100)));
        } else if (next >= 30 && next < 85) {
          setTrackingStatusText('Trip in progress');
          setTrackingSpeed(55 + Math.round(Math.random() * 10 - 5));
          setTrackingEta(Math.round(booking.distance * (1 - next / 100)));
        } else {
          setTrackingStatusText('Approaching destination');
          setTrackingSpeed(30);
          setTrackingEta(1);
        }

        return next;
      });
    }, 2000);
  };

  return (
    <div>
      <Unav />
      <div className="container py-4">
        <h2 className="fw-bold mb-1">
          {user?.role === 'driver' ? 'Driver Rides Dashboard' : 'My Bookings'}
        </h2>
        <p className="text-muted mb-4">
          {user?.role === 'driver'
            ? 'Manage assigned bookings, client pickups, and update trip progression.'
            : 'Track active cab dispatches, check trip fare receipts, or make payments.'}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading bookings...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 shadow-sm border border-warning border-opacity-10">
            <span className="fs-1">📅</span>
            <h4 className="fw-bold mt-3">No Bookings Found</h4>
            <p className="text-muted">You do not have any bookings listed in the system.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-ucab table-hover align-middle">
              <thead>
                <tr>
                  <th>Cab Details</th>
                  <th>{user?.role === 'driver' ? 'Passenger Details' : 'Driver Partner'}</th>
                  <th>Route Details</th>
                  <th>Schedule</th>
                  <th>Total Fare</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-car-front-fill text-warning fs-3 me-2"></i>
                        <div>
                          <strong className="text-dark d-block">{b.carId?.name || 'Cab Name'}</strong>
                          <span className="badge bg-dark text-warning small">{b.carId?.number || 'Plate Number'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user?.role === 'driver' ? (
                        <div>
                          <strong className="text-dark d-block">{b.userId?.name}</strong>
                          <span className="text-muted small"><i className="bi bi-telephone-fill"></i> {b.userId?.mobile}</span>
                        </div>
                      ) : b.driverId ? (
                        <div>
                          <strong className="text-dark d-block">{b.driverId.name}</strong>
                          <span className="text-muted small"><i className="bi bi-telephone-fill"></i> {b.driverId.mobile}</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">Waiting for Driver</span>
                      )}
                    </td>
                    <td>
                      <div className="small text-dark">
                        <span className="d-block text-truncate" style={{ maxWidth: '180px' }}>
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          <strong>From:</strong> {b.pickup}
                        </span>
                        <span className="d-block text-truncate" style={{ maxWidth: '180px' }}>
                          <i className="bi bi-geo-alt-fill text-success me-1"></i>
                          <strong>To:</strong> {b.drop}
                        </span>
                        <span className="text-muted small d-block">Distance: {b.distance} KM</span>
                      </div>
                    </td>
                    <td>
                      <span className="small d-block text-dark fw-semibold">{b.date}</span>
                      <span className="small text-muted">{b.time}</span>
                    </td>
                    <td>
                      <span className="fw-bold fs-6 text-dark">${b.fare}</span>
                      <span className={`badge d-block mt-1 ${b.paymentStatus === 'Paid' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Passenger Action Hooks */}
                        {user?.role === 'user' && (
                          <>
                            {b.paymentStatus === 'Unpaid' && b.status !== 'Cancelled' && (
                              <button
                                onClick={() => setPayingBooking(b)}
                                className="btn btn-warning btn-sm rounded-pill px-3 py-1 text-dark fw-bold"
                              >
                                Pay Now
                              </button>
                            )}
                            {b.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelBooking(b._id)}
                                className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1"
                              >
                                Cancel
                              </button>
                            )}
                            {['Confirmed', 'Arriving', 'In Progress'].includes(b.status) && (
                              <button
                                onClick={() => startTracking(b)}
                                className="btn btn-primary-ucab btn-sm rounded-pill px-3 py-1"
                              >
                                Track Ride
                              </button>
                            )}
                            {b.status === 'Completed' && (
                              <button
                                onClick={() => setReceiptBooking(b)}
                                className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 fw-bold"
                              >
                                Receipt
                              </button>
                            )}
                          </>
                        )}

                        {/* Driver Action Hooks */}
                        {user?.role === 'driver' && b.status !== 'Cancelled' && b.status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(b._id, b.status)}
                            className="btn btn-primary-ucab btn-sm rounded-pill px-3 py-1 fw-bold"
                          >
                            {b.status === 'Pending' && 'Accept Ride'}
                            {b.status === 'Confirmed' && 'Mark Arrived'}
                            {b.status === 'Arriving' && 'Start Ride'}
                            {b.status === 'In Progress' && 'End Ride'}
                          </button>
                        )}
                        {user?.role === 'driver' && b.status === 'Completed' && (
                          <span className="text-success fw-bold small"><i className="bi bi-check-circle-fill"></i> Trip Done</span>
                        )}
                        {b.status === 'Cancelled' && (
                          <span className="text-danger fw-bold small"><i className="bi bi-x-circle-fill"></i> Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Real-time Tracking overlay */}
        {trackingBooking && (
          <div className="card ucab-card p-4 mt-5 shadow border-warning">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-warning">
                <i className="bi bi-map-fill me-2"></i> Real-time Ride Simulation
              </h5>
              <button
                className="btn-close"
                onClick={stopTracking}
              ></button>
            </div>
            <div className="row align-items-center">
              <div className="col-md-8">
                {/* Simulated Progress Pipeline */}
                <h6 className="fw-bold text-dark mb-1">{trackingStatusText}</h6>
                <div className="progress mb-3 bg-light" style={{ height: '14px', borderRadius: '50px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                    role="progressbar"
                    style={{ width: `${trackingProgress}%` }}
                    aria-valuenow={trackingProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>

                <div className="row g-2 text-center text-md-start">
                  <div className="col-4">
                    <span className="text-muted d-block small">ETA</span>
                    <strong className="text-dark fs-5">{trackingEta} mins</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block small">Mock Speed</span>
                    <strong className="text-dark fs-5">{trackingSpeed} km/h</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted d-block small">Remaining Distance</span>
                    <strong className="text-dark fs-5">
                      {Math.max(0, (trackingBooking.distance * (1 - trackingProgress / 100)).toFixed(1))} KM
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="bg-light p-3 rounded text-center border">
                  <span className="text-muted d-block small">Assigned Driver</span>
                  <h6 className="fw-bold mb-1">{trackingBooking.driverId?.name || 'Driver Name'}</h6>
                  <span className="text-muted small"><i className="bi bi-phone"></i> {trackingBooking.driverId?.mobile}</span>
                  <div className="badge bg-warning text-dark d-block mt-2">
                    {trackingBooking.carId?.name} ({trackingBooking.carId?.number})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {payingBooking && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 ucab-card p-4">
                <div className="modal-header border-0 p-0 mb-3 justify-content-between">
                  <h5 className="modal-title fw-bold text-dark">Simulated Online Checkout</h5>
                  <button type="button" className="btn-close" onClick={() => setPayingBooking(null)}></button>
                </div>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="bg-light p-3 rounded mb-3 text-center border">
                    <span className="text-muted small d-block">Transaction Total</span>
                    <h3 className="fw-extrabold text-warning mb-0">${payingBooking.fare}</h3>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="123"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-ucab w-100 py-3 rounded-pill fw-bold"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing Checkout...' : `Pay $${payingBooking.fare} Now`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {receiptBooking && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 p-4" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-0 p-0 mb-3 justify-content-between">
                  <h5 className="modal-title fw-bold text-dark">🚕 UCAB Invoice Receipt</h5>
                  <button type="button" className="btn-close" onClick={() => setReceiptBooking(null)}></button>
                </div>
                
                {/* Print-friendly Invoice Template */}
                <div className="p-3 bg-white border rounded" id="receipt-print-area">
                  <div className="text-center mb-3">
                    <h4 className="fw-bold mb-0">UCAB TAXI</h4>
                    <p className="text-muted small mb-0">Ride Receipt Invoice</p>
                    <span className="text-muted small">ID: {receiptBooking._id}</span>
                  </div>

                  <hr className="my-2 border-dashed" />

                  <div className="mb-3 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Passenger:</span>
                      <strong>{receiptBooking.userId?.name || user?.name}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Driver Partner:</span>
                      <strong>{receiptBooking.driverId?.name || 'UCAB Partner'}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Vehicle Class:</span>
                      <strong>{receiptBooking.carId?.name} ({receiptBooking.carId?.number})</strong>
                    </div>
                  </div>

                  <hr className="my-2 border-dashed" />

                  <div className="mb-3 small">
                    <p className="mb-1"><i className="bi bi-geo-alt-fill text-danger"></i> <strong>From:</strong> {receiptBooking.pickup}</p>
                    <p className="mb-1"><i className="bi bi-geo-alt-fill text-success"></i> <strong>To:</strong> {receiptBooking.drop}</p>
                    <p className="mb-0 text-muted"><i className="bi bi-calendar"></i> {receiptBooking.date} at {receiptBooking.time}</p>
                  </div>

                  <hr className="my-2 border-dashed" />

                  <div className="small">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Travel Distance ({receiptBooking.distance} KM):</span>
                      <span>${Math.round(receiptBooking.distance * (receiptBooking.carId?.pricePerKm || 15))}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Tax (8% GST):</span>
                      <span>${Math.round(receiptBooking.distance * (receiptBooking.carId?.pricePerKm || 15) * 0.08)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Service Flat Fee:</span>
                      <span>$15</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2">
                      <span>Paid Total:</span>
                      <span>${receiptBooking.fare}</span>
                    </div>
                  </div>

                  <hr className="my-2 border-dashed" />

                  <div className="text-center mt-3 small">
                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold">
                      PAID VIA {receiptBooking.paymentDetails?.paymentMethod?.toUpperCase() || 'CARD'}
                    </span>
                    <p className="text-muted small mt-1 mb-0">Txn: {receiptBooking.paymentDetails?.transactionId || 'N/A'}</p>
                    <div className="d-inline-block mt-3 bg-light p-2 border">
                      {/* Simple Simulated QR Code representation */}
                      <div className="d-flex flex-column align-items-center" style={{ width: '80px', height: '80px', background: '#ccc', justifyContent: 'center' }}>
                        <i className="bi bi-qr-code text-dark fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline-dark w-50 py-2 rounded-pill"
                  >
                    <i className="bi bi-printer me-1"></i> Print
                  </button>
                  <button
                    onClick={() => setReceiptBooking(null)}
                    className="btn btn-primary-ucab w-50 py-2 rounded-pill text-dark"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;
