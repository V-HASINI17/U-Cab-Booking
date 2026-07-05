import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Unav from '../User/Unav';

const Aregister = () => {
  const { registerAdmin, user } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  
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
      await registerAdmin({ name, email, password, mobile });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card border-0 bg-dark text-white p-4 shadow-lg w-100" style={{ maxWidth: '450px', borderRadius: '16px', borderTop: '4px solid var(--primary-color) !important' }}>
          <div className="text-center mb-4">
            <span className="fs-1">🛡️</span>
            <h3 className="fw-bold mt-2 text-warning">Register Admin</h3>
            <p className="text-muted">Create administrative credentials</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-warning">Full Name</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label fw-semibold text-warning">Mobile Number</label>
              <input
                type="tel"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
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
              {loading ? 'Creating Admin...' : 'Register as Admin'}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-muted mb-0 small">
              Already registered? <Link to="/admin/login" className="text-warning fw-bold text-decoration-none">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Aregister;
