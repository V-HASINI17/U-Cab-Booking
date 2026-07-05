import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Unav from '../User/Unav'; // Load simple user navbar as landing context

const Alogin = () => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, true); // isAdmin = true
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card border-0 bg-dark text-white p-4 shadow-lg w-100" style={{ maxWidth: '420px', borderRadius: '16px', borderTop: '4px solid var(--primary-color) !important' }}>
          <div className="text-center mb-4">
            <span className="fs-1">🛡️</span>
            <h3 className="fw-bold mt-2 text-warning">Admin Portal</h3>
            <p className="text-muted">Sign in to access control panel statistics</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-warning">Admin Email</label>
              <input
                type="email"
                className="form-control bg-dark text-white border-secondary"
                placeholder="admin@ucab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-warning">Password</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 py-3 mb-3 fw-bold rounded-pill text-dark"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-muted mb-0 small">
              Need to register admin? <Link to="/admin/register" className="text-warning fw-bold text-decoration-none">Register here</Link>
            </p>
            <p className="text-muted mt-2 small mb-0">
              Not an admin? <Link to="/login" className="text-light fw-bold text-decoration-none">Back to passenger login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alogin;
