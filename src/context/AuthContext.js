'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Create an Auth Context
const AuthContext = createContext();

// AuthProvider component that will wrap the application
export const AuthProvider = ({ children }) => {
  // Initialize authState with default values or from sessionStorage
  const [authState, setAuthState] = useState(() => {
    if (typeof window !== 'undefined') {
      // Try to get the initial auth state from sessionStorage
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      const name = sessionStorage.getItem('name');
      return {
        token: token || null,
        role: role || null,
        name: name || null,
      };
    }
    return { token: null, role: null, name: null };
  });

  // Update the sessionStorage whenever authState changes
  useEffect(() => {
    if (authState.role) {
      sessionStorage.setItem('token', authState.token);
      sessionStorage.setItem('role', authState.role);
      sessionStorage.setItem('name', authState.name);
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('name');
    }
  }, [authState]);

  // Login function to set the session data
  const login = (data) => {
    setAuthState({
      token: data.token,
      role: data.role,
      name: data.username,
    });
  };

  // Logout function to clear session
  const logout = () => {
    setAuthState({
      token: null,
      role: null,
      name: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
