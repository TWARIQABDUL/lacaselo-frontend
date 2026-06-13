// API Configuration
const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://lacaselo-backend.onrender.com/api"
  : "https://lacaselo-backend.onrender.com/api";

export default API_BASE_URL;
