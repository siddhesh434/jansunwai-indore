"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  MessageSquare,
  Clock,
  ChevronRight,
  Building2,
  Filter,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  MapPin,
  Eye,
  Reply,
  Archive,
  RefreshCw,
  X,
  Brain,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import FeedbackDisplay from "../../components/FeedbackDisplay";

export default function DepartmentDashboard() {
  const [departmentQueries, setDepartmentQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("createdAt"); // createdAt, urgency, status
  const router = useRouter();
  const { t } = useLanguage();
  const { departmentMember, isAuthenticated } = useAuth();

  // Map of filenames/originalNames that have saved AI analyses for quick lookup
  const analyzedNameSet = new Set(
    (Array.isArray(selectedQuery?.attachmentAnalyses)
      ? selectedQuery.attachmentAnalyses
      : [])
      .flatMap((a) => [a?.filename, a?.originalName].filter(Boolean))
  );

  const cleanedDescription = (() => {
    const desc = selectedQuery?.description || "";
    const marker = "=== Attachment AI Summaries ===";
    const idx = desc.indexOf(marker);
    return idx === -1 ? desc : desc.slice(0, idx).trim();
  })();

  useEffect(() => {
    if (!isAuthenticated || !departmentMember) {
      router.push("/department/login");
      return;
    }
    fetchDepartmentQueries();
  }, [isAuthenticated, departmentMember]);

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

  const fetchDepartmentQueries = async () => {
    try {
      // Fetch all queries for this department
      const queriesRes = await fetch(
        `/api/departments/${departmentMember.department._id}/queries`
      );
      const queriesData = await queriesRes.json();
      setDepartmentQueries(queriesData);
    } catch (error) {
      console.error("Error fetching department queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryThreads = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`);
      const queryData = await res.json();
      setSelectedQuery(queryData);
      
              // Fetch conversations from the API with author details
        const conversationsRes = await fetch(`/api/conversations/${queryId}?includeAuthorDetails=true`);
        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          setThreads(conversationsData.conversations || []);
        } else {
          // Fallback to query objects if API fails
          setThreads(queryData.objects || []);
        }
    } catch (error) {
      console.error("Error fetching query threads:", error);
      // Fallback to query objects if API fails
      try {
        const res = await fetch(`/api/queries/${queryId}`);
        const queryData = await res.json();
        setThreads(queryData.objects || []);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  const handleAddThread = async (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    // Prevent adding messages to resolved queries
    if (selectedQuery.status === "resolved") {
      alert("Cannot add messages to resolved queries. The conversation has ended.");
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${selectedQuery._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newThread,
          authorId: departmentMember.id,
          authorType: "DepartmentMember",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setThreads(data.query.objects || []);
        setNewThread("");
        setSelectedQuery(data.query);

        // Update the query in the list
        setDepartmentQueries((queries) =>
          queries.map((q) =>
            q._id === selectedQuery._id ? data.query : q
          )
        );
      } else {
        console.error("Failed to add thread");
      }
    } catch (error) {
      console.error("Error adding thread:", error);
    }
  };

  const updateQueryStatus = async (queryId, newStatus) => {
    try {
      const res = await fetch(`/api/queries/${queryId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
        // Update the query in the list
        setDepartmentQueries((queries) =>
          queries.map((q) =>
            q._id === queryId ? { ...q, status: newStatus } : q
          )
        );
      }
    } catch (error) {
      console.error("Error updating query status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <ClockIcon className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgencyLabel) => {
    switch (urgencyLabel) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const filteredQueries = departmentQueries.filter((query) => {
    const matchesStatus =
      statusFilter === "all" || query.status === statusFilter;
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedQueries = [...filteredQueries].sort((a, b) => {
    switch (sortBy) {
      case "urgency":
        const urgencyOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const aUrgency = urgencyOrder[a.urgencyLabel] || 0;
        const bUrgency = urgencyOrder[b.urgencyLabel] || 0;
        return bUrgency - aUrgency;
      case "status":
        const statusOrder = { open: 3, in_progress: 2, resolved: 1 };
        const aStatus = statusOrder[a.status] || 0;
        const bStatus = statusOrder[b.status] || 0;
        return aStatus - bStatus;
      case "createdAt":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const activeQueries = sortedQueries.filter(q => q.status !== "resolved");
  const resolvedQueries = sortedQueries.filter(q => q.status === "resolved");

  const stats = {
    total: departmentQueries.length,
    open: departmentQueries.filter(q => q.status === "open").length,
    inProgress: departmentQueries.filter(q => q.status === "in_progress").length,
    resolved: departmentQueries.filter(q => q.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 font-medium">
            {t("loadingDepartmentDashboard")}
          </span>
        </div>
      </div>
    );
  }

  const generateNetConclusion = (query) => {
    if (!query) return "No query data available for analysis.";
    
    // Extract attachment analysis insights
    const attachmentInsights = query.attachmentAnalyses
      ?.filter(analysis => analysis.summary || analysis.description)
      .map(analysis => analysis.summary || analysis.description)
      .filter(Boolean)
      .join(" ");
    
    // Extract user complaint reasoning from objects/threads
    const userComplaintReasoning = query.objects
      ?.filter(object => object.message && object.message.trim())
      .map(object => object.message.trim())
      .filter(Boolean)
      .join(" ");
    
    // Combine user description with reasoning
    const userComplaint = `${query.description || ""} ${userComplaintReasoning}`.trim();
    
    // Create intelligent summary
    let netConclusion = "";
    
    if (attachmentInsights && userComplaint) {
      // Combine both sources intelligently
      const combinedText = `${userComplaint} ${attachmentInsights}`;
      netConclusion = combinedText;
    } else if (attachmentInsights) {
      netConclusion = attachmentInsights;
    } else if (userComplaint) {
      netConclusion = userComplaint;
    } else {
      netConclusion = "Insufficient data for comprehensive analysis.";
    }
    
    // Ensure it's approximately 40 words (average word length is 5 characters)
    const targetLength = 4000 * 5; // 40 words * 5 chars per word
    if (netConclusion.length > targetLength) {
      netConclusion = netConclusion.substring(0, targetLength).trim();
      // Try to end at a complete word
      const lastSpaceIndex = netConclusion.lastIndexOf(' ');
      if (lastSpaceIndex > targetLength * 0.8) { // If we can find a space in the last 20% of text
        netConclusion = netConclusion.substring(0, lastSpaceIndex).trim();
      }
      netConclusion += "...";
    }
    
    return netConclusion || "Analysis pending or unavailable.";
  };

  return (
    <div className="min-h-screen bg-gray-50">
    
      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Active Queries Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Queries</h2>
                  <span className="text-sm text-gray-500">{activeQueries.length} queries</span>
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="px-6 py-4 border-b border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search queries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="createdAt">Date</option>
                      <option value="urgency">Urgency</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Queries Grid */}
              <div className="p-6">
                {activeQueries.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active queries</h3>
                    <p className="text-gray-500">All queries have been resolved!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeQueries.map((query) => (
                      <div
                        key={query._id}
                        onClick={() => fetchQueryThreads(query._id)}
                        className={`group p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedQuery?._id === query._id
                            ? "border-blue-300 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                              {query.title}
                            </h3>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(query.status)}`}>
                              {getStatusIcon(query.status)}
                              <span>{query.status?.replace("_", " ").toUpperCase()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{query.author?.name || "Unknown User"}</span>
                          </div>
                          
                          {query.address && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{query.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                          </div>

                          {query.urgencyLabel && (
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(query.urgencyLabel)}`}>
                              Urgency: {query.urgencyLabel}
                              {typeof query.urgencyScore === 'number' && (
                                <span className="ml-1">({query.urgencyScore}/5)</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <MessageSquare className="w-3 h-3" />
                              <span>{query.objects?.length || 0} replies</span>
                            </div>
                            <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700">
                              <Eye className="w-3 h-3" />
                              <span className="text-xs font-medium">View</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Query Details or Resolved Queries */}
          <div className="xl:col-span-2">
            {selectedQuery ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Query Details</h3>
                    <button
                      onClick={() => setSelectedQuery(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedQuery.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{cleanedDescription}</p>
                    {selectedQuery.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedQuery.address}</span>
                      </div>
                    )}
                    
                    {/* Query Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Created: {new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedQuery.updatedAt && selectedQuery.updatedAt !== selectedQuery.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated: {new Date(selectedQuery.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Net Conclusion Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      AI-Powered Net Conclusion
                    </h5>
                    
                    {/* Urgency Information */}
                    {selectedQuery.urgencyLabel && (
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-600">Urgency Level:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedQuery.urgencyLabel === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                            selectedQuery.urgencyLabel === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            selectedQuery.urgencyLabel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {selectedQuery.urgencyLabel}
                            {selectedQuery.urgencyScore && ` (${selectedQuery.urgencyScore}/5)`}
                          </span>
                        </div>
                        {selectedQuery.urgencyReason && (
                          <span className="text-xs text-gray-500 italic">
                            &quot;{selectedQuery.urgencyReason}&quot;
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Main Conclusion */}
                    <div className="bg-white/60 rounded p-3 border border-blue-100">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {generateNetConclusion(selectedQuery)}
                      </p>
                    </div>
                    
                    {/* Analysis Source */}
                    <div className="mt-2 text-xs text-blue-600 flex items-center">
                      <Brain className="w-3 h-3 mr-1" />
                      <span>
                        Generated from {selectedQuery.attachments?.length || 0} attachments and user complaint data
                      </span>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  {selectedQuery.attachments && selectedQuery.attachments.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Attachments ({selectedQuery.attachments.length})
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedQuery.attachments.map((attachment, idx) => {
                          const isImage = (attachment.mimetype || "").startsWith("image/");
                          const isVideo = (attachment.mimetype || "").startsWith("video/");
                          const attachmentAnalysis = selectedQuery.attachmentAnalyses?.find(
                            analysis => analysis.filename === attachment.filename || analysis.originalName === attachment.originalName
                          );
                          
                          return (
                            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              {/* File Preview */}
                              <div className="p-3 border-b border-gray-100">
                                {isImage ? (
                                  <div className="relative">
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.originalName} 
                                      className="w-full h-32 object-cover rounded"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-full h-32 bg-gray-100 items-center justify-center rounded">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                      <span className="text-xs text-gray-500 ml-2">Image Unavailable</span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                      <ImageIcon className="w-3 h-3 inline mr-1" />
                                      Image
                                    </div>
                                  </div>
                                ) : isVideo ? (
                                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">
                                    <VideoIcon className="w-8 h-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 ml-2">Video File</span>
                                  </div>
                                ) : (
                                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 ml-2">Document</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700 truncate">
                                    {attachment.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>

                              {/* Removed per-attachment AI analysis as requested */}

                              {/* Download Link */}
                              <div className="p-3 bg-gray-50 border-t border-gray-100">
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View/Download
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) :(<div></div> )}

                  {/* Attachment AI Analyses Section */}
                  {selectedQuery.attachmentAnalyses && selectedQuery.attachmentAnalyses.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Analysis of Attachments ({selectedQuery.attachmentAnalyses.length})
                      </h5>
                      <div className="space-y-3">
                        {selectedQuery.attachmentAnalyses.map((analysis, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <h6 className="font-medium text-blue-900 text-sm">
                                {analysis.filename || analysis.originalName || `File ${idx + 1}`}
                              </h6>
                            </div>
                            
                            {analysis.description && (
                              <div className="mb-3">
                                <h6 className="text-xs font-semibold text-blue-800 mb-1">Content Analysis:</h6>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                  {analysis.description}
                                </p>
                              </div>
                            )}
                            
                            {analysis.summary && (
                              <div>
                                <h6 className="text-xs font-semibold text-blue-800 mb-1">Municipal Summary:</h6>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                  {analysis.summary}
                                </p>
                              </div>
                            )}
                            
                            {analysis.metadata && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <h6 className="text-xs font-semibold text-blue-800 mb-1">Technical Details:</h6>
                                <p className="text-xs text-blue-600 font-mono">
                                  {JSON.stringify(analysis.metadata, null, 2)}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{selectedQuery.author?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Status:</label>
                      <select
                        value={selectedQuery.status}
                        onChange={(e) => updateQueryStatus(selectedQuery._id, e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Threads */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {threads.map((thread, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        thread.authorType === "DepartmentMember" 
                          ? "bg-blue-50 border border-blue-200" 
                          : "bg-gray-50 border border-gray-200"
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs font-medium ${
                            thread.authorType === "DepartmentMember" ? "text-blue-700" : "text-gray-700"
                          }`}>
                            {thread.authorType === "DepartmentMember" 
                              ? (thread.authorDetails?.name || "Department") 
                              : (thread.authorDetails?.name || "User")
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(thread.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{thread.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Conditional Content Based on Query Status */}
                  {selectedQuery.status === "resolved" ? (
                    /* Feedback Display for Resolved Queries */
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h3 className="text-sm font-semibold text-green-800 mb-1">
                          Query Resolved
                        </h3>
                        <p className="text-xs text-green-700">
                          This query has been marked as resolved. No further responses can be added.
                        </p>
                      </div>
                      {selectedQuery.feedback && (
                        <FeedbackDisplay feedback={selectedQuery.feedback} />
                      )}
                    </div>
                  ) : (
                    /* Add Thread for Open/In Progress Queries */
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Response
                        </label>
                        <textarea
                          placeholder="Type your response..."
                          value={newThread}
                          onChange={(e) => setNewThread(e.target.value)}
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="4"
                        />
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Resolved Queries</h3>
                </div>
                <div className="p-6">
                  {resolvedQueries.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No resolved queries yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resolvedQueries.slice(0, 10).map((query) => (
                        <div
                          key={query._id}
                          onClick={() => fetchQueryThreads(query._id)}
                          className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
                        >
                          <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {query.title}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{query.author?.name}</span>
                              <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                            </div>
                            {query.address && (
                              <div className="flex items-center space-x-1 text-xs text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{query.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {resolvedQueries.length > 10 && (
                        <div className="text-center pt-3">
                          <p className="text-xs text-gray-500">
                            +{resolvedQueries.length - 10} more resolved queries
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
