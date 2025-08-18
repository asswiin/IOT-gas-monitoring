import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Register from './views/Register';
import Login from './views/Login';
import userDashboard from './views/UserDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />               {/* Home page */}
        <Route path="/register" element={<Register />} />   {/* Register page */}
        <Route path="/login" element={<Login />} />         {/* Login page */}
        <Route path="/userdash" element={<userDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
