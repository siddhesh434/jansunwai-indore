"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Send,
  User,
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
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import MapAddressSelector from "./MapAddressSelector"; // Import the new component

export default function Dashboard() {
  const [user, setUser] = useState(null);
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

  // Voice-to-text states
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Map visibility state
  const [showMap, setShowMap] = useState(false);

  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchUserData(userId);
    fetchDepartments();
  }, []);

  // Keep a ref of the latest newQuery to avoid stale closures
  useEffect(() => {
    newQueryRef.current = newQuery;
  }, [newQuery]);

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

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const userData = await res.json();
      setUser(userData);
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
      // Mock analysis - in real app this would call your API
      setTimeout(() => {
        setQueryAnalysis({
          title: query.substring(0, 60) + (query.length > 60 ? "..." : ""),
          departmentId: departments[0]?._id,
          departmentName: departments[0]?.departmentName || "",
          reasoning: "Based on the keywords in your complaint, this appears to be related to municipal services.",
          originalQuery: query,
          address: address || "",
        });
        setAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error("Error analyzing query:", error);
      setAnalyzing(false);
    }
  };

  const fetchQueryThreads = async (queryId) => {
    try {
      const query = queries.find(q => q._id === queryId);
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

    try {
      const deptId = queryAnalysis?.departmentId || departments[0]?._id;
      if (!deptId) {
        alert("No departments available. Please try again later.");
        return;
      }
      const formData = new FormData();
      formData.append("title", queryAnalysis.title || "");
      formData.append("description", newQuery.query || "");
      formData.append("address", newQuery.address || "");
      formData.append("author", user._id);
      formData.append("department", deptId);
      selectedFiles.forEach((file) => formData.append("attachments", file));

      const res = await fetch("/api/queries", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create query");
      const created = await res.json();

      stopVoiceInput();
      setQueries([...queries, created]);
      setNewQuery({ query: "", address: "" });
      setQueryAnalysis(null);
      setSelectedFiles([]);
      setShowNewQueryForm(false);
      setShowMap(false);
      setSelectedQuery(created);
      setThreads([]);
    } catch (err) {
      console.error(err);
      alert("Unable to submit query. Please try again.");
    }
  };

  const handleAddThread = (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    const newThreadData = {
      message: newThread,
      authorId: user._id,
      authorType: "User",
      timestamp: new Date(),
    };

    const updatedThreads = [...threads, newThreadData];
    setThreads(updatedThreads);
    setNewThread("");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/");
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

  // Filter queries based on search and status
  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Query Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-200">
            <User className="w-4 h-4 text-blue-500" />
            <span>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-white/50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Queries List */}
        <div className="w-1/3 bg-white/60 backdrop-blur-sm border-r border-blue-200 flex flex-col shadow-sm">
          {/* New Query Button */}
          <div className="p-4 border-b border-blue-200">
            <button
              onClick={() => setShowNewQueryForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Query</span>
            </button>
          </div>

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
              {filteredQueries.length} of {queries.length} queries
            </p>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredQueries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {queries.length === 0 ? "No queries yet" : "No matching queries"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {queries.length === 0 ? "Create your first query" : "Try adjusting your search"}
                </p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query._id}
                  onClick={() => fetchQueryThreads(query._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md border backdrop-blur-sm ${
                    selectedQuery?._id === query._id
                      ? "bg-white border-blue-300 shadow-md ring-2 ring-blue-200"
                      : "border-transparent hover:border-blue-200 bg-white/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                        {query.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                        {query.description}
                      </p>
                      <div className="flex items-center justify-between">
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
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
          {showNewQueryForm ? (
            /* New Query Form */
            <div className="flex-1 flex flex-col max-h-[84vh]">
              <div className="p-6 border-b border-blue-200 bg-white/60 backdrop-blur-sm">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Create New Query
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Describe your complaint and we'll route it to the right department
                </p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl space-y-6">
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
                        className="w-full px-4 py-3 pr-12 border border-blue-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm"
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
                    <div className="flex items-center justify-between mt-1">
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
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedFiles.length} file(s) selected
                      </p>
                    )}
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
                          <p className="text-sm text-gray-900 font-medium">
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

                        {newQuery.address && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Address:
                            </span>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                              {newQuery.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleCreateQuery}
                      disabled={!queryAnalysis || !newQuery.query.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {analyzing ? "Analyzing..." : "Create Query"}
                    </button>
                    <button
                      onClick={() => {
                        stopVoiceInput();
                        setShowNewQueryForm(false);
                        setNewQuery({ query: "", address: "" });
                        setQueryAnalysis(null);
                        setShowMap(false); // Hide map when canceling
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedQuery ? (
            /* Query Thread View */
            <div className="flex-1 flex flex-col max-h-[84vh]">
              {/* Query Header */}
              <div className="p-6 border-b border-blue-200 bg-white/60 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedQuery.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">
                      {selectedQuery.description}
                    </p>
                    {selectedQuery.address && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{selectedQuery.address}</span>
                      </div>
                    )}

                    {selectedQuery.attachments?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {selectedQuery.attachments.map((att, idx) => {
                            const isImage = (att.mimetype || "").startsWith("image/");
                            const isVideo = (att.mimetype || "").startsWith("video/");
                            return (
                              <div key={idx} className="border border-blue-200 rounded-lg overflow-hidden bg-white">
                                {isImage ? (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                    <img src={att.url} alt={att.originalName} className="w-full h-28 object-cover" />
                                    <div className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><ImageIcon className="w-3 h-3 mr-1 text-blue-500" />{att.originalName}</div>
                                  </a>
                                ) : isVideo ? (
                                  <div className="w-full">
                                    <video src={att.url} controls className="w-full h-28 object-cover bg-black" />
                                    <a href={att.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><VideoIcon className="w-3 h-3 mr-1 text-blue-500" />{att.originalName}</a>
                                  </div>
                                ) : (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 p-2 text-xs text-gray-700 hover:bg-blue-50">
                                    <FileText className="w-4 h-4 text-blue-500" />
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

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      Created {new Date(selectedQuery.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      selectedQuery.status?.toLowerCase() || "open"
                    )}`}
                  >
                    {selectedQuery.status?.replace("_", " ").toUpperCase() || "OPEN"}
                  </div>
                </div>
              </div>

              {/* Threads Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Threads List */}
                <div className="flex-1 overflow-y-auto p-6">
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
                    <div className="space-y-4 max-w-4xl">
                      {threads.map((thread, index) => (
                        <div
                          key={index}
                          className={`rounded-xl p-4 border backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                            thread.authorType === "User"
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mr-8"
                              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ml-8"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                thread.authorType === "User"
                                  ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                                  : "bg-gradient-to-r from-green-400 to-emerald-500"
                              }`}
                            >
                              {thread.authorType === "User" ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Building2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {thread.authorType === "User"
                                    ? "You"
                                    : "Department Response"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(thread.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-900 leading-relaxed">
                                {thread.message}
                              </p>
                              {Array.isArray(thread.attachments) && thread.attachments.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {thread.attachments.map((att, i) => {
                                    const isImage = (att.mimetype || "").startsWith("image/");
                                    const isVideo = (att.mimetype || "").startsWith("video/");
                                    return (
                                      <div key={i} className="border border-blue-200 rounded-lg overflow-hidden bg-white">
                                        {isImage ? (
                                          <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                            <img src={att.url} alt={att.originalName} className="w-full h-24 object-cover" />
                                            <div className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><ImageIcon className="w-3 h-3 mr-1 text-blue-500" />{att.originalName}</div>
                                          </a>
                                        ) : isVideo ? (
                                          <div className="w-full">
                                            <video src={att.url} controls className="w-full h-24 object-cover bg-black" />
                                            <a href={att.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><VideoIcon className="w-3 h-3 mr-1 text-blue-500" />{att.originalName}</a>
                                          </div>
                                        ) : (
                                          <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 p-2 text-xs text-gray-700 hover:bg-blue-50">
                                            <FileText className="w-4 h-4 text-blue-500" />
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
                      ))}
                    </div>
                  )}
                </div>

                {/* Thread Input */}
                <div className="border-t border-blue-200 p-6 bg-white/60 backdrop-blur-sm">
                  <div className="max-w-4xl">
                    <div className="flex space-x-3">
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
                          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm"
                          rows="3"
                        />
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-lg transition-all duration-200 shrink-0 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a query to view details
                </h3>
                <p className="text-gray-600">
                  Choose a query from the list to see its details and replies
                </p>
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