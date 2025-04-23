import axios from 'axios';

const api = axios.create({
  timeout: 10 * 1000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
