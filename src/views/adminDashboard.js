import React from "react";
import "../styles/adminDashboard.css";

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin</h2>
        <nav>
          <ul>
            <li className="active">Dashboard</li>
            <li>Users</li>
            <li>Requests</li>
            <li>Payments</li>
            <li>Reports</li>
            <li>Settings</li>
          </ul>
        </nav>
        <div className="user-info">
          <div className="avatar"></div>
          <div>
            <p className="username">Admin User</p>
            <p className="signout">Sign Out</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-center">
          <h1 className="page-title">Dashboard</h1>

          {/* Stats */}
          <div className="card-grid">
            <Card title="Total Users"></Card>
            <Card title="Active Connections"></Card>
          </div>

          {/* System Overview */}
          <h2 className="section-title">System Overview</h2>
          <div className="card-grid">
            <Card title="User Growth">h</Card>
            <Card title="Connection Activity"> </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
