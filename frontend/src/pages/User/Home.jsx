import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import cabHero from '../../assets/cab_hero.png';
import Unav from './Unav';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Unav />
      
      {/* Hero Section */}
      <header className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="row align-items-center">
            {/* Hero Text */}
            <div className="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
              <span className="badge bg-warning text-dark mb-3 px-3 py-2 fs-6 fw-semibold rounded-pill">
                🚕 Premium Taxi Service
              </span>
              <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
                Your Ride, <br />
                <span style={{ color: 'var(--primary-color)' }}>Your Way</span>
              </h1>
              <p className="lead text-muted mb-4 fs-5" style={{ maxWidth: '500px' }}>
                Experience the safest and fastest ride booking. Professional verified drivers, upfront estimated pricing, and live tracking at your fingertips.
              </p>
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary-ucab btn-lg px-4 py-3">
                    Go to Dashboard <i className="bi bi-arrow-right-short ms-1"></i>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary-ucab btn-lg px-4 py-3">
                      Book a Cab
                    </Link>
                    <Link to="/register?role=driver" className="btn btn-secondary-ucab btn-lg px-4 py-3">
                      Become a Driver
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="col-lg-6 text-center">
              <img
                src={cabHero}
                alt="UCAB Isometric Cab illustration"
                className="cab-hero-img img-fluid"
                style={{ maxHeight: '420px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=60';
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-5 shadow-sm border-top border-bottom border-warning border-opacity-10">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Ride With UCAB?</h2>
            <p className="text-muted">Built for speed, convenience, and absolute safety.</p>
          </div>
          <div className="row g-4 text-center">
            {/* Feature 1 */}
            <div className="col-md-3 col-sm-6">
              <div className="p-4">
                <div className="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-wallet2 text-dark fs-3"></i>
                </div>
                <h5 className="fw-bold mb-2">Upfront Estimates</h5>
                <p className="text-muted small">No surprise charges. Know exactly what you'll pay before you click book.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="col-md-3 col-sm-6">
              <div className="p-4">
                <div className="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-shield-check text-dark fs-3"></i>
                </div>
                <h5 className="fw-bold mb-2">Verified Drivers</h5>
                <p className="text-muted small">All drivers are verified by administrative review to ensure a safe journey.</p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="col-md-3 col-sm-6">
              <div className="p-4">
                <div className="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-map text-dark fs-3"></i>
                </div>
                <h5 className="fw-bold mb-2">Simulated Live Track</h5>
                <p className="text-muted small">Watch your cab progress along the pickup route on the interactive tracking sheet.</p>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="col-md-3 col-sm-6">
              <div className="p-4">
                <div className="bg-warning bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-headset text-dark fs-3"></i>
                </div>
                <h5 className="fw-bold mb-2">24/7 Support Desk</h5>
                <p className="text-muted small">Need help? Instantly file a ticket directly in the app and receive answers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 text-center mt-5">
        <div className="container">
          <p className="mb-1 fw-bold">🚕 UCAB - Your Ride, Your Way</p>
          <p className="text-muted small mb-0">© 2026 UCAB Taxi Services Inc. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
