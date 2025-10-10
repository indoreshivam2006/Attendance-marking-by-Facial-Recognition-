import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      throw new Error('Request timeout. Please check if the backend server is running.');
    }
    
    if (error.response) {
      // Server responded with error
      console.error('Response error:', error.response.data);
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// API endpoints
export const apiEndpoints = {
  // Students
  getStudents: () => api.get('/api/students'),
  createStudent: (data: any) => api.post('/api/students', data),
  deleteStudent: (id: number) => api.delete(`/api/students/${id}`),
  uploadStudentImages: (id: number, formData: FormData) => 
    api.post(`/api/students/${id}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Sessions
  getSessions: () => api.get('/api/sessions'),
  createSession: (data: any) => api.post('/api/sessions', data),
  getActiveSession: () => api.get('/api/sessions/active'),
  
  // Attendance
  getSessionAttendance: (sessionId: number) => api.get(`/api/attendance/session/${sessionId}`),
  calculateAttendancePercentages: (sessionId: number) => 
    api.post('/api/attendance/calculate-percentages', { session_id: sessionId }),
  
  // Reports
  getLowAttendanceStudents: (threshold: number = 75) => 
    api.get(`/api/reports/low-attendance?threshold=${threshold}`),
  getAttendanceStats: () => api.get('/api/reports/attendance-stats'),
  getMonthlyReport: (studentId: number, month?: number, year?: number) => 
    api.get(`/api/reports/monthly/${studentId}`, { params: { month, year } }),
};

export default api;