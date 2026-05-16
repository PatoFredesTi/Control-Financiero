import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 20000,
});

api.defaults.headers.common['X-Client-Version'] = '2.6.0';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error?.response?.data?.error?.message;

    if (Array.isArray(apiMessage)) {
      error.message = apiMessage.join(' ');
    } else if (typeof apiMessage === 'string') {
      error.message = apiMessage;
    }

    return Promise.reject(error);
  },
);
