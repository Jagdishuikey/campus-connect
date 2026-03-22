const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campus-connect-backend-tau.vercel.app/api';  
// API service for authentication
export const authAPI = {
  signup: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Token verification failed');
    }
    return data;
  },

  updateProfile: async (profileData, imageFile) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key]);
      }
    });
    if (imageFile) formData.append('profileImage', imageFile);

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Profile update failed');
    }
    return data;
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }
    return data;
  },
};

// Generic fetch with authorization
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

// Events API
export const eventsAPI = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/events`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
    return data;
  },
  create: async (eventData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create event');
    return data;
  },
  update: async (id, updateData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update event');
    return data;
  },
  delete: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete event');
    return data;
  },
};

// Groups API
export const groupsAPI = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch groups');
    return data;
  },
  create: async (groupData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create group');
    return data;
  },
  update: async (id, updateData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update group');
    return data;
  },
  delete: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete group');
    return data;
  },
  join: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups/${id}/join`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to join group');
    return data;
  },
  leave: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/groups/${id}/leave`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to leave group');
    return data;
  },
};

// Lost & Found API
export const lostFoundAPI = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/lostfound`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch items');
    return data;
  },
  create: async (itemData, imageFile) => {
    const formData = new FormData();
    Object.keys(itemData).forEach(key => {
      if (itemData[key] !== undefined && itemData[key] !== null) {
        formData.append(key, itemData[key]);
      }
    });
    if (imageFile) formData.append('image', imageFile);
    const res = await fetchWithAuth(`${API_BASE_URL}/lostfound`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to report item');
    return data;
  },
  update: async (id, updateData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/lostfound/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update item');
    return data;
  },
  delete: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/lostfound/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete item');
    return data;
  },
};

// Connections API
export const connectionsAPI = {
  getUsers: async (search = '') => {
    const res = await fetchWithAuth(`${API_BASE_URL}/connections/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  },
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/connections`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch connections');
    return data;
  },
  sendRequest: async (recipientId, message = '') => {
    const res = await fetchWithAuth(`${API_BASE_URL}/connections`, {
      method: 'POST',
      body: JSON.stringify({ recipientId, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send request');
    return data;
  },
  update: async (id, status) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update connection');
    return data;
  },
  sendMessage: async (recipientId, content, imageFile) => {
    const formData = new FormData();
    formData.append('recipientId', recipientId);
    if (content) formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);
    const res = await fetchWithAuth(`${API_BASE_URL}/connections/messages`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send message');
    return data;
  },
  getMessages: async (userId) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/connections/messages/${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
    return data;
  },
};

// Posts API
export const postsAPI = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/posts`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
    return data;
  },
  create: async (text, imageFile) => {
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (imageFile) formData.append('image', imageFile);
    const res = await fetchWithAuth(`${API_BASE_URL}/posts`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Post creation failed - status:', res.status, 'response:', data);
      throw new Error(data.message || 'Failed to create post');
    }
    return data;
  },
  delete: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete post');
    return data;
  },
  like: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/posts/${id}/like`, {
      method: 'PUT',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to like post');
    return data;
  },
};
