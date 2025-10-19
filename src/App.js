import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Register from './views/Register';
import Login from './views/Login';
import UserDashboard from './views/UserDashboard';
import Newconnection from './views/Newconnection';
import Processing from './views/Processing';
import Payment from './views/Payment';
import Profile from './views/Profile';
import History from './views/History';
import Feedback from './views/Feedback';
import FeedbackHistory from './views/FeedbackHistory';
import AdminDashboard from './views/AdminDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />               {/* Home page */}
        <Route path="/register" element={<Register />} />   {/* Register page */}
        <Route path="/login" element={<Login />} />         {/* Login page */}
        <Route path="/userdash" element={<UserDashboard />} />
        <Route path="/newconnection" element={<Newconnection />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feedbackhistory" element={<FeedbackHistory />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        {/* Removed simulation control route */}
      </Routes>
    </Router>
  );
}

export default App;
