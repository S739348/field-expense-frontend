import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.employeeId) {
    config.headers['x-user-id'] = user.employeeId;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('API call - credentials:', credentials);
    return api.post('/employees/login', credentials);
  },
};

// Employee API
export const employeeAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/employees/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put('/employees/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProfile: (data) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const requestData = {
      employeeId: user.employeeId,
      name: data.name,
      mobile: data.mobile,
      password: data.password
    };
    return api.put('/employees/update', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.employeeId
      }
    });
  },
  delete: (employeeIds) => api.delete('/employees/delete', { data: { employeeIds } }),
  getAll: () => api.get('/employees/show'),
  getRoles: () => api.get('/employees/showRoles'),
  getManagers: () => api.get('/employees/showManager'),
};

// Task API
export const taskAPI = {
  create: (data) => api.post('/tasks/create', data),
  update: (data) => api.put('/tasks/update', data),
  delete: (taskIds) => api.delete('/tasks/delete', { data: { taskIds } }),
  getAll: (range) => api.get(`/tasks/show${range ? `?range=${range}` : ''}`),
  getFieldEmployees: () => api.get('/tasks/showFieldEmployee'),
};

// Expense API
export const expenseAPI = {
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/expenses/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put('/expenses/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (expenseIds) => api.delete('/expenses/delete', { data: { expenseIds } }),
  getAll: (range) => api.get(`/expenses/show${range ? `?range=${range}` : ''}`),
};

// Category API
export const categoryAPI = {
  create: (name) => api.post('/expense-categories/create', { name }),
  delete: (categoryIds) => api.delete('/expense-categories/delete', { data: { categoryIds } }),
  getAll: () => api.get('/expense-categories/show'),
};
