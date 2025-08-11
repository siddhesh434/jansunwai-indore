"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [departmentMember, setDepartmentMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [databaseConnectionError, setDatabaseConnectionError] = useState(false);

  useEffect(() => {
    // Clean up any invalid localStorage data first
    const cleanupInvalidData = () => {
      const userId = localStorage.getItem("userId");
      const departmentMemberId = localStorage.getItem("departmentMemberId");
      
      if (userId === "null" || userId === "undefined" || userId === "") {
        localStorage.removeItem("userId");
      }
      
      if (departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId === "") {
        localStorage.removeItem("departmentMemberId");
      }
    };
    
    cleanupInvalidData();
    
    // Check for existing authentication on mount
    const userId = localStorage.getItem("userId");
    const departmentMemberId = localStorage.getItem("departmentMemberId");

    // Validate that the stored IDs are not null, undefined, or empty strings
    if (userId && userId !== "null" && userId !== "undefined" && userId.trim() !== "") {
      fetchUserData(userId);
    } else if (userId) {
      // Clear invalid userId
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
    
    // If no valid IDs found, set loading to false
    if ((!userId || userId === "null" || userId === "undefined" || userId.trim() === "") && 
        (!departmentMemberId || departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId.trim() === "")) {
      setLoading(false);
    }
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
      } else {
        console.warn("Department member not found or API error, clearing localStorage");
        localStorage.removeItem("departmentMemberId");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching department member data:", error);
      // Handle database connection errors gracefully
      if (error.message.includes("Failed to fetch") || error.message.includes("500")) {
        console.warn("Database connection issue detected. Please check MONGOURL environment variable.");
        setDatabaseConnectionError(true);
        // Don't clear localStorage on connection errors, just set loading to false
      } else {
        localStorage.removeItem("departmentMemberId");
      }
      setLoading(false);
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
    setDepartmentMember(null);
  };

  const loginDepartmentMember = (memberData) => {
    setDepartmentMember(memberData);
    setUser(null);
  };

  const logout = () => {
    setUser(null);
    setDepartmentMember(null);
    setDatabaseConnectionError(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("departmentMemberId");
  };

  const clearInvalidData = () => {
    const userId = localStorage.getItem("userId");
    const departmentMemberId = localStorage.getItem("departmentMemberId");
    
    if (userId === "null" || userId === "undefined" || userId === "") {
      localStorage.removeItem("userId");
    }
    
    if (departmentMemberId === "null" || departmentMemberId === "undefined" || departmentMemberId === "") {
      localStorage.removeItem("departmentMemberId");
    }
    
    setLoading(false);
  };

  const isAuthenticated = !!user || !!departmentMember;
  const currentUser = user || departmentMember;

  return (
    <AuthContext.Provider
      value={{
        user,
        departmentMember,
        currentUser,
        isAuthenticated,
        loading,
        databaseConnectionError,
        loginUser,
        loginDepartmentMember,
        logout,
        clearInvalidData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
