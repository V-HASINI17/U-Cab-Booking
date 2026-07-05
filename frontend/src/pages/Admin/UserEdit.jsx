import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anav from './Anav';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('user');

  // Driver details states
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [status, setStatus] = useState('Pending');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`/users/${id}`);
      if (res.data.success) {
        const u = res.data.data;
        setName(u.name);
        setEmail(u.email);
        setMobile(u.mobile);
        setRole(u.role);

        if (u.role === 'driver' && u.driverDetails) {
          setLicenseNumber(u.driverDetails.licenseNumber || '');
          setVehicleModel(u.driverDetails.vehicleModel || '');
          setVehicleNumber(u.driverDetails.vehicleNumber || '');
          setVehicleType(u.driverDetails.vehicleType || 'Sedan');
          setStatus(u.driverDetails.status || 'Pending');
        }
      }
    } catch (err) {
      setError('Failed to retrieve user details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    const payload = {
      name,
      email,
      mobile,
      role
    };

    if (role === 'driver') {
      payload.driverDetails = {
        licenseNumber,
        vehicleModel,
        vehicleNumber,
        vehicleType,
        status
      };
    }

    try {
      const res = await axios.put(`/users/${id}`, payload);
      if (res.data.success) {
        alert('User details updated successfully');
        navigate('/admin/users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Anav />
      <div className="container py-5 d-flex justify-content-center">
        {loading ? (
          <div className="spinner-border text-warning" role="status"></div>
        ) : (
          <div className="card ucab-card p-4 shadow-sm w-100" style={{ maxWidth: '600px' }}>
            <h3 className="fw-bold mb-4">Edit User Account</h3>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Account Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">Passenger (User)</option>
                    <option value="driver">Driver Partner</option>
                  </select>
                </div>

                {role === 'driver' && (
                  <>
                    <div className="col-12">
                      <hr className="my-2" />
                      <h5 className="fw-bold text-warning mb-2">Driver Profile Specifications</h5>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">License Registration</label>
                      <input
                        type="text"
                        className="form-control"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Vehicle Model</label>
                      <input
                        type="text"
                        className="form-control"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Vehicle License Plate</label>
                      <input
                        type="text"
                        className="form-control"
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
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Driver Verification Status</label>
                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="Pending">Pending Approval</option>
                        <option value="Verified">Verified &amp; Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-ucab w-50 rounded-pill fw-bold"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="btn btn-secondary-ucab w-50 rounded-pill"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEdit;
