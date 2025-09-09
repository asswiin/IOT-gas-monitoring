// Get the current hostname (works in both development and when deployed)
const hostname = window.location.hostname;

// Define the port for the backend
const port = 5000;

// Create the base URL using the detected hostname
export const API_BASE_URL = `http://${hostname}:${port}/api`;

// Helper function to create full API endpoints
export const endpoints = {
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/register`,
  newConnection: `${API_BASE_URL}/newconnection`,
  payment: `${API_BASE_URL}/payment`,
  gasLevel: `${API_BASE_URL}/gaslevel`,
};

// Helper function to create endpoints with parameters
export const getEndpoint = {
  newConnection: (email) => `${endpoints.newConnection}/${email}`,
  gasLevel: (email) => `${endpoints.gasLevel}/${email}`,
  updateConnectionStatus: (email) => `${endpoints.newConnection}/${email}/status`,
  deactivateConnection: (email) => `${endpoints.newConnection}/${email}/deactivate`,
};
