"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Send,
  MessageSquare,
  Clock,
  ChevronRight,
  Building2,
  Search,
  Filter,
  X,
  Mic,
  MicOff,
  MapPin,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  CheckCircle2,
  Circle,
  User,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import MapAddressSelector from "./MapAddressSelector"; // Import the new component
import AttachmentAI from "./components/AttachmentAI";
import { clampWords } from "../../lib/ai/wordClamp";

export default function Dashboard() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({
    query: "",
    address: "",
  });
  const newQueryRef = useRef({ query: "", address: "" });
  const [queryAnalysis, setQueryAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [newThread, setNewThread] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachmentAnalyses, setAttachmentAnalyses] = useState([]);

  // Voice-to-text states
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Map visibility state
  const [showMap, setShowMap] = useState(false);

  // Mobile states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Don't run if still loading or if user object is incomplete
    if (!isAuthenticated || !user || !user._id) {
      if (!isAuthenticated) {
        router.push("/login");
      }
      return;
    }
    
    // Use user._id as that's the standard MongoDB document ID
    const userId = user._id;
    
    // Validate that userId exists and is valid
    if (!userId || userId === "undefined" || userId === "null" || userId === "") {
      router.push("/login");
      return;
    }
    
    fetchUserData(userId);
    fetchDepartments();
  }, [isAuthenticated, user?._id]); // Only depend on user._id, not the entire user object

  // Keep a ref of the latest newQuery to avoid stale closures
  useEffect(() => {
    newQueryRef.current = newQuery;
  }, [newQuery]);

  // Re-analyze query when address changes
  useEffect(() => {
    if (newQuery.query.trim() && newQuery.address && queryAnalysis) {
      // Only re-analyze if we have both query and address, and there's existing analysis
      analyzeQuery(newQuery.query, newQuery.address);
    }
  }, [newQuery.address]);

  // Initialize voice-to-text
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      setIsSupported(true);
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-IN";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        const { query, address } = newQueryRef.current || {};
        if (query && query.trim()) {
          analyzeQuery(query, address);
        }
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setNewQuery((prev) => ({
            ...prev,
            query: prev.query + (prev.query ? " " : "") + finalTranscript,
          }));
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Add Leaflet CSS dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if Leaflet CSS is already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    }
  }, []); // Load once on component mount

  // Close sidebar when selecting query on mobile
  const handleQuerySelect = (queryId) => {
    fetchQueryThreads(queryId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar when creating new query on mobile
  const handleNewQuery = () => {
    setShowNewQueryForm(true);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const fetchUserData = async (userId) => {
    // Validate userId before making API call
    if (!userId || userId === "undefined" || userId === "null" || userId === "") {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const userData = await res.json();
      // setUser(userData); // This line is removed as per the new_code
      const userQueries = Array.isArray(userData.queries) ? userData.queries : [];
      // Sort by createdAt desc for better UX
      userQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQueries(userQueries);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to load departments");
      const data = await res.json();
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Voice-to-text functions
  const toggleVoiceInput = () => {
    if (!isSupported) {
      alert("Speech recognition not supported");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const stopVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const analyzeQuery = async (query, address) => {
    if (!query.trim()) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch("/api/query-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, address }),
      });

      const data = await res.json();
      
      if (data.success) {
        setQueryAnalysis(data.analysis);
      } else {
        console.error("Query analysis failed:", data.error);
        // Fallback: create a basic analysis
        setQueryAnalysis({
          title: query.substring(0, 60) + (query.length > 60 ? "..." : ""),
          departmentId: departments[0]?._id || "",
          departmentName: departments[0]?.departmentName || "Municipal Services",
          reasoning: "Auto-generated due to analysis failure",
          originalQuery: query,
          address: address || "",
          detailsSufficient: true,
          missingDetails: [],
          suggestions: ""
        });
      }
    } catch (error) {
      console.error("Error analyzing query:", error);
      // Fallback: create a basic analysis
              setQueryAnalysis({
          title: query.substring(0, 60) + (query.length > 60 ? "..." : ""),
          departmentId: departments[0]?._id || "",
          departmentName: departments[0]?.departmentName || "Municipal Services",
          reasoning: "Auto-generated due to analysis error",
          originalQuery: query,
          address: address || "",
          detailsSufficient: true,
          missingDetails: [],
          suggestions: ""
        });
    } finally {
      setAnalyzing(false);
    }
  };


  const fetchQueryThreads = async (queryId) => {
    try {
      const query = (queries || []).find(q => q._id === queryId);
      if (query) {
        setSelectedQuery(query);
        setThreads(query.objects || []);
        setShowNewQueryForm(false);
      }
    } catch (error) {
      console.error("Error fetching query threads:", error);
    }
  };

  const handleCreateQuery = async (e) => {
    e?.preventDefault?.();
    if (!queryAnalysis || !newQuery.query.trim()) return;

    // Prevent query submission if details are insufficient
    if (queryAnalysis.detailsSufficient === false) {
      alert("Your complaint cannot be submitted because it lacks very basic details or is inappropriate. Please provide a specific location/address and describe the issue clearly so departments can take action.");
      return;
    }

    try {
      const deptId = queryAnalysis?.departmentId || departments[0]?._id;
      if (!deptId) {
        alert("No departments available. Please try again later.");
        return;
      }
      
      const formData = new FormData();
      formData.append("title", queryAnalysis.title || "");
      
      let baseDesc = newQuery.query || "";
      
      // Handle attachment analyses with proper formatting
      if (attachmentAnalyses.length > 0) {
        const attachmentSections = attachmentAnalyses
          .map((analysis, idx) => {
            if (!analysis?.analysis) return null;
            
            const lines = [];
            const fileName = analysis.file?.name || analysis.filename || `attachment-${idx + 1}`;
            lines.push(`📎 File ${idx + 1}: ${fileName}`);
            
            if (analysis.analysis.description) {
              lines.push(`   Description: ${clampWords(analysis.analysis.description, 50, 60)}`);
            }
            
            if (analysis.analysis.summary) {
              lines.push(`   Municipal Summary: ${clampWords(analysis.analysis.summary, 50, 60)}`);
            }
            
            return lines.join('\n');
          })
          .filter(Boolean);
        
        if (attachmentSections.length > 0) {
          const attachmentSection = attachmentSections.join('\n\n');
          baseDesc += `\n\n=== Attachment AI Summaries ===\n\n${attachmentSection}`;
        }
        
        // Also send structured data for admin
        const structuredAnalyses = attachmentAnalyses
          .map((analysis) => {
            if (!analysis?.analysis) return null;
            return {
              filename: analysis.filename || analysis.file?.name,
              originalName: analysis.file?.name || analysis.filename,
              mimetype: analysis.file?.type,
              description: analysis.analysis.description ? clampWords(analysis.analysis.description, 50, 60) : null,
              summary: analysis.analysis.summary ? clampWords(analysis.analysis.summary, 50, 60) : null,
              metadata: analysis.analysis.metadata || null,
            };
          })
          .filter(Boolean);
        
        if (structuredAnalyses.length > 0) {
          formData.append("attachmentAnalyses", JSON.stringify(structuredAnalyses));
        }
      }
      
      formData.append("description", baseDesc);
      formData.append("address", newQuery.address || "");
      formData.append("author", user?._id || "");
      formData.append("department", deptId);
      
      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log("Submitting query with description:", baseDesc); // Debug log

      const res = await fetch("/api/queries", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create query: ${errorText}`);
      }
      
      const created = await res.json();

      stopVoiceInput();
      setQueries([created, ...(queries || [])]);
      setNewQuery({ query: "", address: "" });
      setQueryAnalysis(null);
      setSelectedFiles([]);
      setAttachmentAnalyses([]);
      setShowNewQueryForm(false);
      setShowMap(false);
      setSelectedQuery(created);
      setThreads([]);
      
      console.log("Query created successfully:", created); // Debug log
    } catch (err) {
      console.error("Error creating query:", err);
      alert(`Unable to submit query: ${err.message}. Please try again.`);
    }
  };

  const handleAddThread = (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    const newThreadData = {
      message: newThread,
      authorId: user?._id || "",
      authorType: "User",
      timestamp: new Date(),
    };

    const updatedThreads = [...threads, newThreadData];
    setThreads(updatedThreads);
    setNewThread("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 border-red-200";
      case "in_progress":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Status Stepper (Flipkart-like delivery progress)
  const statusSteps = [
    { key: "open", label: "Opened" },
    { key: "in_progress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
  ];

  const getCurrentStepIndex = (status) => {
    const idx = statusSteps.findIndex(
      (s) => s.key === (status || "open").toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  };

  // Filter queries based on search and status
  const filteredQueries = (queries || []).filter((query) => {
    // Ensure query and its properties exist before processing
    if (!query || typeof query !== 'object') return false;
    
    const matchesSearch =
      (query.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (query.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || query.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col overflow-hidden relative">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-blue-200 p-4 flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <button
            onClick={handleNewQuery}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Queries List */}
        <div className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-1/3 lg:w-1/4 xl:w-1/3'
        } bg-white/60 backdrop-blur-sm border-r border-blue-200 flex flex-col shadow-sm`}>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="p-4 border-b border-blue-200 flex items-center justify-between md:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Queries</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-blue-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* New Query Button - Desktop */}
          {!isMobile && (
            <div className="p-4 border-b border-blue-200">
              <button
                onClick={() => setShowNewQueryForm(true)}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Query</span>
              </button>
            </div>
          )}

          {/* Search and Filter */}
          <div className="p-4 border-b border-blue-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Query Count */}
          <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-200">
            <p className="text-sm text-blue-600 font-medium">
              {filteredQueries.length} of {queries?.length || 0} queries
            </p>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredQueries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {!queries || queries.length === 0 ? "No queries yet" : "No matching queries"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!queries || queries.length === 0 ? "Create your first query" : "Try adjusting your search"}
                </p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query._id || `query-${Math.random()}`}
                  onClick={() => query._id && handleQuerySelect(query._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md border backdrop-blur-sm ${
                    selectedQuery?._id === query._id
                      ? "bg-white border-blue-300 shadow-md ring-2 ring-blue-200"
                      : "border-transparent hover:border-blue-200 bg-white/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                        {query.title || "Untitled Query"}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                        {query.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            query.status?.toLowerCase() || "open"
                          )}`}
                        >
                          {query.status?.replace("_", " ").toUpperCase() || "OPEN"}
                        </div>
                        <span className="text-xs text-blue-500 font-medium">
                          {query.objects?.length || 0} replies
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-500 shrink-0 ml-2 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Query Details and Threads */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm min-w-0">
          {showNewQueryForm ? (
            /* New Query Form */
            <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
              <div className="p-4 md:p-6 border-b border-blue-200 bg-white/60 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Create New Query
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Describe your complaint and we'll route it to the right department
                    </p>
                  </div>
                  {isMobile && (
                    <button
                      onClick={() => setShowNewQueryForm(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 ml-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-2xl space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Complaint
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Describe your issue in detail..."
                        value={newQuery.query}
                        onChange={(e) =>
                          setNewQuery({ ...newQuery, query: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (newQuery.query.trim()) {
                              analyzeQuery(newQuery.query, newQuery.address);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (newQuery.query.trim()) {
                            analyzeQuery(newQuery.query, newQuery.address);
                          }
                        }}
                        className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm text-sm"
                      />
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        disabled={!isSupported}
                        className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 ${
                          isListening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        } ${
                          !isSupported ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={
                          isListening
                            ? "Stop Recording"
                            : isSupported
                            ? "Start Voice Input"
                            : "Voice Input Not Supported"
                        }
                      >
                        {isListening ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                      <p className="text-xs text-gray-500">Be as detailed as possible</p>
                      {isListening && (
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Listening...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address (Optional)
                    </label>
                    <MapAddressSelector
                      value={newQuery.address}
                      onChange={(value) => setNewQuery({ ...newQuery, address: value })}
                      placeholder="Search or click on map to select address..."
                      showMap={showMap}
                      onToggleMap={() => setShowMap(!showMap)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach files (images, videos, documents)
                    </label>
                    <AttachmentAI
                      onAnalyzed={(items) => {
                        console.log("Attachment analyses received:", items); // Debug log
                        setAttachmentAnalyses(items);
                        setSelectedFiles(items.map((i) => i.file).filter(Boolean));
                      }}
                    />
                  </div>

                  {/* Analysis Results */}
                  {analyzing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-blue-700 font-medium">
                          Analyzing your complaint...
                        </span>
                      </div>
                    </div>
                  )}

                  {queryAnalysis && !analyzing && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-green-800 font-medium">
                          Analysis Complete
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Suggested Title:
                          </span>
                          <p className="text-sm text-gray-900 font-medium break-words">
                            {queryAnalysis.title}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Assigned Department:
                          </span>
                          <p className="text-sm text-gray-900 font-medium">
                            {queryAnalysis.departmentName}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Reasoning:
                          </span>
                          <p className="text-sm text-gray-600">
                            {queryAnalysis.reasoning}
                          </p>
                        </div>

                        {/* Detail Validation Section */}
                        <div className="border-t border-green-200 pt-3">
                          <div className="flex items-center space-x-2 mb-2">
                            {queryAnalysis.detailsSufficient ? (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <span className={`text-sm font-medium ${queryAnalysis.detailsSufficient ? 'text-green-800' : 'text-yellow-800'}`}>
                              {queryAnalysis.detailsSufficient ? t('detailsSufficient') || 'Details Sufficient' : t('moreDetailsNeeded') || 'More Details Needed'}
                            </span>
                          </div>
                          
                          {!queryAnalysis.detailsSufficient && (
                            <div className="space-y-2">
                              {queryAnalysis.missingDetails && queryAnalysis.missingDetails.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-yellow-700">{t('missingDetails') || 'Missing Details:'}</span>
                                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                    {queryAnalysis.missingDetails.map((detail, index) => (
                                      <li key={index} className="flex items-start space-x-2">
                                        <span className="text-yellow-600 mt-1">•</span>
                                        <span>{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {queryAnalysis.suggestions && (
                                <div>
                                  <span className="text-sm font-medium text-yellow-700">{t('suggestions') || 'Suggestions:'}</span>
                                  <p className="text-sm text-yellow-700 mt-1 bg-yellow-100 p-2 rounded border border-yellow-200">
                                    {queryAnalysis.suggestions}
                                  </p>
                                </div>
                              )}
                              
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Tip:</strong> {t('detailValidationTip') || 'Please provide specific details about location, time, and the exact issue to help departments respond effectively.'}
                                </p>
                              </div>
                              
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">
                                  <strong>⚠️ Query Submission Blocked:</strong> Your complaint cannot be submitted because it lacks very basic details or is inappropriate. Please provide a specific location/address and describe the issue clearly so departments can take action.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {newQuery.address && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Address:
                            </span>
                            <p className="text-sm text-gray-600 flex items-start">
                              <MapPin className="w-3 h-3 mr-1 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{newQuery.address}</span>
                            </p>
                          </div>
                        )}

                        {/* Show attachment summaries preview if available */}
                        {attachmentAnalyses.length > 0 && (
                          <div className="border-t border-green-200 pt-3">
                            <span className="text-sm font-medium text-gray-700">
                              Attachment Summaries ({attachmentAnalyses.length} files):
                            </span>
                            <div className="mt-2 space-y-2">
                              {attachmentAnalyses.map((analysis, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                                  <div className="font-medium text-gray-900 mb-1">
                                    📎 {analysis.file?.name || analysis.filename || `File ${idx + 1}`}
                                  </div>
                                  {analysis.analysis?.description && (
                                    <div className="text-gray-600 mb-1">
                                      <strong>Description:</strong> {clampWords(analysis.analysis.description, 30, 40)}
                                    </div>
                                  )}
                                  {analysis.analysis?.summary && (
                                    <div className="text-gray-600">
                                      <strong>Summary:</strong> {clampWords(analysis.analysis.summary, 30, 40)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleCreateQuery}
                      disabled={!queryAnalysis || !newQuery.query.trim() || queryAnalysis.detailsSufficient === false}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none text-center"
                    >
                      {analyzing ? "Analyzing..." : queryAnalysis?.detailsSufficient === false ? "Details Insufficient" : "Create Query"}
                    </button>
                    <button
                      onClick={() => {
                        stopVoiceInput();
                        setShowNewQueryForm(false);
                        setNewQuery({ query: "", address: "" });
                        setQueryAnalysis(null);
                        setSelectedFiles([]);
                        setAttachmentAnalyses([]);
                        setShowMap(false);
                      }}
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedQuery ? (
            /* Query Thread View */
            <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
              {/* Query Header with Stepper */}
              <div className="p-4 md:p-6 border-b border-blue-200 bg-white/60 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      {isMobile && (
                        <button
                          onClick={() => {
                            setSelectedQuery(null);
                            setThreads([]);
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 mr-2 md:hidden"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                        {selectedQuery?.title || "Select a query"}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 break-words whitespace-pre-wrap">
                      {selectedQuery?.description || "No description available"}
                    </p>
                    {selectedQuery?.address && (
                      <div className="flex items-start text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{selectedQuery?.address}</span>
                      </div>
                    )}

                    {selectedQuery?.attachments?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {selectedQuery?.attachments?.map((att, idx) => {
                            const isImage = (att.mimetype || "").startsWith("image/");
                            const isVideo = (att.mimetype || "").startsWith("video/");
                            return (
                              <div key={idx} className="border border-blue-200 rounded-lg overflow-hidden bg-white">
                                {isImage ? (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                    <img src={att.url} alt={att.originalName} className="w-full h-28 object-cover" />
                                    <div className="px-2 py-1 text-xs text-gray-700 truncate flex items-center">
                                      <ImageIcon className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">{att.originalName}</span>
                                    </div>
                                  </a>
                                ) : isVideo ? (
                                  <div className="w-full">
                                    <video src={att.url} controls className="w-full h-28 object-cover bg-black" />
                                    <a href={att.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs text-gray-700 truncate flex items-center">
                                      <VideoIcon className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">{att.originalName}</span>
                                    </a>
                                  </div>
                                ) : (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 p-2 text-xs text-gray-700 hover:bg-blue-50">
                                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span className="truncate" title={att.originalName}>{att.originalName}</span>
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getCurrentStepIndex(selectedQuery?.status);
                      const completed = idx <= currentIdx;
                      const isLast = idx === statusSteps.length - 1;
                      return (
                        <div key={step.key} className="flex-1 flex items-center min-w-0">
                          <div className={`flex items-center ${idx > 0 ? 'pl-2' : ''} min-w-0`}>
                            <div className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full border flex-shrink-0 ${completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                              {completed ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> : <Circle className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>
                            <span className={`ml-2 text-xs md:text-sm font-medium truncate ${completed ? 'text-green-700' : 'text-gray-500'}`}>{step.label}</span>
                          </div>
                          {!isLast && (
                            <div className={`flex-1 h-0.5 mx-2 min-w-4 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Updated {selectedQuery ? new Date(selectedQuery.updatedAt || selectedQuery.createdAt).toLocaleString() : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Threads Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Timeline-style Updates List */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white/50">
                  {threads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-16 h-16 text-blue-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No replies yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start a conversation about this query
                      </p>
                    </div>
                  ) : (
                    <div className="relative max-w-4xl">
                      <div className="absolute left-3 md:left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />
                      <div className="space-y-5">
                        {threads.map((thread, index) => {
                          const isAdmin = thread.authorType === "DepartmentMember";
                          return (
                            <div key={index} className="relative pl-10 md:pl-12">
                              <div className={`absolute left-1 md:left-1.5 top-2 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${isAdmin ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center`}>
                                {isAdmin ? <Building2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" /> : <User className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600" />}
                              </div>
                              <div className={`rounded-lg border ${isAdmin ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} p-4`}>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center space-x-2 min-w-0">
                                    <span className={`text-sm font-medium ${isAdmin ? 'text-green-800' : 'text-blue-800'} truncate`}>
                                      {isAdmin ? 'Department Update' : 'You'}
                                    </span>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {new Date(thread.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-2 text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                                  {thread.message}
                                </p>
                                {Array.isArray(thread.attachments) && thread.attachments.length > 0 && (
                                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {thread.attachments.map((att, i) => {
                                      const isImage = (att.mimetype || '').startsWith('image/');
                                      const isVideo = (att.mimetype || '').startsWith('video/');
                                      return (
                                        <div key={i} className="border border-blue-200 rounded-lg overflow-hidden bg-white">
                                          {isImage ? (
                                            <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                              <img src={att.url} alt={att.originalName} className="w-full h-24 object-cover" />
                                              <div className="px-2 py-1 text-xs text-gray-700 truncate flex items-center">
                                                <ImageIcon className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                                                <span className="truncate">{att.originalName}</span>
                                              </div>
                                            </a>
                                          ) : isVideo ? (
                                            <div className="w-full">
                                              <video src={att.url} controls className="w-full h-24 object-cover bg-black" />
                                              <a href={att.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs text-gray-700 truncate flex items-center">
                                                <VideoIcon className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                                                <span className="truncate">{att.originalName}</span>
                                              </a>
                                            </div>
                                          ) : (
                                            <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 p-2 text-xs text-gray-700 hover:bg-blue-50">
                                              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                              <span className="truncate" title={att.originalName}>{att.originalName}</span>
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thread Input */}
                <div className="border-t border-blue-200 p-4 md:p-6 bg-white/60 backdrop-blur-sm flex-shrink-0">
                  <div className="max-w-4xl">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your message..."
                          value={newThread}
                          onChange={(e) => setNewThread(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddThread(e);
                            }
                          }}
                          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm text-sm"
                          rows="3"
                        />
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-lg transition-all duration-200 shrink-0 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none self-start sm:self-stretch"
                      >
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a query to view details
                </h3>
                <p className="text-gray-600 text-center">
                  Choose a query from the list to see its details and replies
                </p>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    View Queries
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay for Actions */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="flex items-center space-x-3 bg-white p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}