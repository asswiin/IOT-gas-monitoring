
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Step 1: Authenticate the user
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Save login info to localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userEmail', response.data.email);
        // Assuming your login response also includes the phone number
        // If not, you may need to adjust your backend to send it
        // localStorage.setItem('userPhone', response.data.phone);

        // Step 2: Redirect based on role
        if (response.data.role === 'admin') {
          navigate('/admindashboard');
        } else {
          // ✅ For regular users, check their connection status before redirecting
          try {
            const kycRes = await axios.get(`http://localhost:5000/api/newconnection/${response.data.email}`);
            
            // ✅ Step 3: Redirect based on connection status
            if (kycRes.data && kycRes.data.status === 'active') {
              // If status is 'active', they have already paid. Go to the dashboard.
              navigate('/userdashboard');
            } else {
              // If status is 'pending_payment', go to the new connection/payment page.
              navigate('/newconnection');
            }
          } catch (error) {
            // This 'catch' block will run if the GET request fails,
            // which typically means a 404 (no KYC record found).
            if (error.response && error.response.status === 404) {
              // User has logged in but has never filled out the KYC form.
              navigate('/newconnection');
            } else {
              // Handle other potential errors (e.g., server is down)
              console.error('Could not verify KYC status:', error);
              setErrorMsg('Could not verify connection status. Please try again.');
            }
          }
        }
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: 'url(/login.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="form-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              placeholder="Enter Your Email"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <p className="register-text">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;