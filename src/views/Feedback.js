import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getEndpoint } from '../config';
import '../styles/feedback.css'; // Using a new CSS file for the combined layout

const Feedback = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  // State for the form
  const [feedbackType, setFeedbackType] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // State for the history list
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent navigation flicker
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 500);
  }, []);

  // Use useCallback to prevent re-creating the function on every render
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(getEndpoint.myFeedback(userEmail));
      setHistory(response.data);
    } catch (err) {
      setError('Could not load your feedback history.');
      console.error("Fetch feedback history error:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Fetch history when the component mounts
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [userEmail, navigate, fetchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setNotification({ show: true, message: 'Message cannot be empty.', type: 'error' });
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/myfeedback', {
        email: userEmail,
        type: feedbackType,
        message: message,
      });
      setNotification({ show: true, message: 'Thank you! Your message has been sent.', type: 'success' });
      setMessage(''); // Clear the textarea
      setFeedbackType('Feedback'); // Reset the dropdown
      
      // Refresh the history list to show the new submission immediately
      fetchHistory(); 

    } catch (err) {
      setNotification({ show: true, message: 'Failed to send message. Please try again.', type: 'error' });
      console.error('Feedback submission error:', err);
    }
  };

  // Helper to style feedback cards
  const getCardClass = (type) => {
    switch (type) {
      case 'Urgent': return 'urgent';
      case 'Complaint': return 'complaint';
      default: return '';
    }
  };

  return (
    <div className="feedback-page-container">
      <header className="dashboard-header no-print">
        <h1>⛽ Gas Monitor</h1>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/userdashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate("/history")}>History</button>
          <button className="nav-btn" onClick={() => navigate("/report")}>Report</button>
          <button className="nav-btn" onClick={() => navigate("/feedback")}>Feedback</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="feedback-page-header">
          <h1>Feedback & History</h1>
        </div>
        
        <div className="feedback-page-main">
          {/* Section 1: Submission Form */}
          <section className="feedback-form-section card">
            <h3>Submit a New Message</h3>
            <p>We value your input. Please select a message type and let us know your thoughts.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="feedbackType">Message Type</label>
                <select id="feedbackType" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                  <option value="Feedback">Feedback</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea id="message" rows="6" placeholder="Please provide details here..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              </div>
              <button type="submit" className="submit-btn">Submit Message</button>
            </form>
          </section>

          {/* Section 2: Submission History */}
          <section className="feedback-history-section">
            <h3>Your Submission History</h3>
            {loading && <p>Loading history...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
              history.length > 0 ? (
                <div className="history-list">
                  {history.map(item => (
                    <div key={item._id} className={`feedback-item card ${getCardClass(item.type)}`}>
                      <div className="feedback-item-header">
                        <span className="feedback-type">{item.type}</span>
                        <span className="feedback-date">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="feedback-message">{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You have not submitted any feedback yet.</p>
              )
            )}
          </section>
        </div>
      </main>

      {/* Notification Popup */}
      {notification.show && (
        <div className="popup-overlay">
          <div className={`popup-content notification ${notification.type}`}>
            <h3>{notification.type === 'success' ? '✅ Success' : '❌ Error'}</h3>
            <p>{notification.message}</p>
            <button onClick={() => setNotification({ ...notification, show: false })} className="popup-ok">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;