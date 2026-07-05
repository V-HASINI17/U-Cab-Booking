import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anav from './Anav';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch system users database');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`/users/${userId}`);
      if (res.data.success) {
        alert('User account deleted');
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete operation failed');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  return (
    <div>
      <Anav />
      <div className="container py-4">
        <h2 className="fw-bold mb-1">Users &amp; Drivers Database</h2>
        <p className="text-muted mb-4">View register log and manage customer profiles.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="alert alert-info text-center">No users registered in database.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-ucab table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Driver Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong className="text-dark">{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td>
                      <span className={`badge ${u.role === 'driver' ? 'bg-primary' : 'bg-secondary'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.role === 'driver' && u.driverDetails ? (
                        <div className="small">
                          <div><strong>Plate:</strong> {u.driverDetails.vehicleNumber}</div>
                          <div>
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${u.driverDetails.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {u.driverDetails.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted small">N/A</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(u._id)}
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 me-2"
                      >
                        <i className="bi bi-pencil-fill me-1"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="btn btn-danger btn-sm rounded-pill px-3 py-1 text-white"
                      >
                        <i className="bi bi-trash-fill"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
