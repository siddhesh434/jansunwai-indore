"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const translations = {
    en: {
      // Navbar translations
      citizenLogin: "Citizen Login",
      departmentLogin: "Department Login",

      // Hero section translations
      heroTitle: "Connecting Citizens",
      heroTitleHighlight: "With Government Departments",
      heroDescription:
        "Jansunwai Indore is a platform for citizens to raise concerns and get direct responses from government departments. Track your queries in real-time and ensure accountability.",

      // Login cards translations
      secureLoginOptions: "Secure Login Options",
      citizenLoginCard: "Citizen Login",
      citizenLoginDesc: "Raise and track your queries",
      departmentLoginCard: "Department Login",
      departmentLoginDesc: "Respond to citizen queries",

      // Features section translations
      howItWorks: "How It Works",
      featuresDescription:
        "Our platform streamlines communication between citizens and government departments for efficient issue resolution",
      raiseQueries: "Raise Queries",
      raiseQueriesDesc:
        "Citizens can easily submit queries with all necessary details",
      departmentResponse: "Department Response",
      departmentResponseDesc:
        "Departments receive notifications and can respond directly",
      trackProgress: "Track Progress",
      trackProgressDesc:
        "Real-time updates on query status from submission to resolution",
    },
    hi: {
      // Navbar translations
      citizenLogin: "नागरिक लॉगिन",
      departmentLogin: "विभाग लॉगिन",

      // Hero section translations
      heroTitle: "नागरिकों को जोड़ना",
      heroTitleHighlight: "सरकारी विभागों के साथ",
      heroDescription:
        "जनसुनवाई इंदौर नागरिकों के लिए एक मंच है जहां वे चिंताएं उठा सकते हैं और सरकारी विभागों से सीधी प्रतिक्रिया प्राप्त कर सकते हैं। अपने प्रश्नों को वास्तविक समय में ट्रैक करें और जवाबदेही सुनिश्चित करें।",

      // Login cards translations
      secureLoginOptions: "सुरक्षित लॉगिन विकल्प",
      citizenLoginCard: "नागरिक लॉगिन",
      citizenLoginDesc: "अपने प्रश्न उठाएं और ट्रैक करें",
      departmentLoginCard: "विभाग लॉगिन",
      departmentLoginDesc: "नागरिकों के प्रश्नों का जवाब दें",

      // Features section translations
      howItWorks: "यह कैसे काम करता है",
      featuresDescription:
        "हमारा मंच नागरिकों और सरकारी विभागों के बीच संचार को सुव्यवस्थित करता है ताकि मुद्दों का कुशल समाधान हो सके",
      raiseQueries: "प्रश्न उठाएं",
      raiseQueriesDesc:
        "नागरिक आसानी से सभी आवश्यक विवरणों के साथ प्रश्न जमा कर सकते हैं",
      departmentResponse: "विभाग प्रतिक्रिया",
      departmentResponseDesc:
        "विभागों को सूचनाएं मिलती हैं और वे सीधे जवाब दे सकते हैं",
      trackProgress: "प्रगति ट्रैक करें",
      trackProgressDesc:
        "जमा करने से लेकर समाधान तक प्रश्न की स्थिति पर वास्तविक समय के अपडेट",
    },
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
