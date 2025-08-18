import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}
const AUTH_TOKEN =  "eyJhbGciOiJSUzI1NiIsImtpZCI6IkJFMUY1QkQ0ODUxNzk2NzNDNERGMzJEMzdDNDhCQ0E3NUE3ODcyNDZSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6InZoOWIxSVVYbG5QRTN6TFRmRWk4cDFwNGNrWSJ9.eyJuYmYiOjE3NTU0ODQ5ODYsImV4cCI6MTc1NTQ4ODU4NiwiaXNzIjoiaHR0cHM6Ly9ob21lLWxvZ2luLmttcy10ZWNobm9sb2d5LmNvbSIsImF1ZCI6InN5cy5ocm0iLCJjbGllbnRfaWQiOiI0YzZkN2ExM2VmYzM0NWFhOWQyM2ZkZDE4MjU3ODEyOSIsInN1YiI6Im5pbmhuZ3V5ZW5Aa21zLXRlY2hub2xvZ3kuY29tIiwiYXV0aF90aW1lIjoxNzU1NDEzMDAxLCJpZHAiOiJsb2NhbCIsImVtcGxveWVlQ29kZSI6IjQwMDQiLCJlbXBsb3llZUlkIjo3NDI2LCJmaXJzdE5hbWUiOiJOaW5oIiwibWlkZGxlTmFtZSI6IiIsImxhc3ROYW1lIjoiTmd1eWVuIiwiZnVsbE5hbWUiOiJOaW5oIE5ndXllbiIsInVzZXJfaWQiOjc0MjYsInByZWZlcnJlZF91c2VybmFtZSI6Im5pbmhuZ3V5ZW4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiTmluaCBOZ3V5ZW4iLCJqdGkiOiIwNzJGRDc4NTVEODY3RjI0NjE5NzUwNDVDMTYwMEI2NCIsInNpZCI6IjJBMTMxQTFCN0RFMjdDNjQxODQzREQ3OTE0QUEyM0FFIiwiaWF0IjoxNzU1NDEzMDAyLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiaHJtLm1vZGlmeSIsImN1c3RvbSIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXX0.baFqUyMh-MbsODkyVEnAtPTc44wO-ml15gyJemFTyFbhwY_JSEETAGa2vFkwV1d626t1moU-wIIhiSARUXtVm5omxQWSV2tvg_s9JBPuvWWgQg_KRlb1l4Hxwsu5fbgXFEkGnIqcMIpuqYNInAH5IJC2_7AdEo2nk7AwBoHr2tq48Esu1-sYMpNiy-In2cOy9hyteXWuP-nSEIqgqUfA-U2iW6iopoC7nfCBJhxICYV8-p6mFr54bOXxoWmR_g3ZQosxi7KeQ5-0IkeAhlQW1OBKnRCx0fvIAKOLUSTeTsU8PE3AoMXibYHj3qLuka2tgbhbqTzYTGbp1KuZqDINSQ";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface IUser {
  email: string;
  name: string;
}
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Replace with your actual authentication API call
      // For demo purposes, using simple validation
      if (credentials.email && credentials.password) {
        const userData = { email: credentials.email, name: 'User' };
        
        await AsyncStorage.setItem('userToken', AUTH_TOKEN);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        setIsAuthenticated(true);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
