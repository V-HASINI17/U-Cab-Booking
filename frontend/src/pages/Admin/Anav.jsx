import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Anav = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style={{ borderBottom: '3px solid var(--primary-color)' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold text-warning" to="/admin/dashboard">
          <span className="me-2">🚕</span> UCAB Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/dashboard">Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/users">Users</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/cabs">Cab Fleet</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/bookings">Bookings</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/support-tickets">Support Tickets</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {user && (
              <>
                <span className="text-warning fw-bold me-3">
                  <i className="bi bi-shield-lock-fill me-1"></i>
                  {user.name} (Admin)
                </span>
                <button onClick={handleLogout} className="btn btn-warning btn-sm rounded-pill px-4 fw-bold text-dark">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Anav;
