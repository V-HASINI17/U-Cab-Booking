import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Basic fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'driver'

  // Driver-only fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [experienceYears, setExperienceYears] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set initial role from query parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'driver') {
      setRole('driver');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'driver') {
        navigate('/my-bookings');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      mobile
    };

    if (role === 'driver') {
      payload.driverDetails = {
        licenseNumber,
        vehicleModel,
        vehicleNumber,
        vehicleType,
        experienceYears: Number(experienceYears)
      };
    }

    try {
      await register(payload, role === 'driver');
      if (role === 'driver') {
        navigate('/my-bookings');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card ucab-card p-4 shadow-sm w-100" style={{ maxWidth: role === 'driver' ? '600px' : '450px' }}>
          <div className="text-center mb-4">
            <span className="fs-1">🚕</span>
            <h3 className="fw-bold mt-2">Create Account</h3>
            <p className="text-muted">Join UCAB and ride your way</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {/* Role Toggle Selector */}
          <div className="btn-group w-100 mb-4 bg-light p-1 rounded-pill" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-pill py-2 fw-semibold ${role === 'user' ? 'btn-primary-ucab' : 'btn-light text-dark'}`}
              onClick={() => setRole('user')}
            >
              Passenger
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill py-2 fw-semibold ${role === 'driver' ? 'btn-primary-ucab' : 'btn-light text-dark'}`}
              onClick={() => setRole('driver')}
            >
              Driver Partner
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Common Fields */}
              <div className={role === 'driver' ? 'col-md-6' : 'col-12'}>
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={role === 'driver' ? 'col-md-6' : 'col-12'}>
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={role === 'driver' ? 'col-md-6' : 'col-12'}>
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className={role === 'driver' ? 'col-md-6' : 'col-12'}>
                <label className="form-label fw-semibold">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              {/* Driver-Specific Fields */}
              {role === 'driver' && (
                <>
                  <div className="col-12">
                    <hr className="my-2 border-warning opacity-25" />
                    <h5 className="fw-bold text-warning mb-3">Driver Profile Details</h5>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">License Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DL-XXXXXXXX"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Vehicle Model Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Toyota Camry / Honda Civic"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Vehicle Plate Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="TX-XXXXXX"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Vehicle Type</label>
                    <select
                      className="form-select"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      required
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV (6 Seats)</option>
                      <option value="Hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Driving Experience (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary-ucab w-100 py-3 mt-4 mb-3 fw-bold rounded-pill text-dark"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="text-center mt-2">
            <p className="text-muted mb-0 small">
              Already have an account? <Link to="/login" className="text-dark fw-bold text-decoration-none">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
