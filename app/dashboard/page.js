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
  ChevronDown,
  Settings,
  Bell,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  FileUp,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import MapAddressSelector from "./MapAddressSelector";
import AttachmentAI from "./components/AttachmentAI";
import { clampWords } from "../../lib/ai/wordClamp";

// Status configuration
const STATUS_CONFIG = {
  open: {
    label: "Open",
    color: "red",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
    dotClass: "bg-red-500",
  },
  in_progress: {
    label: "In Progress",
    color: "amber",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotClass: "bg-amber-500",
  },
  resolved: {
    label: "Resolved",
    color: "green",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
    dotClass: "bg-green-500",
  },
};

const STATUS_STEPS = [
  { key: "open", label: "Opened", icon: Circle },
  { key: "in_progress", label: "In Progress", icon: Loader2 },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
];

// Loading component
const LoadingSpinner = ({ size = "md", text = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`animate-spin rounded-full border-2 border-blue-500 border-t-transparent ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-gray-600 font-medium">{text}</span>}
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.open;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </div>
  );
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);

// Query card component
const QueryCard = ({ query, isSelected, onClick }) => {
  const config = STATUS_CONFIG[query.status?.toLowerCase()] || STATUS_CONFIG.open;
  
  return (
    <div
      onClick={() => onClick(query._id)}
      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? "bg-white border-blue-200 shadow-md ring-2 ring-blue-100"
          : "bg-white/70 border-gray-200 hover:bg-white hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">
            {query.title || "Untitled Query"}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
            {query.description || "No description available"}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0 ml-2 transition-colors" />
      </div>
      
      <div className="flex items-center justify-between">
        <StatusBadge status={query.status} />
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {query.objects?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(query.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {query.attachments?.length > 0 && (
        <div className="mt-2 flex items-center text-xs text-blue-600">
          <Paperclip className="w-3 h-3 mr-1" />
          {query.attachments.length} file{query.attachments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// Progress stepper component
const ProgressStepper = ({ currentStatus }) => {
  const getCurrentStepIndex = (status) => {
    const idx = STATUS_STEPS.findIndex(s => s.key === (status || "open").toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = getCurrentStepIndex(currentStatus);

  return (
    <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Progress Status</h4>
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const completed = idx <= currentIdx;
          const isLast = idx === STATUS_STEPS.length - 1;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`mt-2 text-xs font-medium text-center ${
                  completed ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                  idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({ query: "", address: "" });
  const newQueryRef = useRef({ query: "", address: "" });
  const threadsContainerRef = useRef(null);
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
    if (!isAuthenticated || !user || !user._id) {
      if (!isAuthenticated) {
        router.push("/login");
      }
      return;
    }
    
    const userId = user._id;
    
    if (!userId || userId === "undefined" || userId === "null" || userId === "") {
      router.push("/login");
      return;
    }
    
    fetchUserData(userId);
    fetchDepartments();
  }, [isAuthenticated, user?._id]);

  // Keep a ref of the latest newQuery to avoid stale closures
  useEffect(() => {
    newQueryRef.current = newQuery;
  }, [newQuery]);

  // Re-analyze query when address changes
  useEffect(() => {
    if (newQuery.query.trim() && newQuery.address && queryAnalysis) {
      analyzeQuery(newQuery.query, newQuery.address);
    }
  }, [newQuery.address]);

  // Scroll to bottom when threads change
  useEffect(() => {
    if (threadsContainerRef.current && threads.length > 0) {
      setTimeout(() => {
        threadsContainerRef.current.scrollTop = threadsContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [threads]);

  // Poll for new conversations when a query is selected
  useEffect(() => {
    if (!selectedQuery?._id) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedQuery._id}?includeAuthorDetails=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversations.length !== threads.length) {
            setThreads(data.conversations);
          }
        }
      } catch (error) {
        console.error("Error polling conversations:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [selectedQuery?._id, threads.length]);

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
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    }
  }, []);

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
    if (!userId || userId === "undefined" || userId === "null" || userId === "") {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const userData = await res.json();
      const userQueries = Array.isArray(userData.queries) ? userData.queries : [];
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
        
        // Fetch conversations from the API with author details
        const res = await fetch(`/api/conversations/${queryId}?includeAuthorDetails=true`);
        if (res.ok) {
          const data = await res.json();
          setThreads(data.conversations || []);
        } else {
          // Fallback to query objects if API fails
          setThreads(query.objects || []);
        }
        
        setShowNewQueryForm(false);
      }
    } catch (error) {
      console.error("Error fetching query threads:", error);
      // Fallback to query objects if API fails
      const query = (queries || []).find(q => q._id === queryId);
      if (query) {
        setThreads(query.objects || []);
      }
    }
  };

  const handleCreateQuery = async (e) => {
    e?.preventDefault?.();
    if (!queryAnalysis || !newQuery.query.trim()) return;

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
      
      selectedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

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
    } catch (err) {
      console.error("Error creating query:", err);
      alert(`Unable to submit query: ${err.message}. Please try again.`);
    }
  };

  const handleAddThread = async (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${selectedQuery._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newThread,
          authorId: user?._id || "",
          authorType: "User",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setThreads(data.query.objects || []);
        setNewThread("");
        
        // Scroll to bottom after adding new thread
        setTimeout(() => {
          if (threadsContainerRef.current) {
            threadsContainerRef.current.scrollTop = threadsContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        console.error("Failed to add thread");
      }
    } catch (error) {
      console.error("Error adding thread:", error);
    }
  };

  // Filter queries based on search and status
  const filteredQueries = (queries || []).filter((query) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={handleNewQuery}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen lg:h-auto lg:min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-80 xl:w-96'
        } bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col shadow-lg`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 bg-white/90">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Queries</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your complaints and requests</p>
              </div>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* New Query Button */}
            {!isMobile && (
              <button
                onClick={() => setShowNewQueryForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Query
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 bg-white/50">
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm placeholder-gray-500 transition-all"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm transition-all"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {filteredQueries.length} of {queries?.length || 0} queries
              </span>
              <div className="flex items-center gap-2 text-blue-600">
                <Eye className="w-4 h-4" />
                <span>Showing all</span>
              </div>
            </div>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 ">
            {filteredQueries.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={!queries || queries.length === 0 ? "No queries yet" : "No matching queries"}
                description={!queries || queries.length === 0 ? "Create your first query to get started" : "Try adjusting your search filters"}
                action={
                  !queries || queries.length === 0 ? (
                    <button
                      onClick={() => setShowNewQueryForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Create First Query
                    </button>
                  ) : null
                }
              />
            ) : (
              filteredQueries.map((query) => (
                <QueryCard
                  key={query._id || `query-${Math.random()}`}
                  query={query}
                  isSelected={selectedQuery?._id === query._id}
                  onClick={handleQuerySelect}
                />
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {showNewQueryForm ? (
            /* New Query Form */
            <div className="flex-1 flex flex-col">
              {/* Form Header */}
              <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Query</h1>
                    <p className="text-gray-600 mt-1">Describe your complaint and we'll route it to the right department</p>
                  </div>
                  {isMobile && (
                    <button
                      onClick={() => setShowNewQueryForm(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Query Input */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Describe Your Complaint
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Please describe your issue in detail. Be specific about what happened, when it occurred, and where it took place..."
                        value={newQuery.query}
                        onChange={(e) => setNewQuery({ ...newQuery, query: e.target.value })}
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
                        className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        disabled={!isSupported}
                        className={`absolute right-3 top-3 p-2.5 rounded-lg transition-all duration-200 ${
                          isListening
                            ? "bg-red-500 text-white shadow-lg animate-pulse"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={isListening ? "Stop Recording" : isSupported ? "Start Voice Input" : "Voice Input Not Supported"}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500">Be as detailed and specific as possible for faster resolution</p>
                      {isListening && (
                        <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Listening...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Input */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Location <span className="text-gray-500 font-normal">(Optional but recommended)</span>
                    </label>
                    <MapAddressSelector
                      value={newQuery.address}
                      onChange={(value) => setNewQuery({ ...newQuery, address: value })}
                      placeholder="Search or click on map to select address..."
                      showMap={showMap}
                      onToggleMap={() => setShowMap(!showMap)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Providing an accurate location helps departments respond more effectively
                    </p>
                  </div>

                  {/* File Attachments */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Attach Supporting Files
                    </label>
                    <AttachmentAI
                      onAnalyzed={(items) => {
                        setAttachmentAnalyses(items);
                        setSelectedFiles(items.map((i) => i.file).filter(Boolean));
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload photos, videos, or documents that support your complaint
                    </p>
                  </div>

                  {/* Analysis Loading */}
                  {analyzing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <LoadingSpinner size="md" />
                        <div>
                          <p className="font-semibold text-blue-900">Analyzing your complaint...</p>
                          <p className="text-sm text-blue-700 mt-1">We're determining the best department to handle your request</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {queryAnalysis && !analyzing && (
                    <div className={`rounded-xl border p-6 shadow-sm ${
                      queryAnalysis.detailsSufficient ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        {queryAnalysis.detailsSufficient ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className={`font-semibold ${queryAnalysis.detailsSufficient ? 'text-green-900' : 'text-amber-900'}`}>
                            {queryAnalysis.detailsSufficient ? 'Analysis Complete - Ready to Submit' : 'More Details Needed'}
                          </h3>
                          <p className={`text-sm ${queryAnalysis.detailsSufficient ? 'text-green-700' : 'text-amber-700'}`}>
                            {queryAnalysis.detailsSufficient ? 'Your complaint has been analyzed successfully' : 'Please provide additional information'}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Suggested Title</h4>
                            <p className="text-sm text-gray-700 bg-white/70 rounded-lg p-3 border">
                              {queryAnalysis.title}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Assigned Department</h4>
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-3 border">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">{queryAnalysis.departmentName}</span>
                            </div>
                          </div>

                          {newQuery.address && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">Location</h4>
                              <div className="flex items-start gap-2 bg-white/70 rounded-lg p-3 border">
                                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 break-words">{newQuery.address}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Analysis Reasoning</h4>
                            <p className="text-sm text-gray-600 bg-white/70 rounded-lg p-3 border leading-relaxed">
                              {queryAnalysis.reasoning}
                            </p>
                          </div>

                          {/* Detail Validation */}
                          {!queryAnalysis.detailsSufficient && (
                            <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
                              {queryAnalysis.missingDetails && queryAnalysis.missingDetails.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-semibold text-amber-900 mb-2">Missing Information:</h5>
                                  <ul className="space-y-1">
                                    {queryAnalysis.missingDetails.map((detail, index) => (
                                      <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                                        <span className="text-amber-600 mt-1">•</span>
                                        <span>{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {queryAnalysis.suggestions && (
                                <div className="bg-amber-100 rounded-lg p-3 border border-amber-200">
                                  <h5 className="text-sm font-semibold text-amber-900 mb-1">Suggestions:</h5>
                                  <p className="text-sm text-amber-800">{queryAnalysis.suggestions}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Attachment Summaries */}
                          {attachmentAnalyses.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Attachment Analysis ({attachmentAnalyses.length} files)
                              </h4>
                              <div className="space-y-2">
                                {attachmentAnalyses.map((analysis, idx) => (
                                  <div key={idx} className="bg-white/70 rounded-lg p-3 border text-sm">
                                    <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                      <FileUp className="w-4 h-4 text-blue-500" />
                                      {analysis.file?.name || analysis.filename || `File ${idx + 1}`}
                                    </div>
                                    {analysis.analysis?.description && (
                                      <p className="text-gray-600 mb-1">
                                        <strong>Content:</strong> {clampWords(analysis.analysis.description, 20, 25)}
                                      </p>
                                    )}
                                    {analysis.analysis?.summary && (
                                      <p className="text-gray-600">
                                        <strong>Summary:</strong> {clampWords(analysis.analysis.summary, 20, 25)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submission Warning */}
                      {queryAnalysis.detailsSufficient === false && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-red-900">Submission Blocked</h4>
                              <p className="text-sm text-red-800 mt-1">
                                Your complaint cannot be submitted because it lacks essential details or may be inappropriate. 
                                Please provide specific location information and describe the issue clearly so departments can take effective action.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCreateQuery}
                      disabled={!queryAnalysis || !newQuery.query.trim() || queryAnalysis.detailsSufficient === false}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:hover:shadow-md"
                    >
                      {analyzing ? (
                        <div className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          Analyzing...
                        </div>
                      ) : queryAnalysis?.detailsSufficient === false ? (
                        "Cannot Submit - Details Insufficient"
                      ) : (
                        "Submit Query"
                      )}
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
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-colors border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedQuery ? (
            /* Query Details View */
            <div className="flex-1 flex flex-col">
              {/* Query Header */}
              <div className="">
               <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-3">
                      {isMobile && (
                        <button
                          onClick={() => {
                            setSelectedQuery(null);
                            setThreads([]);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 mr-3 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedQuery?.title || "Query Details"}
                        </h1>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={selectedQuery?.status} />
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {selectedQuery ? new Date(selectedQuery.updatedAt || selectedQuery.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedQuery?.description || "No description available"}
                      </p>
                    </div>

                    {/* Location */}
                    {selectedQuery?.address && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          Location
                        </h3>
                        <p className="text-gray-700">{selectedQuery.address}</p>
                      </div>
                    )}

                    {/* Attachments */}
                    {selectedQuery?.attachments?.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-600" />
                          Attachments ({selectedQuery.attachments.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {selectedQuery.attachments.map((att, idx) => {
                            const isImage = (att.mimetype || "").startsWith("image/");
                            const isVideo = (att.mimetype || "").startsWith("video/");
                            return (
                              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                                {isImage ? (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="block group">
                                    <img src={att.url} alt={att.originalName} className="w-full h-28 object-cover group-hover:opacity-90 transition-opacity" />
                                    <div className="p-2 text-xs text-gray-700 truncate flex items-center gap-1">
                                      <ImageIcon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">{att.originalName}</span>
                                    </div>
                                  </a>
                                ) : isVideo ? (
                                  <div>
                                    <video src={att.url} controls className="w-full h-28 object-cover bg-black" />
                                    <a href={att.url} target="_blank" rel="noreferrer" className="block p-2 text-xs text-gray-700 truncate flex items-center gap-1 hover:bg-gray-50">
                                      <VideoIcon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">{att.originalName}</span>
                                    </a>
                                  </div>
                                ) : (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
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

                {/* Progress Stepper */}
                <ProgressStepper currentStatus={selectedQuery?.status} />
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Scroll to bottom button */}
                {threads.length > 3 && (
                  <button
                    onClick={() => {
                      if (threadsContainerRef.current) {
                        threadsContainerRef.current.scrollTop = threadsContainerRef.current.scrollHeight;
                      }
                    }}
                    className="absolute top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-110"
                    title="Scroll to bottom"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {/* Messages Container */}
                <div ref={threadsContainerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
                  {threads.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="No messages yet"
                      description="Start a conversation about this query. Add updates, ask questions, or provide additional information."
                      action={
                        <button
                          onClick={() => document.getElementById('message-input')?.focus()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Start Conversation
                        </button>
                      }
                    />
                  ) : (
                    <div className="max-w-4xl mx-auto">
                      <div className="space-y-6">
                        {threads.map((thread, index) => {
                          const isAdmin = thread.authorType === "DepartmentMember";
                          return (
                            <div key={index} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-2xl ${isAdmin ? 'mr-auto' : 'ml-auto'}`}>
                                <div className={`rounded-2xl p-4 shadow-sm border ${
                                  isAdmin 
                                    ? 'bg-white border-gray-200' 
                                    : 'bg-blue-600 text-white border-blue-600'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      isAdmin ? 'bg-green-100' : 'bg-blue-500'
                                    }`}>
                                      {isAdmin ? (
                                        <Building2 className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <User className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <span className={`text-xs font-semibold ${
                                      isAdmin ? 'text-green-800' : 'text-blue-100'
                                    }`}>
                                      {isAdmin 
                                        ? (thread.authorDetails?.name || 'Department Update') 
                                        : (thread.authorDetails?.name || 'You')
                                      }
                                    </span>
                                    <span className={`text-xs ${
                                      isAdmin ? 'text-gray-500' : 'text-blue-100'
                                    }`}>
                                      {new Date(thread.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  <p className={`leading-relaxed whitespace-pre-wrap ${
                                    isAdmin ? 'text-gray-900' : 'text-white'
                                  }`}>
                                    {thread.message}
                                  </p>

                                  {/* Thread Attachments */}
                                  {Array.isArray(thread.attachments) && thread.attachments.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                      {thread.attachments.map((att, i) => {
                                        const isImage = (att.mimetype || '').startsWith('image/');
                                        const isVideo = (att.mimetype || '').startsWith('video/');
                                        return (
                                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            {isImage ? (
                                              <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                                <img src={att.url} alt={att.originalName} className="w-full h-24 object-cover" />
                                                <div className="p-2 text-xs text-gray-700 truncate flex items-center gap-1">
                                                  <ImageIcon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                  <span className="truncate">{att.originalName}</span>
                                                </div>
                                              </a>
                                            ) : isVideo ? (
                                              <div>
                                                <video src={att.url} controls className="w-full h-24 object-cover bg-black" />
                                                <a href={att.url} target="_blank" rel="noreferrer" className="block p-2 text-xs text-gray-700 truncate flex items-center gap-1">
                                                  <VideoIcon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                  <span className="truncate">{att.originalName}</span>
                                                </a>
                                              </div>
                                            ) : (
                                              <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 text-xs text-gray-700 hover:bg-gray-50">
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                </div>

                {/* Message Input */}
                <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 sticky bottom-0">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <textarea
                          id="message-input"
                          placeholder="Type your message or ask a question..."
                          value={newThread}
                          onChange={(e) => setNewThread(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddThread(e);
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                          rows="3"
                        />
                        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-4 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          ) : (
            /* Empty State - No Query Selected */
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={MessageSquare}
                title="Select a query to view details"
                description="Choose a query from the sidebar to see its details, progress status, and conversation thread"
                action={
                  isMobile ? (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      View All Queries
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowNewQueryForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Create New Query
                    </button>
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}