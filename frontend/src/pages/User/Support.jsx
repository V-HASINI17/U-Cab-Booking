import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Unav from './Unav';

const Support = () => {
  const { user } = useContext(AuthContext);
  
  // States
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selected ticket dialogue states
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/support');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const res = await axios.post('/support', { subject, message });
      if (res.data.success) {
        setSubject('');
        setMessage('');
        fetchTickets();
        alert('Ticket registered. Our support desk will reply shortly.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open ticket');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      const res = await axios.get(`/support/${ticketId}`);
      if (res.data.success) {
        setActiveTicket(res.data.data);
      }
    } catch (err) {
      alert('Failed to load conversation details');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setReplyLoading(true);
    try {
      const res = await axios.post(`/support/${activeTicket._id}/reply`, { message: replyMessage });
      if (res.data.success) {
        setReplyMessage('');
        setActiveTicket(res.data.data);
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div>
      <Unav />
      <div className="container py-4">
        <h2 className="fw-bold mb-1">Help &amp; Support</h2>
        <p className="text-muted mb-4">Submit queries to the UCAB admin team and track answers.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          {/* Ticket Logger Column */}
          <div className="col-md-5">
            <div className="card ucab-card p-4 shadow-sm">
              <h5 className="fw-bold text-warning mb-3">Open a Support Ticket</h5>
              <form onSubmit={handleOpenTicket}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., App fare discrepancy / Login issues"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Describe Your Issue</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Please explain the problem clearly..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary-ucab w-100 py-2.5 rounded-pill fw-bold"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Registering Ticket...' : 'File Ticket ✉️'}
                </button>
              </form>
            </div>
          </div>

          {/* Ticket List Column */}
          <div className="col-md-7">
            <div className="card ucab-card p-4 shadow-sm h-100">
              <h5 className="fw-bold text-dark mb-3">Your Support History</h5>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning spinner-border-sm" role="status"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-4 bg-light rounded">
                  <p className="text-muted mb-0 small">No support tickets found.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {tickets.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => handleSelectTicket(t._id)}
                      className={`list-group-item list-group-item-action border-0 px-3 py-3 mb-2 rounded border-start border-3 ${
                        activeTicket?._id === t._id ? 'bg-light border-warning' : 'border-light'
                      }`}
                    >
                      <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{t.subject}</strong>
                        <span className={`badge ${t.status === 'Open' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-muted small text-truncate mb-1">{t.message}</p>
                      <small className="text-muted">Filed: {new Date(t.createdAt).toLocaleDateString()}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Ticket Conversation Modal / Details Box */}
        {activeTicket && (
          <div className="card ucab-card p-4 mt-4 border-warning shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">
                Ticket Conversation: <span className="text-warning">{activeTicket.subject}</span>
              </h5>
              <button className="btn-close" onClick={() => setActiveTicket(null)}></button>
            </div>
            
            {/* Conversation Flow */}
            <div className="bg-light p-3 rounded mb-3 border" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {/* Original Message */}
              <div className="p-2 mb-3 bg-warning bg-opacity-10 border-start border-warning border-3 rounded">
                <strong className="text-dark small d-block">Original Request ({new Date(activeTicket.createdAt).toLocaleDateString()}):</strong>
                <p className="mb-0 small">{activeTicket.message}</p>
              </div>

              {/* Replies */}
              {activeTicket.replies.length === 0 ? (
                <p className="text-center text-muted small py-3 mb-0">No replies yet. An administrator will reply soon.</p>
              ) : (
                activeTicket.replies.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-2 mb-2 rounded small ${
                      r.senderRole === 'admin' ? 'bg-dark text-white ms-4 border-start border-warning border-3' : 'bg-white text-dark me-4 border'
                    }`}
                  >
                    <div className="d-flex justify-content-between mb-1">
                      <strong className={r.senderRole === 'admin' ? 'text-warning' : 'text-dark'}>
                        {r.senderName} ({r.senderRole === 'admin' ? 'Admin Support' : 'You'})
                      </strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="mb-0">{r.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input Box */}
            {activeTicket.status === 'Open' ? (
              <form onSubmit={handleReplySubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  />
                  <button className="btn btn-warning fw-bold text-dark px-4" type="submit" disabled={replyLoading}>
                    {replyLoading ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="alert alert-secondary py-2 text-center small mb-0">
                This ticket has been marked as <strong>Resolved</strong>. If you still need help, please open a new ticket.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
