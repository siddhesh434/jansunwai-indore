"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, User, MessageSquare, Clock, ChevronRight, Building2, Search, Filter, X } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    department: "",
  });
  const [newThread, setNewThread] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchUserData(userId);
    fetchDepartments();
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

  const fetchQueryThreads = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`);
      const queryData = await res.json();
      setSelectedQuery(queryData);
      setThreads(queryData.objects || []);
      setShowNewQueryForm(false);
    } catch (error) {
      console.error("Error fetching query threads:", error);
    }
  };

  const handleCreateQuery = (e) => {
    e?.preventDefault?.();
    if (!newQuery.title || !newQuery.description || !newQuery.department) return;
    
    const createQuery = async () => {
      try {
        const res = await fetch("/api/queries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newQuery, author: user._id }),
        });

        if (res.ok) {
          const createdQuery = await res.json();
          setQueries([...queries, createdQuery]);
          setNewQuery({ title: "", description: "", department: "" });
          setShowNewQueryForm(false);
          setSelectedQuery(createdQuery);
          setThreads([]);
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

    // Check if user has already sent 2 messages
    const userThreadCount = threads.filter(thread => thread.authorType === "User").length;
    if (userThreadCount >= 2) {
      alert("You can only send up to 2 messages per query.");
      return;
    }

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

  // Calculate remaining messages for current query
  const getRemainingMessages = () => {
    if (!selectedQuery) return 2;
    const userThreadCount = threads.filter(thread => thread.authorType === "User").length;
    return Math.max(0, 2 - userThreadCount);
  };

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
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-blue-200 bg-white/60 backdrop-blur-sm">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Create New Query</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new query</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Query Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a descriptive title for your query"
                      value={newQuery.title}
                      onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Provide a detailed description of your query"
                      value={newQuery.description}
                      onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={newQuery.department}
                      onChange={(e) => setNewQuery({ ...newQuery, department: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleCreateQuery}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Create Query
                    </button>
                    <button
                      onClick={() => setShowNewQueryForm(false)}
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
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Created: {new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedQuery.status?.toLowerCase() || "open")}`}>
                      {selectedQuery.status?.replace('_', ' ').toUpperCase() || "OPEN"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Messages remaining:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {getRemainingMessages()}/2
                    </span>
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
                      <p className="text-sm text-blue-600">You can send up to 2 messages per query.</p>
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
                    {getRemainingMessages() > 0 ? (
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
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-amber-800 font-medium">
                          You have reached the maximum limit of 2 messages for this query.
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Please wait for a department response or create a new query if needed.
                        </p>
                      </div>
                    )}
                    
                    {/* Message counter */}
                    {getRemainingMessages() > 0 && (
                      <div className="mt-2 text-xs text-gray-500 text-right">
                        {getRemainingMessages()} message{getRemainingMessages() !== 1 ? 's' : ''} remaining
                      </div>
                    )}
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