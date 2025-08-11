"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Globe, User, LogOut, Menu, X, Building2 } from "lucide-react";
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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Name - Now clickable to go home */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Jansunwai Indore
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <button
                onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "हिंदी" : "English"}</span>
              </button>

              {/* About Us Button - Left-aligned after language switcher */}
              <button
                onClick={() => router.push("/about")}
                className="hidden md:block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {language === "hi" ? "हमारे बारे में" : "About Us"}
              </button>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("logout") || "Logout"}
                    </span>
                  </button>
                </div>
              ) : departmentMember ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-100">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      {departmentMember.name || departmentMember.email}
                    </span>
                    {departmentMember.department && (
                      <span className="text-xs text-blue-600">
                        ({departmentMember.department.departmentName})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("logout") || "Logout"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    {t("citizenLogin") || "Citizen Login"}
                  </button>
                  <button
                    onClick={() => router.push("/department/login")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t("departmentLogin") || "Department Login"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-6 py-4 space-y-3">
                <button
                  onClick={() => {
                    router.push("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {t("home") || "Home"}
                </button>
                <button
                  onClick={() => {
                    router.push("/about");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {language === "hi" ? "हमारे बारे में" : "About Us"}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
