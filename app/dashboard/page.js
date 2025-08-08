"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, User, MessageSquare, Clock, ChevronRight, Building2, Bot, Sparkles, Search, Filter, X, Mic, MicOff } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({
    query: "",
    address: "",
  });
  const [queryAnalysis, setQueryAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [newThread, setNewThread] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);
  
  // Voice-to-text states
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  
  // Enhanced AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your JanSunwai AI Assistant. I can help you with municipal services, draft complaints, suggest departments, analyze your queries, and guide you through the complaint process. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState("general"); // general, query-specific, analysis
  const messagesEndRef = useRef(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const router = useRouter();

  // Scroll to bottom of AI chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchUserData(userId);
    fetchDepartments();
  }, []);

  // Initialize voice-to-text
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setNewQuery(prev => ({
            ...prev,
            query: prev.query + (prev.query ? ' ' : '') + finalTranscript
          }));
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const userData = await res.json();
      setUser(userData);
      setQueries(userData.queries || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Voice-to-text functions
  const toggleVoiceInput = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
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
          address: address || ""
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
        address: address || ""
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchQueryThreads = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`);
      const queryData = await res.json();
      setSelectedQuery(queryData);
      setThreads(queryData.objects || []);
      setShowNewQueryForm(false);
      
      // Set AI context to query-specific
      setAiContext("query-specific");
      
      // Add context message to AI
      const contextMessage = {
        role: "system",
        content: `Now focusing on query: "${queryData.title}". I can help with follow-ups, status updates, or related concerns.`,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, contextMessage]);
    } catch (error) {
      console.error("Error fetching query threads:", error);
    }
  };

  // Enhanced AI Assistant Functions
  const handleAIMessage = async (e) => {
    e?.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput;
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setAiLoading(true);

    try {
      // Enhanced context based on current state
      const enhancedContext = {
        departments: departments.map(d => ({ id: d._id, name: d.departmentName })),
        userQueries: queries.length,
        userName: user?.name,
        currentQuery: selectedQuery ? {
          title: selectedQuery.title,
          description: selectedQuery.description,
          status: selectedQuery.status,
          threadCount: threads.length
        } : null,
        queryHistory: queries.map(q => ({
          title: q.title,
          status: q.status,
          department: q.department
        })),
        contextType: aiContext
      };

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: enhancedContext,
          conversationHistory: aiMessages.slice(-5) // Last 5 messages for context
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        const assistantMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          actions: data.actions || [] // Suggested actions
        };
        
        setAiMessages(prev => [...prev, assistantMessage]);
        
        // Handle AI suggestions and actions
        if (data.suggestedQuery) {
          setNewQuery({
            query: data.suggestedQuery.description || "",
            address: data.suggestedQuery.address || "",
          });
          setShowNewQueryForm(true);
          setShowAIAssistant(false);
          // Trigger analysis if query is provided
          if (data.suggestedQuery.description) {
            analyzeQuery(data.suggestedQuery.description, data.suggestedQuery.address || "");
          }
        }
        
        if (data.suggestedThread && selectedQuery) {
          setNewThread(data.suggestedThread);
        }
        
      } else {
        setAiMessages(prev => [...prev, { 
          role: "assistant", 
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error("Error sending AI message:", error);
      setAiMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Quick AI actions
  const handleQuickAIAction = async (action) => {
    let prompt = "";
    switch (action) {
      case "analyze":
        prompt = "Analyze my query history and provide insights";
        setAiContext("analysis");
        break;
      case "draft":
        prompt = "Help me draft a new complaint. I want to describe my issue and let AI automatically categorize it.";
        break;
      case "status":
        prompt = selectedQuery ? `What should I expect for the status of my query: ${selectedQuery.title}?` : "How do I track query status?";
        break;
      case "escalate":
        prompt = selectedQuery ? `How can I escalate my query: ${selectedQuery.title}?` : "How do I escalate a complaint?";
        break;
    }
    
    if (prompt) {
      setAiInput(prompt);
      setShowAIAssistant(true);
    }
  };

  const handleCreateQuery = (e) => {
    e?.preventDefault?.();
    if (!queryAnalysis || !newQuery.query.trim()) return;
    
    const createQuery = async () => {
      try {
        const queryData = {
          title: queryAnalysis.title,
          description: newQuery.query,
          department: queryAnalysis.departmentId,
          author: user._id,
        };

        const res = await fetch("/api/queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryData),
        });

        if (res.ok) {
          const createdQuery = await res.json();
          stopVoiceInput();
          setQueries([...queries, createdQuery]);
          setNewQuery({ query: "", address: "" });
          setQueryAnalysis(null);
          setShowNewQueryForm(false);
          setSelectedQuery(createdQuery);
          setThreads([]);
          
          // AI acknowledgment
          setAiMessages(prev => [...prev, {
            role: "assistant",
            content: `Great! I've analyzed your complaint and created the query "${createdQuery.title}" for the ${queryAnalysis.departmentName} department. I'll continue to monitor its progress and can help with follow-ups.`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error("Error creating query:", error);
      }
    };
    
    createQuery();
  };

  const handleAddThread = (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    const addThread = async () => {
      try {
        const updatedThreads = [
          ...threads,
          {
            message: newThread,
            authorId: user._id,
            authorType: "User",
            timestamp: new Date(),
          },
        ];

        const res = await fetch(`/api/queries/${selectedQuery._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objects: updatedThreads }),
        });

        if (res.ok) {
          setThreads(updatedThreads);
          setNewThread("");
          
          // AI can suggest next steps
          handleQuickAIAction("status");
        }
      } catch (error) {
        console.error("Error adding thread:", error);
      }
    };
    
    addThread();
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
  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || query.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">Loading dashboard...</span>
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
          {/* Quick AI Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => handleQuickAIAction("analyze")}
              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Analyze Queries
            </button>
            <button
              onClick={() => handleQuickAIAction("draft")}
              className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
            >
              Draft Complaint
            </button>
          </div>
          
          {/* AI Assistant Toggle */}
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm ${
              showAIAssistant 
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg" 
                : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">AI Assistant</span>
            {aiLoading && <Sparkles className="w-3 h-3 animate-pulse" />}
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-200">
            <User className="w-4 h-4 text-blue-500" />
            <span>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-white/50"
          >
            Sign out
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
                  {queries.length === 0 ? "Create your first query to get started" : "Try adjusting your search"}
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
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(query.status?.toLowerCase() || "open")}`}>
                          {query.status?.replace('_', ' ').toUpperCase() || "OPEN"}
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
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Create New Query</h2>
                <p className="text-sm text-gray-600 mt-1">Describe your complaint and our AI will automatically categorize it</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Complaint
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Describe your complaint in detail. For example: 'The garbage truck has not come to our area for the past 7 days. The situation is getting very unhygienic.'"
                        value={newQuery.query}
                        onChange={(e) => setNewQuery({ ...newQuery, query: e.target.value })}
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
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isListening ? 'Stop recording' : isSupported ? 'Start voice input (speak your complaint)' : 'Voice input not supported in this browser'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">Be as detailed as possible to help us route your complaint correctly</p>
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
                    <input
                      type="text"
                      placeholder="Enter your address or location details"
                      value={newQuery.address}
                      onChange={(e) => setNewQuery({ ...newQuery, address: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* AI Analysis Results */}
                  {analyzing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-blue-700 font-medium">Analyzing your complaint...</span>
                      </div>
                    </div>
                  )}

                  {queryAnalysis && !analyzing && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-green-800 font-medium">AI Analysis Complete</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Suggested Title:</span>
                          <p className="text-sm text-gray-900 font-medium">{queryAnalysis.title}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Assigned Department:</span>
                          <p className="text-sm text-gray-900 font-medium">{queryAnalysis.departmentName}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Reasoning:</span>
                          <p className="text-sm text-gray-600">{queryAnalysis.reasoning}</p>
                        </div>
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
                  </div>
                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickAIAction("status")}
                      className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Check Status
                    </button>
                    <button
                      onClick={() => handleQuickAIAction("escalate")}
                      className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Created: {new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedQuery.status?.toLowerCase() || "open")}`}>
                    {selectedQuery.status?.replace('_', ' ').toUpperCase() || "OPEN"}
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No replies yet</h3>
                      <p className="text-gray-600 mb-4">Start the conversation by adding your first message below.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl">
                      {threads.map((thread, index) => (
                        <div key={index} className={`rounded-xl p-4 border backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                          thread.authorType === "User" 
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mr-8" 
                            : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ml-8"
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                              thread.authorType === "User"
                                ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                                : "bg-gradient-to-r from-green-400 to-emerald-500"
                            }`}>
                              {thread.authorType === "User" ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Building2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {thread.authorType === "User" ? "You" : "Department Response"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(thread.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-900 leading-relaxed">
                                {thread.message}
                              </p>
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
                          placeholder="Type your message here..."
                          value={newThread}
                          onChange={(e) => setNewThread(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a query</h3>
                <p className="text-gray-600">Choose a query from the sidebar to view and manage its threads.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Overlay */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col m-4 border border-blue-200">
            {/* AI Assistant Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">JanSunwai AI Assistant</h3>
                  <p className="text-xs text-purple-100">
                    {aiContext === "query-specific" ? `Helping with: ${selectedQuery?.title || 'Current Query'}` : 
                     aiContext === "analysis" ? "Analyzing your queries" : "Municipal services helper"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Context Indicator */}
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {aiContext === "query-specific" ? "Query Mode" : 
                   aiContext === "analysis" ? "Analysis Mode" : "General Mode"}
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="text-white hover:text-purple-200 text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-4 border-b border-blue-200 bg-blue-50/50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAIAction("analyze")}
                  className="text-xs px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors flex items-center space-x-1"
                >
                  <Filter className="w-3 h-3" />
                  <span>Analyze Queries</span>
                </button>
                <button
                  onClick={() => handleQuickAIAction("draft")}
                  className="text-xs px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Draft New</span>
                </button>
                {selectedQuery && (
                  <>
                    <button
                      onClick={() => handleQuickAIAction("status")}
                      className="text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors flex items-center space-x-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Status Help</span>
                    </button>
                    <button
                      onClick={() => handleQuickAIAction("escalate")}
                      className="text-xs px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full transition-colors flex items-center space-x-1"
                    >
                      <ChevronRight className="w-3 h-3" />
                      <span>Escalation</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* AI Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
              {aiMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} ${
                    message.role === "system" ? "justify-center" : ""
                  }`}
                >
                  {message.role === "system" ? (
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-xs font-medium max-w-md text-center border border-blue-200">
                      {message.content}
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-xl shadow-sm border backdrop-blur-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-300 ml-auto"
                            : "bg-white/90 text-gray-900 border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.timestamp && (
                          <p className={`text-xs mt-2 ${
                            message.role === "user" ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                        {/* Action buttons for assistant messages */}
                        {message.role === "assistant" && message.actions && message.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => setAiInput(action.prompt)}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/90 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                        <span className="text-sm">Thinking...</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Input */}
            <div className="border-t border-blue-200 p-4 bg-white/80 backdrop-blur-sm rounded-b-2xl">
              <form onSubmit={handleAIMessage} className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={
                      aiContext === "query-specific" 
                        ? "Ask about this query, suggest follow-ups, or get status updates..."
                        : aiContext === "analysis"
                        ? "Ask for insights about your query patterns..."
                        : "Ask about municipal services, complaint procedures, or get help..."
                    }
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm transition-all pr-12"
                    disabled={aiLoading}
                  />
                  {aiInput && (
                    <button
                      type="button"
                      onClick={() => setAiInput("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!aiInput.trim() || aiLoading}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
              
              {/* Suggested Prompts */}
              {aiMessages.length <= 2 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setAiInput("How do I track the status of my complaints?")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  >
                    Track Status
                  </button>
                  <button
                    onClick={() => setAiInput("What documents do I need for a water connection complaint?")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  >
                    Required Documents
                  </button>
                  <button
                    onClick={() => setAiInput("How long does it typically take to resolve complaints?")}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  >
                    Resolution Time
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast (if needed) */}
      {/* You can add notification system here */}
      
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