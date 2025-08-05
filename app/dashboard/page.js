"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, User, MessageSquare, Clock, ChevronRight, Building2 } from "lucide-react";

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
      // Close the new query form when selecting an existing query
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
    router.push("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Query Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Queries List */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* New Query Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowNewQueryForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Query</span>
            </button>
          </div>

          {/* Query Count */}
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {queries.length} queries
            </p>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {queries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No queries yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first query to get started</p>
              </div>
            ) : (
              queries.map((query) => (
                <div
                  key={query._id}
                  onClick={() => fetchQueryThreads(query._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-white hover:shadow-sm border ${
                    selectedQuery?._id === query._id
                      ? "bg-white border-orange-200 shadow-sm"
                      : "border-transparent hover:border-gray-200"
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
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status?.toLowerCase() || "open")}`}>
                          {query.status?.replace('_', ' ').toUpperCase() || "OPEN"}
                        </div>
                        <span className="text-xs text-gray-400">
                          {query.objects?.length || 0} replies
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 ml-2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Query Details and Threads */}
        <div className="flex-1 flex flex-col">
          {showNewQueryForm ? (
            /* New Query Form */
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Query</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new query</p>
              </div>
              
              <div className="flex-1 p-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={newQuery.department}
                      onChange={(e) => setNewQuery({ ...newQuery, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
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
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Create Query
                    </button>
                    <button
                      onClick={() => setShowNewQueryForm(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedQuery ? (
            /* Query Thread View */
            <div className="flex-1 flex flex-col">
              {/* Query Header */}
              <div className="p-6 border-b border-gray-200">
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
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Created: {new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.status?.toLowerCase() || "open")}`}>
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
                      <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No replies yet</h3>
                      <p className="text-gray-600 mb-4">Start the conversation by adding your first message below.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-4xl">
                      {threads.map((thread, index) => (
                        <div key={index} className={`rounded-lg p-4 border ${
                          thread.authorType === "User" 
                            ? "bg-orange-50 border-orange-200 mr-8" 
                            : "bg-blue-50 border-blue-200 ml-8"
                        }`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              thread.authorType === "User"
                                ? "bg-orange-100"
                                : "bg-blue-100"
                            }`}>
                              {thread.authorType === "User" ? (
                                <User className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Building2 className="w-4 h-4 text-blue-600" />
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
                <div className="border-t border-gray-200 p-6">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                          rows="3"
                        />
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors shrink-0 flex items-center justify-center"
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
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a query</h3>
                <p className="text-gray-600">Choose a query from the sidebar to view and manage its threads.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}