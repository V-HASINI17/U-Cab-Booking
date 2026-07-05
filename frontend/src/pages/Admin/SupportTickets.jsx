import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Anav from './Anav';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Conversation dialogue details
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('Open');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/support/all');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      setError('Failed to retrieve help tickets database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      const res = await axios.get(`/support/${ticketId}`);
      if (res.data.success) {
        setActiveTicket(res.data.data);
        setResolutionStatus(res.data.data.status);
      }
    } catch (err) {
      alert('Failed to retrieve ticket logs.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await axios.post(`/support/${activeTicket._id}/reply`, {
        message: replyText,
        status: resolutionStatus
      });
      if (res.data.success) {
        setReplyText('');
        setActiveTicket(res.data.data);
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to register support reply');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div>
      <Anav />
      <div className="container py-4">
        <h2 className="fw-bold mb-1">Support Help Desk</h2>
        <p className="text-muted mb-4">View incoming client questions, reply back, and close resolution logs.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          {/* Left: Tickets List */}
          <div className="col-md-5">
            <div className="card ucab-card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">Support Queue</h5>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning spinner-border-sm" role="status"></div>
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-muted small text-center py-4">No help desk tickets filed yet.</p>
              ) : (
                <div className="list-group list-group-flush" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {tickets.map(t => (
                    <button
                      key={t._id}
                      onClick={() => handleSelectTicket(t._id)}
                      className={`list-group-item list-group-item-action border-0 px-2 py-3 mb-2 rounded border-start border-3 ${
                        activeTicket?._id === t._id ? 'bg-light border-warning' : 'border-light'
                      }`}
                    >
                      <div className="d-flex w-100 justify-content-between mb-1 align-items-center">
                        <strong className="text-dark small">{t.subject}</strong>
                        <span className={`badge ${t.status === 'Open' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-muted small text-truncate">User: {t.userId?.name} ({t.userId?.role})</div>
                      <p className="text-muted small text-truncate mb-1">{t.message}</p>
                      <small className="text-muted text-xs">Date: {new Date(t.createdAt).toLocaleDateString()}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Ticket Dialog */}
          <div className="col-md-7">
            {activeTicket ? (
              <div className="card ucab-card p-4 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">{activeTicket.subject}</h5>
                    <span className="text-muted small">
                      Filed by: <strong>{activeTicket.userId?.name}</strong> ({activeTicket.userId?.email} | {activeTicket.userId?.mobile})
                    </span>
                  </div>
                  <button className="btn-close" onClick={() => setActiveTicket(null)}></button>
                </div>

                {/* Messages Flow */}
                <div className="bg-light p-3 rounded mb-3 border" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {/* Original message */}
                  <div className="p-2 mb-3 bg-white border rounded">
                    <span className="badge bg-warning text-dark mb-1">Original Issue Request</span>
                    <p className="mb-0 small">{activeTicket.message}</p>
                    <small className="text-muted text-xs d-block mt-1">{new Date(activeTicket.createdAt).toLocaleString()}</small>
                  </div>

                  {/* Replies */}
                  {activeTicket.replies.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-2 mb-2 rounded small ${
                        r.senderRole === 'admin' ? 'bg-dark text-white ms-4 border-start border-warning border-3' : 'bg-white text-dark me-4 border'
                      }`}
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <strong className={r.senderRole === 'admin' ? 'text-warning' : 'text-dark'}>
                          {r.senderName} ({r.senderRole.toUpperCase()})
                        </strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="mb-0">{r.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReplySubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Write Support Reply</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Type reply details..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <span className="me-2 fw-semibold">Resolution Status:</span>
                      <select
                        className="form-select form-select-sm"
                        value={resolutionStatus}
                        onChange={(e) => setResolutionStatus(e.target.value)}
                        style={{ width: '120px' }}
                      >
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <button className="btn btn-warning fw-bold text-dark px-4 py-2" type="submit" disabled={replyLoading}>
                      {replyLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card ucab-card p-5 text-center shadow-sm h-100 d-flex flex-column align-items-center justify-content-center">
                <i className="bi bi-chat-left-dots-fill fs-1 text-muted mb-3"></i>
                <h5 className="fw-bold">No Ticket Selected</h5>
                <p className="text-muted">Pick a ticket from the support queue on the left to read correspondence logs and send responses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
