"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function NavBar() {
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
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
    </nav>
  );
}
