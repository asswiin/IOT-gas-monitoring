import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getEndpoint } from '../config';
import '../styles/feedbackHistory.css'; // We will create this CSS file next

const FeedbackHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(getEndpoint.myFeedback(userEmail));
        setHistory(response.data);
      } catch (err) {
        setError('Could not load your feedback history. Please try again later.');
        console.error("Fetch feedback history error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userEmail, navigate]);
  
  // Helper to apply class based on feedback type
  const getCardClass = (type) => {
    switch (type) {
      case 'Urgent': return 'urgent';
      case 'Complaint': return 'complaint';
      default: return '';
    }
  };

  return (
    <div className="feedback-history-container">
      <header className="feedback-history-header">
        <h1>My Submission History</h1>
        <button onClick={() => navigate('/userdashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
      </header>
      <main className="feedback-history-main">
        {loading && <p>Loading history...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          history.length > 0 ? (
            history.map(item => (
              <div key={item._id} className={`feedback-item card ${getCardClass(item.type)}`}>
                <div className="feedback-item-header">
                  <span className="feedback-type">{item.type}</span>
                  <span className="feedback-date">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="feedback-message">{item.message}</p>
              </div>
            ))
          ) : (
            <p>You have not submitted any feedback yet.</p>
          )
        )}
      </main>
    </div>
  );
};

export default FeedbackHistory;