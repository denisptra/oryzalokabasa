"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token on mount & restore user data
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear legacy localStorage data so old sessions don't persist
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }

    const token = authAPI.getToken();
    if (token) {
      // Restore user data from sessionStorage
      const savedUser = sessionStorage.getItem("userData");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser({ token });
        }
      } else {
        setUser({ token });
      }
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      authAPI.setToken(response.token);

      // Store full user data including role
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);

      // Persist user data
      if (typeof window !== "undefined") {
        sessionStorage.setItem("userData", JSON.stringify(userData));
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(name, email, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await authAPI.logout();
      } catch (err) {
        console.error("Logout API error:", err);
      }

      // Clear all auth data
      authAPI.clearToken();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("userData");
        // Also clean up old localStorage if exists from before
        localStorage.removeItem("userData");
        localStorage.removeItem("authToken");
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan dalam AuthProvider");
  }
  return context;
};
