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

      // Footer translations
      governmentOfMP: "Government of Madhya Pradesh",
      allRightsReserved: "All rights reserved",

      // Login page translations
      login: "Login",
      email: "Email",
      password: "Password",
      loggingIn: "Logging in...",
      loginFailed: "Login failed",
      logout: "Logout",
      
      // New login/register translations
      jansunwaiIndore: "Jansunwai Indore",
      citizenPortal: "Citizen Portal",
      createNewId: "Create New ID",
      welcomeBack: "Welcome Back",
      or: "or",
      continueWithGoogle: "Continue with Google",
      dontHaveAccount: "Don't have an account?",
      createNewAccount: "Create New Account",
      fullName: "Full Name",
      username: "Username",
      addressOptional: "Address (Optional)",
      confirmPassword: "Confirm Password",
      createAccount: "Create Account",
      creatingAccount: "Creating Account...",
      alreadyHaveAccount: "Already have an account?",
      passwordsDoNotMatch: "Passwords do not match",
      emailRequired: "Email is required",
      registrationSuccess: "Account created successfully! You can now login.",
      registrationFailed: "Registration failed. Please try again.",
      googleLoginComingSoon: "Google login will be available soon!",
      databaseConnectionIssue: "Database connection issue detected. Login may not work properly.",
      
      // Error messages
      googleAuthFailed: "Google authentication failed. Please try again.",
      noAuthCode: "Authentication code not received. Please try again.",
      oauthInitFailed: "Failed to initialize OAuth. Please try again.",
      serverError: "Server error occurred. Please try again later.",
      unknownError: "An unknown error occurred. Please try again.",

      // Department Login translations
      departmentLoginTitle: "Department Login",
      departmentLoginSubtitle: "Sign in to your department account",
      emailAddress: "Email Address",
      enterDepartmentEmail: "Enter your department email",
      enterPassword: "Enter your password",
      signingIn: "Signing in...",
      signIn: "Sign In",
      needAccess: "Need access? Contact your department administrator",
      networkError: "Network error. Please try again.",

      // Dashboard translations
      queryDashboard: "Query Dashboard",
      signOut: "Sign out",
      newQuery: "New Query",
      searchQueries: "Search queries...",
      allStatus: "All Status",
      open: "Open",
      inProgress: "In Progress",
      resolved: "Resolved",
      queriesCount: "queries",
      noQueriesYet: "No queries yet",
      noMatchingQueries: "No matching queries",
      createFirstQuery: "Create your first query to get started",
      tryAdjustingSearch: "Try adjusting your search",
      loadingDashboard: "Loading dashboard...",
      selectQuery: "Select a query",
      
      // About Us translations
      aboutUs: "About Jansunwai Indore",
      aboutUsDescription: "Discover how our AI-powered system revolutionizes municipal complaint management for the citizens of Indore.",
      learnMore: "Learn More",
      selectQueryDesc:
        "Choose a query from the sidebar to view and manage its threads.",
      noRepliesYet: "No replies yet",
      startConversation:
        "Start the conversation by adding your first message below.",
      typeMessage: "Type your message here...",
      created: "Created:",
      replies: "replies",

      // Department Dashboard translations
      departmentDashboard: "Department Dashboard",
      loadingDepartmentDashboard: "Loading department dashboard...",
      searchQueriesPlaceholder: "Search queries...",
      noQueriesFound: "No queries found",
      tryAdjustingFilters: "Try adjusting your filters",
      submittedBy: "Submitted by:",
      unknownUser: "Unknown User",
      noRepliesYetDept: "No replies yet",
      beFirstToRespond: "Be the first to respond to this query.",
      typeResponse: "Type your response here...",
      departmentResponseLabel: "Department Response",
      user: "User",

      // Query form translations
      createNewQuery: "Create New Query",
      createNewQueryDesc:
        "Describe your complaint and our system will automatically categorize it",
      detailsSufficient: "Details Sufficient",
      moreDetailsNeeded: "More Details Needed",
      missingDetails: "Missing Details:",
      suggestions: "Suggestions:",
      detailValidationTip: "Providing basic details like location and clear issue description is sufficient for submission. Additional details help departments resolve your complaint faster.",
      yourComplaint: "Your Complaint",
      complaintPlaceholder:
        "Describe your complaint in detail. For example: 'The garbage truck has not come to our area for the past 7 days. The situation is getting very unhygienic.'",
      addressOptional: "Address (Optional)",
      addressPlaceholder: "Enter your address or location details",
      beDetailed:
        "Be as detailed as possible to help us route your complaint correctly",
      listening: "Listening...",
      analyzingComplaint: "Analyzing your complaint...",
      analysisComplete: "Analysis Complete",
      suggestedTitle: "Suggested Title:",
      assignedDepartment: "Assigned Department:",
      reasoning: "Reasoning:",
      createQuery: "Create Query",
      analyzing: "Analyzing...",
      cancel: "Cancel",

      // Voice input translations
      startVoiceInput: "Start voice input (speak your complaint)",
      stopRecording: "Stop recording",
      voiceInputNotSupported: "Voice input not supported in this browser",
      speechRecognitionNotSupported:
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
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

      // About Us translations
      aboutUs: "जनसुनवाई इंदौर के बारे में",
      aboutUsDescription: "जानें कि हमारी AI-संचालित प्रणाली इंदौर शहर के नागरिकों के लिए नगरपालिका शिकायत प्रबंधन को कैसे क्रांतिकारी बनाती है।",
      learnMore: "और जानें",

      // Footer translations
      governmentOfMP: "मध्य प्रदेश सरकार",
      allRightsReserved: "सर्वाधिकार सुरक्षित",

      // Login page translations
      login: "लॉगिन",
      email: "ईमेल",
      logout: "लॉगआउट",
      password: "पासवर्ड",
      loggingIn: "लॉगिन हो रहा है...",
      loginFailed: "लॉगिन विफल",
      
      // New login/register translations
      jansunwaiIndore: "जनसुनवाई इंदौर",
      citizenPortal: "नागरिक पोर्टल",
      createNewId: "नया आईडी बनाएं",
      welcomeBack: "वापसी पर स्वागत है",
      or: "या",
      continueWithGoogle: "Google के साथ जारी रखें",
      dontHaveAccount: "खाता नहीं है?",
      createNewAccount: "नया खाता बनाएं",
      fullName: "पूरा नाम",
      username: "उपयोगकर्ता नाम",
      addressOptional: "पता (वैकल्पिक)",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      createAccount: "खाता बनाएं",
      creatingAccount: "खाता बन रहा है...",
      alreadyHaveAccount: "पहले से ही खाता है?",
      passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते",
      emailRequired: "ईमेल आवश्यक है",
      registrationSuccess: "खाता सफलतापूर्वक बनाया गया! अब आप लॉगिन कर सकते हैं।",
      registrationFailed: "पंजीकरण विफल। कृपया पुनः प्रयास करें।",
      googleLoginComingSoon: "Google लॉगिन जल्द ही उपलब्ध होगा!",
      databaseConnectionIssue: "डेटाबेस कनेक्शन समस्या का पता चला। लॉगिन ठीक से काम नहीं कर सकता।",
      
      // Error messages
      googleAuthFailed: "Google प्रमाणीकरण विफल। कृपया पुनः प्रयास करें।",
      noAuthCode: "प्रमाणीकरण कोड प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।",
      oauthInitFailed: "OAuth प्रारंभ करने में विफल। कृपया पुनः प्रयास करें।",
      serverError: "सर्वर त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।",
      unknownError: "एक अज्ञात त्रुटि हुई। कृपया पुनः प्रयास करें।",

      // Department Login translations
      departmentLoginTitle: "विभाग लॉगिन",
      departmentLoginSubtitle: "अपने विभाग के खाते में साइन इन करें",
      emailAddress: "ईमेल पता",
      enterDepartmentEmail: "अपना विभाग ईमेल दर्ज करें",
      enterPassword: "अपना पासवर्ड दर्ज करें",
      signingIn: "साइन इन हो रहा है...",
      signIn: "साइन इन करें",
      needAccess: "पहुंच की आवश्यकता है? अपने विभाग के प्रशासक से संपर्क करें",
      networkError: "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।",

      // Dashboard translations
      queryDashboard: "प्रश्न डैशबोर्ड",
      signOut: "साइन आउट",
      newQuery: "नया प्रश्न",
      searchQueries: "प्रश्न खोजें...",
      allStatus: "सभी स्थिति",
      open: "खुला",
      inProgress: "प्रगति में",
      resolved: "समाधान",
      queriesCount: "प्रश्न",
      noQueriesYet: "अभी तक कोई प्रश्न नहीं",
      noMatchingQueries: "कोई मिलान वाले प्रश्न नहीं",
      createFirstQuery: "शुरू करने के लिए अपना पहला प्रश्न बनाएं",
      tryAdjustingSearch: "अपनी खोज को समायोजित करने का प्रयास करें",
      loadingDashboard: "डैशबोर्ड लोड हो रहा है...",
      selectQuery: "एक प्रश्न चुनें",
      selectQueryDesc:
        "थ्रेड देखने और प्रबंधित करने के लिए साइडबार से एक प्रश्न चुनें।",
      noRepliesYet: "अभी तक कोई जवाब नहीं",
      startConversation: "नीचे अपना पहला संदेश जोड़कर बातचीत शुरू करें।",
      typeMessage: "यहां अपना संदेश टाइप करें...",
      created: "बनाया गया:",
      replies: "जवाब",

      // Department Dashboard translations
      departmentDashboard: "विभाग डैशबोर्ड",
      loadingDepartmentDashboard: "विभाग डैशबोर्ड लोड हो रहा है...",
      searchQueriesPlaceholder: "प्रश्न खोजें...",
      noQueriesFound: "कोई प्रश्न नहीं मिला",
      tryAdjustingFilters: "फ़िल्टर को समायोजित करने का प्रयास करें",
      submittedBy: "द्वारा जमा किया गया:",
      unknownUser: "अज्ञात उपयोगकर्ता",
      noRepliesYetDept: "अभी तक कोई जवाब नहीं",
      beFirstToRespond: "इस प्रश्न का जवाब देने वाले पहले बनें।",
      typeResponse: "यहां अपना जवाब टाइप करें...",
      departmentResponseLabel: "विभाग प्रतिक्रिया",
      user: "उपयोगकर्ता",

      // Query form translations
      createNewQuery: "नया प्रश्न बनाएं",
      createNewQueryDesc:
        "अपनी शिकायत का वर्णन करें और हमारी प्रणाली इसे स्वचालित रूप से वर्गीकृत करेगी",
      detailsSufficient: "विवरण पर्याप्त",
      moreDetailsNeeded: "अधिक विवरण आवश्यक",
      missingDetails: "गुम विवरण:",
      suggestions: "सुझाव:",
      detailValidationTip: "स्थान और स्पष्ट समस्या का विवरण जैसे बुनियादी विवरण प्रदान करना प्रस्तुत करने के लिए पर्याप्त है। अतिरिक्त विवरण विभागों को आपकी शिकायत को तेजी से हल करने में मदद करते हैं।",
      yourComplaint: "आपकी शिकायत",
      complaintPlaceholder:
        "अपनी शिकायत का विस्तार से वर्णन करें। उदाहरण के लिए: 'पिछले 7 दिनों से हमारे क्षेत्र में कचरा ट्रक नहीं आया है। स्थिति बहुत अस्वच्छ हो रही है।'",
      addressOptional: "पता (वैकल्पिक)",
      addressPlaceholder: "अपना पता या स्थान विवरण दर्ज करें",
      beDetailed:
        "हमारी शिकायत को सही तरीके से रूट करने में मदद करने के लिए जितना संभव हो उतना विस्तृत रहें",
      listening: "सुन रहा है...",
      analyzingComplaint: "आपकी शिकायत का विश्लेषण हो रहा है...",
      analysisComplete: "विश्लेषण पूरा",
      suggestedTitle: "सुझाया गया शीर्षक:",
      assignedDepartment: "आवंटित विभाग:",
      reasoning: "तर्क:",
      createQuery: "प्रश्न बनाएं",
      analyzing: "विश्लेषण हो रहा है...",
      cancel: "रद्द करें",

      // Voice input translations
      startVoiceInput: "वॉइस इनपुट शुरू करें (अपनी शिकायत बोलें)",
      stopRecording: "रिकॉर्डिंग रोकें",
      voiceInputNotSupported: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है",
      speechRecognitionNotSupported:
        "आपके ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।",
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
