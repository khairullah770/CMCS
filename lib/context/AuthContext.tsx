"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { users } from '../dummy-data/mock-data';

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const LOCAL_USER_STORAGE_KEY = 'cmcs-demo-user';
const LOCAL_ACCESS_TOKEN = 'cmcs-demo-access-token';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  department: string;
  status: string;
  phone?: string;
  photoUrl?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedLocalUser = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (storedLocalUser) {
      try {
        setUser(JSON.parse(storedLocalUser));
        setAccessToken(LOCAL_ACCESS_TOKEN);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Failed to restore local demo session:', error);
        localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
      }
    }

    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      // Verify token and get user data
      fetchCurrentUser(storedAccessToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user data
  async function fetchCurrentUser(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Local demo login. The backend login implementation remains below for later use.
  async function login(email: string, password: string) {
    const demoUser = Object.values(users).find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!demoUser) {
      throw new Error('Invalid email or password');
    }

    const localUser: User = {
      id: demoUser.employeeId,
      employeeId: demoUser.employeeId,
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.name.slice(demoUser.firstName.length).trim(),
      name: demoUser.name,
      role: demoUser.role,
      department: demoUser.department,
      status: 'active',
    };

    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localUser));
    setAccessToken(LOCAL_ACCESS_TOKEN);
    setRefreshToken(null);
    setUser(localUser);
  }

  async function loginWithBackend(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    // Save tokens
    const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;
    
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
  }

  // Logout function
  async function logout() {
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    setAccessToken(null);

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear local state and storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  // Refresh access token
  async function refreshAccessToken() {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Refresh token is invalid, logout
      await logout();
      throw new Error('Session expired. Please login again.');
    }

    // Update access token
    const { accessToken: newAccessToken } = data.data;
    localStorage.setItem('accessToken', newAccessToken);
    setAccessToken(newAccessToken);
  }

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
