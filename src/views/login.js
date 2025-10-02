
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import '../styles/Login.css'; // Make sure this path is correct for your project structure
// import { endpoints } from '../config'; // Your config file for API endpoints

// /**
//  * Login Component
//  * Handles user authentication and redirects them based on their role and KYC status.
//  */
// function Login() {
//   // State variables to manage form inputs, loading status, and error messages
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Hook to navigate the user programmatically after login
//   const navigate = useNavigate();
  
//   // useEffect hook to run once when the component mounts.
//   // This is a good practice to ensure no stale login data persists from a previous session.
//   useEffect(() => {
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userPhone');
//     localStorage.removeItem('isLoggedIn');
//     localStorage.removeItem('userRole');
//   }, []);

//   /**
//    * Handles the form submission event.
//    * @param {React.FormEvent} e - The form submission event.
//    */
//   const handleSubmit = async (e) => {
//     // Prevent the default form submission which causes a page reload
//     e.preventDefault();
    
//     // Set loading state to true to disable the button and show user feedback
//     setIsLoading(true);
//     // Clear any previous error messages
//     setErrorMsg('');

//     try {
//       // Step 1: Make a single API call to the backend's login endpoint.
//       // The backend will validate credentials and return user role and KYC status.
//       const response = await axios.post(endpoints.login, {
//         email,
//         password,
//       });

//       // Check if the backend response indicates a successful login
//       if (response.data.success) {
//         // Destructure the necessary data from the response
//         const { role, email, phone, kycStatus } = response.data;

//         // Step 2: Store essential user information in localStorage for access across the app
//         localStorage.setItem('isLoggedIn', 'true');
//         localStorage.setItem('userRole', role);
//         localStorage.setItem('userEmail', email);
//         localStorage.setItem('userPhone', phone);
        
//         // Step 3: Implement the core redirection logic
//         if (role === 'admin') {
//           // If the user is an admin, always redirect to the admin dashboard
//           navigate('/admindashboard');
//         } else {
//           // For regular users, check their KYC status to determine the correct destination
//           if (kycStatus === 'active' || kycStatus === 'refill_payment_pending' || kycStatus === 'booking_pending') {
//             // If the user's connection is active OR a refill payment is pending,
//             // they should go to their main dashboard. This is the key fix.
//             navigate('/userdashboard');
//           } else {
//             // For any other status (e.g., 'pending_approval', 'rejected', or null if they've never applied),
//             // direct them to the new connection page to complete or check their application.
//             navigate('/newconnection');
//           }
//         }
//       }
//     } catch (error) {
//       // If the API call fails (e.g., network error or 401 Unauthorized),
//       // set an appropriate error message to display to the user.
//       setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials.');
//     } finally {
//       // Step 4: This block always runs, whether the try succeeded or failed.
//       // Set loading state back to false to re-enable the form.
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="login-container"
//       style={{
//         // Using an inline style for the background image from the public folder
//         backgroundImage: 'url(/login.jpeg)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="form-box">
//         <h2>Login to Your Account</h2>
//         <form onSubmit={handleSubmit} autoComplete="off" noValidate>
//           <div className="form-group">
//             <input
//               type="email"
//               value={email}
//               placeholder="Enter Your Email"
//               // Update state on change, converting email to lowercase for consistency
//               onChange={(e) => setEmail(e.target.value.toLowerCase())}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//           <button type="submit" disabled={isLoading}>
//             {/* Ternary operator to change button text based on loading state */}
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         {/* Conditionally render the error message only if it's not empty */}
//         {errorMsg && <p className="error-message">{errorMsg}</p>}

//         <p className="register-text">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;



























































import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css'; // Make sure this path is correct for your project structure
import { endpoints } from '../config'; // Your config file for API endpoints

/**
 * Login Component
 * Handles user authentication and redirects them based on their role and KYC status.
 */
function Login() {
  // State variables to manage form inputs, loading status, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook to navigate the user programmatically after login
  const navigate = useNavigate();
  
  // useEffect hook to run once when the component mounts.
  // This is a good practice to ensure no stale login data persists from a previous session.
  useEffect(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    // Clear stale KYC form data from previous sessions to prevent incorrect redirects.
    localStorage.removeItem('kycFormData');
  }, []);

  /**
   * Handles the form submission event.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    // Prevent the default form submission which causes a page reload
    e.preventDefault();
    
    // Set loading state to true to disable the button and show user feedback
    setIsLoading(true);
    // Clear any previous error messages
    setErrorMsg('');

    try {
      // Step 1: Make a single API call to the backend's login endpoint.
      // The backend will validate credentials and return user role and KYC status.
      const response = await axios.post(endpoints.login, {
        email,
        password,
      });

      // Check if the backend response indicates a successful login
      if (response.data.success) {
        // Destructure the necessary data from the response
        const { role, email, phone, kycStatus } = response.data;

        // Step 2: Store essential user information in localStorage for access across the app
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPhone', phone);
        
        // --- START: REVISED REDIRECTION LOGIC ---
        // This logic correctly handles the entire user lifecycle.
        if (role === 'admin') {
          // If the user is an admin, always redirect to the admin dashboard.
          navigate('/admindashboard');
        } else {
          // For regular users, use a switch statement for clear, specific redirection.
          switch (kycStatus) {
            case 'active':
            case 'refill_payment_pending':
            case 'booking_pending':
              // If the user's connection is active or a refill/booking is pending,
              // they should go to their main dashboard.
              navigate('/userdashboard');
              break;
            
            case 'approved':
              // If the admin has approved the KYC form, the user's next step is payment.
              navigate('/payment');
              break;

            case 'pending_approval':
              // If the KYC application is still waiting for admin review.
              navigate('/processing');
              break;

            case 'rejected':
            case 'deactivated':
            case null: // This handles brand-new users who have never submitted a form.
            default:
              // For any other status (rejected, deactivated, or never applied),
              // direct them to the new connection page to complete/update their application.
              navigate('/newconnection');
              break;
          }
        }
        // --- END: REVISED REDIRECTION LOGIC ---
        
      }
    } catch (error) {
      // If the API call fails (e.g., network error or 401 Unauthorized),
      // set an appropriate error message to display to the user.
      setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      // Step 4: This block always runs, whether the try succeeded or failed.
      // Set loading state back to false to re-enable the form.
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        // Using an inline style for the background image from the public folder
        backgroundImage: 'url(/login.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="form-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="form-group">
            <input
              type="email"
              value={email}
              placeholder="Enter Your Email"
              // Update state on change, converting email to lowercase for consistency
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
            {/* Ternary operator to change button text based on loading state */}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Conditionally render the error message only if it's not empty */}
        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <p className="register-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;