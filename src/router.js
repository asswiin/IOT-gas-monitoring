import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './views/Home';
import Register from './views/Register';
import Login from './views/Login'; // Fixed case to match actual filename
import AdminDashboard from './views/AdminDashboard';
import NewConnection from './views/NewConnection';
import UserDashboard from './views/UserDashboard';
import PaymentPage from './views/Payment';
import EditProfile from './views/EditProfile';
import Profile from './views/Profile';
import ProcessingPage from './views/ProcessingPage';
import SimulationControl from './views/SimulationControl';
import History from './views/History';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/newconnection" element={<NewConnection />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/simulation" element={<SimulationControl />} />
         <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;