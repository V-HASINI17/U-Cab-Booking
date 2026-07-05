import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anav from './Anav';

const AddCar = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Sedan');
  const [number, setNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [pricePerKm, setPricePerKm] = useState(15);
  const [city, setCity] = useState('New York');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // List of verified drivers
  const [drivers, setDrivers] = useState([]);
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVerifiedDrivers();
  }, []);

  const fetchVerifiedDrivers = async () => {
    try {
      const res = await axios.get('/users');
      if (res.data.success) {
        // Filter drivers who are Verified
        const verifiedList = res.data.data.filter(
          u => u.role === 'driver' && u.driverDetails?.status === 'Verified'
        );
        setDrivers(verifiedList);
      }
    } catch (err) {
      console.error('Failed to fetch drivers list:', err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please select an image file for the cab.');
      return;
    }

    setSubmitLoading(true);

    // Form data payload since we are transferring a file binary
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('number', number);
    formData.append('seats', Number(seats));
    formData.append('pricePerKm', Number(pricePerKm));
    formData.append('city', city);
    formData.append('image', imageFile);
    
    if (assignedDriverId) {
      formData.append('assignedDriverId', assignedDriverId);
    }

    try {
      const res = await axios.post('/cars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        alert('Cab added successfully to fleet!');
        navigate('/admin/cabs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register cab.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Anav />
      <div className="container py-5 d-flex justify-content-center">
        <div className="card ucab-card p-4 shadow-sm w-100" style={{ maxWidth: '650px' }}>
          <h3 className="fw-bold mb-4">Add New Cab</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cab Model Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Toyota Corolla / Ford Explorer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Cab Category</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV (6 Seats)</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Registration Number (Plates)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NY-987-AB"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Seating Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  min="2"
                  max="12"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fare Rate per KM ($)</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">City Region</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. New York / Los Angeles"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-semibold">Assign Verified Driver Partner (Optional)</label>
                <select
                  className="form-select"
                  value={assignedDriverId}
                  onChange={(e) => setAssignedDriverId(e.target.value)}
                >
                  <option value="">-- Select Verified Driver --</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} (License: {d.driverDetails?.licenseNumber})</option>
                  ))}
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-semibold">Cab Image Photo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>

              {/* Image Preview Thumbnail */}
              {imagePreview && (
                <div className="col-12 mt-3 text-center">
                  <span className="text-muted d-block small mb-2">Image Upload Preview</span>
                  <img
                    src={imagePreview}
                    alt="Cab Upload Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: '180px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary-ucab w-50 rounded-pill fw-bold"
                disabled={submitLoading}
              >
                {submitLoading ? 'Uploading...' : 'Save Cab'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/cabs')}
                className="btn btn-secondary-ucab w-50 rounded-pill"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
