"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Globe, User, LogOut, Menu, X, Building2, Shield } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const { user, departmentMember, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section - Left */}
            <div className="flex items-center">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => router.push("/")}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Jansunwai Indore
                </span>
              </div>
            </div>

            

            {/* Right Section - Language + Auth */}
            <div className="flex items-center space-x-3">
       {/* Desktop Navigation - Center */}
       <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {language === "hi" ? "होम" : "Home"}
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {language === "hi" ? "हमारे बारे में" : "About Us"}
              </button>
              {/* Authentication Section */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("logout") || "Logout"}
                    </span>
                  </button>
                </div>
              ) : departmentMember ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-700 max-w-32 truncate">
                        {departmentMember.name || departmentMember.email}
                      </span>
                      {departmentMember.department && (
                        <span className="text-xs text-blue-600 max-w-32 truncate">
                          {departmentMember.department.departmentName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("logout") || "Logout"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <span className="hidden sm:inline">
                      {t("citizenLogin") || "Citizen Login"}
                    </span>
                    <span className="sm:hidden">Citizen</span>
                  </button>
                  <button
                    onClick={() => router.push("/department/login")}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <span className="hidden sm:inline">
                      {t("departmentLogin") || "Department Login"}
                    </span>
                    <span className="sm:hidden">Dept</span>
                  </button>
                  <button
                    onClick={() => router.push("/superadmin/login")}
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <span className="hidden sm:inline">Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </button>
                </div>
              )}
            </div>       
              {/* Language Switcher */}
              <button
                onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === "en" ? "हिंदी" : "English"}
                </span>
              </button>

          

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-4 py-3 space-y-1">
                {/* Navigation Links */}
                <button
                  onClick={() => {
                    router.push("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  {language === "hi" ? "होम" : "Home"}
                </button>
                <button
                  onClick={() => {
                    router.push("/about");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  {language === "hi" ? "हमारे बारे में" : "About Us"}
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Authentication Section for Mobile */}
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {user.name || user.email}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("logout") || "Logout"}</span>
                    </button>
                  </div>
                ) : departmentMember ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-blue-700 truncate">
                          {departmentMember.name || departmentMember.email}
                        </span>
                        {departmentMember.department && (
                          <span className="text-xs text-blue-600 truncate">
                            {departmentMember.department.departmentName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("logout") || "Logout"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        router.push("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>{t("citizenLogin") || "Citizen Login"}</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/department/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{t("departmentLogin") || "Department Login"}</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/superadmin/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm transition-all duration-200"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Login</span>
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}