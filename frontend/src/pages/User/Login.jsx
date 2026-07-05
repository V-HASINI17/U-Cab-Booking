import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect them
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

    try {
      const loggedUser = await login(email, password, false);
      if (loggedUser.role === 'driver') {
        navigate('/my-bookings');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card ucab-card p-4 shadow-sm w-100" style={{ maxWidth: '450px' }}>
          <div className="text-center mb-4">
            <span className="fs-1">🔑</span>
            <h3 className="fw-bold mt-2">Sign In</h3>
            <p className="text-muted">Welcome back! Access your UCAB account</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary-ucab w-100 py-3 mb-3 fw-bold rounded-pill text-dark"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-muted mb-1">
              New to UCAB? <Link to="/register" className="text-dark fw-bold text-decoration-none">Register here</Link>
            </p>
            <p className="text-muted mb-0 small">
              Are you an Admin? <Link to="/admin/login" className="text-warning fw-bold text-decoration-none">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
