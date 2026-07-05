import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Unav = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-ucab navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="me-2">🚕</span> UCAB
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#userNavbar"
          aria-controls="userNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="userNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">Home</NavLink>
                </li>
              </>
            ) : user.role === 'user' ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">Available Cabs</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/my-bookings">My Bookings</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/support">Support / Help</NavLink>
                </li>
              </>
            ) : user.role === 'driver' ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/my-bookings">Assigned Rides</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/support">Support / Help</NavLink>
                </li>
              </>
            ) : null}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <span className="text-dark fw-bold me-3">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name} ({user.role === 'driver' ? 'Driver' : 'User'})
                </span>
                {user.role === 'driver' && user.driverDetails && (
                  <span className={`badge me-3 ${user.driverDetails.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {user.driverDetails.status}
                  </span>
                )}
                <button onClick={handleLogout} className="btn btn-secondary-ucab btn-sm px-4">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark me-2 border-0 fw-bold">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary-ucab px-4">
                  Register
                </Link>
                <Link to="/admin/login" className="btn btn-outline-dark ms-3 border-2 border-dark rounded-pill py-1 px-3 fw-bold btn-sm">
                  Admin Panel
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Unav;
