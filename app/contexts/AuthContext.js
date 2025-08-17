"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within anAuthProvider");
  }
  return context;
};



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [departmentMember, setDepartmentMember] = useState(null);
  const [superadmin, setSuperadmin] = useState(null);
  const [isDepartmentAuthenticated, setIsDepartmentAuthenticated] = useState(false);
  const [isSuperadminAuthenticated, setIsSuperadminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [databaseConnectionError, setDatabaseConnectionError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Add a small delay to allow Google OAuth callback to set localStorage
    const initializeAuth = () => {
      // Clean up any invalid localStorage data first
      const cleanupInvalidData = () => {
        const userId = localStorage.getItem("userId");
        const departmentMemberId = localStorage.getItem("departmentMemberId");
        const superadminId = localStorage.getItem("superadminId");
        
        console.log('AuthContext cleanup - Before cleanup:', {
          userId,
          departmentMemberId,
          superadminId
        });
        
        if (userId === "null" || userId === "undefined" || userId === "") {
          console.log('Removing invalid userId:', userId);
          localStorage.removeItem("userId");
        }
        
        if (departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId === "") {
          console.log('Removing invalid departmentMemberId:', departmentMemberId);
          localStorage.removeItem("departmentMemberId");
        }

        if (superadminId === "null" || superadminId === "undefined" || superadminId === "") {
          console.log('Removing invalid superadminId:', superadminId);
          localStorage.removeItem("superadminId");
        }
        
        console.log('AuthContext cleanup - After cleanup:', {
          userId: localStorage.getItem("userId"),
          departmentMemberId: localStorage.getItem("departmentMemberId"),
          superadminId: localStorage.getItem("superadminId")
        });
      };
      
      cleanupInvalidData();
      
      // Check for existing authentication on mount
      const userId = localStorage.getItem("userId");
      const departmentMemberId = localStorage.getItem("departmentMemberId");
      const superadminId = localStorage.getItem("superadminId");

      // Check for backup userId cookie (from Google OAuth)
      const backupUserIdCookie = (() => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; google-auth-user-id=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop().split(';').shift();
          return cookieValue;
        }
        return null;
      })();

      console.log('AuthContext initialization:', {
        localStorageUserId: userId,
        backupUserIdCookie,
        departmentMemberId,
        superadminId
      });

      // Priority: localStorage userId > backup userId cookie > other auth types
      console.log('AuthContext authentication logic:', {
        hasUserId: !!userId,
        userIdValue: userId,
        backupUserIdCookie,
        isLoggingOut
      });
      
      // Don't authenticate if we're in the process of logging out
      if (isLoggingOut) {
        console.log('Skipping authentication - logout in progress');
        setLoading(false);
        return;
      }
      
      if (userId && userId !== "null" && userId !== "undefined" && userId.trim() !== "") {
        console.log('Using localStorage userId:', userId);
        fetchUserData(userId);
      } else if (backupUserIdCookie && backupUserIdCookie !== "null" && backupUserIdCookie !== "undefined" && backupUserIdCookie.trim() !== "") {
        // Use backup userId cookie
        console.log('Using backup userId cookie:', backupUserIdCookie);
        localStorage.setItem("userId", backupUserIdCookie);
        fetchUserData(backupUserIdCookie);
      } else if (userId) {
        // Clear invalid userId
        console.log('Clearing invalid userId:', userId);
        localStorage.removeItem("userId");
        setLoading(false);
      }
      
      if (departmentMemberId && departmentMemberId !== "null" && departmentMemberId !== "undefined" && departmentMemberId.trim() !== "") {
        fetchDepartmentMemberData(departmentMemberId);
      } else if (departmentMemberId) {
        // Clear invalid departmentMemberId
        localStorage.removeItem("departmentMemberId");
        setLoading(false);
      }

      if (superadminId && superadminId !== "null" && superadminId !== "undefined" && superadminId.trim() !== "") {
        fetchSuperadminData(superadminId);
      } else if (superadminId) {
        // Clear invalid superadminId
        localStorage.removeItem("superadminId");
        setLoading(false);
      }
      
      // If no valid IDs found, set loading to false
      if ((!userId || userId === "null" || userId === "undefined" || userId.trim() === "") && 
          (!departmentMemberId || departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId.trim() === "") &&
          (!superadminId || superadminId === "null" || superadminId === "undefined" || superadminId.trim() === "") &&
          (!backupUserIdCookie || backupUserIdCookie === "null" || backupUserIdCookie === "undefined" || backupUserIdCookie.trim() === "")) {
        setLoading(false);
      }
    };

    // Add a small delay to allow Google OAuth callback to set localStorage and cookies
    const timeoutId = setTimeout(initializeAuth, 200);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchUserData = async (userId) => {
    // Validate userId before making API call
    if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
      console.warn("Invalid userId detected, clearing localStorage");
      localStorage.removeItem("userId");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.warn("User not found or API error, clearing localStorage");
        localStorage.removeItem("userId");
        // Set loading to false even on error
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle database connection errors gracefully
      if (error.message.includes("Failed to fetch") || error.message.includes("500")) {
        console.warn("Database connection issue detected. Please check MONGOURL environment variable.");
        setDatabaseConnectionError(true);
        // Don't clear localStorage on connection errors, just set loading to false
      } else {
        localStorage.removeItem("userId");
      }
      setLoading(false);
    }
  };

  const fetchDepartmentMemberData = async (departmentMemberId) => {
    // Validate departmentMemberId before making API call
    if (!departmentMemberId || departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId.trim() === "") {
      console.warn("Invalid departmentMemberId detected, clearing localStorage");
      localStorage.removeItem("departmentMemberId");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/department-members/${departmentMemberId}`);
      if (res.ok) {
        const memberData = await res.json();
        setDepartmentMember(memberData);
        setIsDepartmentAuthenticated(true);
      } else {
        console.warn("Department member not found or API error, clearing localStorage");
        localStorage.removeItem("departmentMemberId");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching department member data:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("500")) {
        console.warn("Database connection issue detected. Please check MONGOURL environment variable.");
        setDatabaseConnectionError(true);
      } else {
        localStorage.removeItem("departmentMemberId");
      }
      setLoading(false);
    }
  };

  const fetchSuperadminData = async (superadminId) => {
    // Validate superadminId before making API call
    if (!superadminId || superadminId === "null" || superadminId === "undefined" || superadminId.trim() === "") {
      console.warn("Invalid superadminId detected, clearing localStorage");
      localStorage.removeItem("superadminId");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/superadmin/${superadminId}`);
      if (res.ok) {
        const superadminData = await res.json();
        setSuperadmin(superadminData);
        setIsSuperadminAuthenticated(true);
      } else {
        console.warn("Superadmin not found or API error, clearing localStorage");
        localStorage.removeItem("superadminId");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching superadmin data:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("500")) {
        console.warn("Database connection issue detected. Please check MONGOURL environment variable.");
        setDatabaseConnectionError(true);
      } else {
        localStorage.removeItem("superadminId");
      }
      setLoading(false);
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
    setDepartmentMember(null);
    localStorage.setItem("userId", userData._id);
  };

  const loginUserFromGoogle = (userData) => {
    setUser(userData);
    setDepartmentMember(null);
    localStorage.setItem("userId", userData._id);
    console.log('User logged in from Google OAuth:', userData._id);
  };

  const loginDepartmentMember = (memberData) => {
    setDepartmentMember(memberData);
    setIsDepartmentAuthenticated(true);
    localStorage.setItem("departmentMemberId", memberData._id);
  };

  const loginSuperadmin = (superadminData) => {
    setSuperadmin(superadminData);
    setIsSuperadminAuthenticated(true);
    localStorage.setItem("superadminId", superadminData._id);
  };

  const logout = () => {
    // Set logout flag to prevent re-authentication
    setIsLoggingOut(true);
    
    // Clear all state
    setUser(null);
    setDepartmentMember(null);
    setSuperadmin(null);
    setIsDepartmentAuthenticated(false);
    setIsSuperadminAuthenticated(false);
    setLoading(false);
    
    // Clear all localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("departmentMemberId");
    localStorage.removeItem("superadminId");
    
    // Clear all cookies
    if (typeof document !== 'undefined') {
      // Clear auth-token cookie
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear user-session cookie
      document.cookie = 'user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear backup userId cookie
      document.cookie = 'google-auth-user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    console.log('Logout completed - cleared all authentication data');
    
    // Reset logout flag after a delay
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 1000);
  };

  const clearInvalidData = () => {
    const userId = localStorage.getItem("userId");
    const departmentMemberId = localStorage.getItem("departmentMemberId");
    const superadminId = localStorage.getItem("superadminId");
    
    if (userId === "null" || userId === "undefined" || userId === "") {
      localStorage.removeItem("userId");
    }
    
    if (departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId === "") {
      localStorage.removeItem("departmentMemberId");
    }

    if (superadminId === "null" || superadminId === "undefined" || superadminId === "") {
      localStorage.removeItem("superadminId");
    }
    
    setLoading(false);
  };

  // Computed values
  const isAuthenticated = !!user || !!departmentMember || !!superadmin;
  const currentUser = user || departmentMember || superadmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        departmentMember,
        superadmin,
        isAuthenticated,
        isDepartmentAuthenticated,
        isSuperadminAuthenticated,
        loading,
        databaseConnectionError,
        currentUser,
        loginUser,
        loginUserFromGoogle,
        loginDepartmentMember,
        loginSuperadmin,
        logout,
        clearInvalidData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};