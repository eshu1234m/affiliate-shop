import axios from 'axios';

const api = axios.create({
  // TEMPORARY: We will change this to your Render URL later!
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

export default api;