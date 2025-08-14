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
  const [superadmin, setSuperadmin] = useState(null);
  const [isDepartmentAuthenticated, setIsDepartmentAuthenticated] = useState(false);
  const [isSuperadminAuthenticated, setIsSuperadminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [databaseConnectionError, setDatabaseConnectionError] = useState(false);

  useEffect(() => {
    // Clean up any invalid localStorage data first
    const cleanupInvalidData = () => {
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
    };
    
    cleanupInvalidData();
    
    // Check for existing authentication on mount
    const userId = localStorage.getItem("userId");
    const departmentMemberId = localStorage.getItem("departmentMemberId");
    const superadminId = localStorage.getItem("superadminId");

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
        (!superadminId || superadminId === "null" || superadminId === "undefined" || superadminId.trim() === "")) {
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
    setUser(null);
    setDepartmentMember(null);
    setSuperadmin(null);
    setIsAuthenticated(false);
    setIsDepartmentAuthenticated(false);
    setIsSuperadminAuthenticated(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("departmentMemberId");
    localStorage.removeItem("superadminId");
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

  // Computed values
  const isAuthenticated = !!user || !!departmentMember || !!superadmin;
  const currentUser = user || departmentMember;

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
        loginUser,
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
