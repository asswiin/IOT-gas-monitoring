import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Register from './views/Register';
import Login from './views/Login'; // Fixed case to match actual filename
import AdminDashboard from './views/AdminDashboard';
import NewConnection from './views/NewConnection';
import UserDashboard from './views/UserDashboard';
import GasBook from './views/GasBook'; // Assuming you have a GasBook component
import PaymentPage from './views/Payment';  


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/newconnection" element={<NewConnection />} />
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/gasbook" element={<GasBook />} />
      <Route path="/payment" element={<PaymentPage />} />
     
    </Routes>
  );
}

export default AppRoutes;