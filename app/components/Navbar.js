"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Globe, User, LogOut } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, logout, databaseConnectionError, clearInvalidData } = useAuth();

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "hi" : "en");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* Database Connection Error Banner */}
      {databaseConnectionError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-800 text-sm font-medium">
                  Database connection issue detected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => clearInvalidData()}
                  className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Clear Data
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Retry
                </button>
              </div>
            </div>
            <p className="text-red-700 text-xs">
              To fix this issue, create a <code className="bg-red-100 px-1 rounded">.env.local</code> file in your project root with <code className="bg-red-100 px-1 rounded">MONGOURL=your_mongodb_connection_string</code>
            </p>
          </div>
        </div>
      )}
      
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">
              Jansunwai Indore
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={language === "en" ? "हिंदी में बदलें" : "Switch to English"}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">
                {language === "en" ? "हिंदी" : "English"}
              </span>
            </button>

            {isAuthenticated ? (
              // Show user info and sign out when authenticated
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">
                    {currentUser?.name || currentUser?.username || "User"}
                  </span>
                  {currentUser?.department && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({currentUser.department.departmentName})
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              // Show login buttons when not authenticated
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {t("citizenLogin")}
                </button>
                <button
                  onClick={() => router.push("/department/login")}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("departmentLogin")}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
