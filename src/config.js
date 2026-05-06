// API Configuration
const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://backend-vitq.onrender.com/api"
  : "https://backend-vitq.onrender.com/api";

export default API_BASE_URL;
