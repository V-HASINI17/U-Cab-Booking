import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const BookCab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // States
  const [cabs, setCabs] = useState([]);
  const [selectedCab, setSelectedCab] = useState(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [distance, setDistance] = useState('');

  // Fare estimation states
  const [fareBreakdown, setFareBreakdown] = useState(null);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch available cabs if none passed from state
  useEffect(() => {
    if (location.state && location.state.cab) {
      setSelectedCab(location.state.cab);
    } else {
      axios.get('/cars?status=Available')
        .then(res => {
          if (res.data.success) {
            setCabs(res.data.data);
            if (res.data.data.length > 0) {
              setSelectedCab(res.data.data[0]);
            }
          }
        })
        .catch(err => {
          setError('Failed to fetch available cabs');
        });
    }
  }, [location.state]);

  // Recalculate estimated fare whenever distance or selectedCab changes
  useEffect(() => {
    if (distance && selectedCab) {
      const distNum = Number(distance);
      if (distNum > 0) {
        const baseFare = distNum * selectedCab.pricePerKm;
        const tax = baseFare * 0.08;
        const serviceFee = 15;
        const totalFare = Math.round(baseFare + tax + serviceFee);

        setFareBreakdown({
          base: Math.round(baseFare),
          tax: Math.round(tax),
          serviceFee,
          total: totalFare
        });
      } else {
        setFareBreakdown(null);
      }
    } else {
      setFareBreakdown(null);
    }
  }, [distance, selectedCab]);

  const handleCabChange = (e) => {
    const cabId = e.target.value;
    const cab = cabs.find(c => c._id === cabId);
    setSelectedCab(cab);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCab) {
      setError('Please select a cab first.');
      return;
    }

    if (Number(distance) <= 0) {
      setError('Please enter a valid trip distance greater than 0.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        carId: selectedCab._id,
        pickup,
        drop,
        date,
        time,
        distance: Number(distance)
      };

      const res = await axios.post('/bookings', payload);
      if (res.data.success) {
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking checkout failed. Try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card ucab-card shadow-sm p-4">
              <div className="text-center mb-4">
                <span className="fs-1">🚕</span>
                <h3 className="fw-bold mt-2">Book Your Cab</h3>
                <p className="text-muted">Fill out the details below to dispatch your ride.</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row g-4">
                {/* Form Side */}
                <div className="col-md-6 border-end border-light pr-md-4">
                  <form onSubmit={handleBook}>
                    {/* Cab Selection if not pre-passed */}
                    {!location.state?.cab ? (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Select Available Cab</label>
                        <select className="form-select" onChange={handleCabChange} required>
                          {cabs.map(c => (
                            <option key={c._id} value={c._id}>{c.name} (${c.pricePerKm}/km)</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Selected Cab</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={`${selectedCab?.name} (${selectedCab?.type})`}
                          readOnly
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Pickup Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Times Square, NY"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Drop Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. JFK Airport, NY"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Estimated Distance (KM)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 15"
                        min="1"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary-ucab w-100 py-3 rounded-pill fw-bold text-dark"
                      disabled={submitLoading || !selectedCab}
                    >
                      {submitLoading ? 'Dispatching Cab...' : 'Confirm Cab Booking 🚕'}
                    </button>
                  </form>
                </div>

                {/* Estimate details Side */}
                <div className="col-md-6 ps-md-4">
                  <div className="bg-light p-4 rounded-3 h-100 d-flex flex-column justify-content-between border border-warning border-opacity-10">
                    <div>
                      <h5 className="fw-bold mb-3 text-warning">Trip & Fare Summary</h5>

                      {selectedCab && (
                        <div className="card border-0 mb-4 bg-white shadow-sm p-3 rounded">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-car-front-fill fs-2 text-warning me-3"></i>
                            <div>
                              <h6 className="fw-bold mb-0">{selectedCab.name}</h6>
                              <span className="badge bg-dark text-warning small">{selectedCab.type}</span>
                              <span className="text-muted small ms-2"><i className="bi bi-people-fill"></i> {selectedCab.seats} Seats</span>
                            </div>
                          </div>
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between small text-muted">
                            <span>Plate Number:</span>
                            <span className="fw-semibold text-dark">{selectedCab.number}</span>
                          </div>
                          <div className="d-flex justify-content-between small text-muted mt-1">
                            <span>Base Rate:</span>
                            <span className="fw-semibold text-dark">${selectedCab.pricePerKm} / KM</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      {fareBreakdown ? (
                        <div className="bg-white p-3 rounded shadow-sm border border-light">
                          <h6 className="fw-bold mb-3 text-dark">Fare Estimation Breakdown</h6>
                          <div className="d-flex justify-content-between text-muted small mb-2">
                            <span>Base Travel Fare ({distance} KM):</span>
                            <span>${fareBreakdown.base}</span>
                          </div>
                          <div className="d-flex justify-content-between text-muted small mb-2">
                            <span>Taxes (8% GST):</span>
                            <span>${fareBreakdown.tax}</span>
                          </div>
                          <div className="d-flex justify-content-between text-muted small mb-3">
                            <span>Booking Service Fee:</span>
                            <span>${fareBreakdown.serviceFee}</span>
                          </div>
                          <hr className="my-2 border-dashed" />
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark">Total Fare Estimate:</span>
                            <span className="fs-4 fw-extrabold text-warning">${fareBreakdown.total}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-white rounded shadow-sm">
                          <i className="bi bi-calculator fs-2 text-muted mb-2 d-block"></i>
                          <p className="text-muted small mb-0 px-3">Enter trip details and distance to calculate the dynamic fare estimate.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCab;
