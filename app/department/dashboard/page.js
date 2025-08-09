"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  User,
  MessageSquare,
  Clock,
  ChevronRight,
  Building2,
  Filter,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function DepartmentDashboard() {
  const [departmentMember, setDepartmentMember] = useState(null);
  const [departmentQueries, setDepartmentQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const departmentMemberId = localStorage.getItem("departmentMemberId");
    if (!departmentMemberId) {
      router.push("/department/login");
      return;
    }
    fetchDepartmentMemberData(departmentMemberId);
  }, []);

  const fetchDepartmentMemberData = async (memberId) => {
    try {
      const res = await fetch(`/api/department-members/${memberId}`);
      const memberData = await res.json();
      setDepartmentMember(memberData);

      // Fetch all queries for this department
      const queriesRes = await fetch(
        `/api/departments/${memberData.department._id}/queries`
      );
      const queriesData = await queriesRes.json();
      setDepartmentQueries(queriesData);
    } catch (error) {
      console.error("Error fetching department member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryThreads = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`);
      const queryData = await res.json();
      setSelectedQuery(queryData);
      setThreads(queryData.objects || []);
    } catch (error) {
      console.error("Error fetching query threads:", error);
    }
  };

  const handleAddThread = async (e) => {
    e?.preventDefault?.();
    if (!selectedQuery || !newThread.trim()) return;

    try {
      const updatedThreads = [
        ...threads,
        {
          message: newThread,
          authorId: departmentMember._id,
          authorType: "DepartmentMember",
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

        // Update query status to in_progress if it was open
        if (selectedQuery.status === "open") {
          await fetch(`/api/queries/${selectedQuery._id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "in_progress" }),
          });
          setSelectedQuery({ ...selectedQuery, status: "in_progress" });
        }
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

  const handleLogout = () => {
    localStorage.removeItem("departmentMemberId");
    router.push("/");
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

  const filteredQueries = departmentQueries.filter((query) => {
    const matchesStatus =
      statusFilter === "all" || query.status === statusFilter;
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t("departmentDashboard")}
            </h1>
            <p className="text-sm text-gray-600">
              {departmentMember?.department?.departmentName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{departmentMember?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            {t("signOut")}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Queries List */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Filters and Search */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchQueriesPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t("allStatus")}</option>
                <option value="open">{t("open")}</option>
                <option value="in_progress">{t("inProgress")}</option>
                <option value="resolved">{t("resolved")}</option>
              </select>
            </div>
          </div>

          {/* Query Count */}
          <div className="px-4 py-2 bg-white border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredQueries.length} of {departmentQueries.length}{" "}
              {t("queriesCount")}
            </p>
          </div>

          {/* Queries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredQueries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t("noQueriesFound")}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("tryAdjustingFilters")}
                </p>
              </div>
            ) : (
              filteredQueries.map((query) => (
                <div
                  key={query._id}
                  onClick={() => fetchQueryThreads(query._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-white hover:shadow-sm border ${
                    selectedQuery?._id === query._id
                      ? "bg-white border-blue-200 shadow-sm"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                        {query.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {t("submittedBy")}{" "}
                        {query.author?.name || t("unknownUser")}
                      </p>
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            query.status
                          )}`}
                        >
                          {query.status?.replace("_", " ").toUpperCase() ||
                            t("open").toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-400">
                          {query.objects?.length || 0} {t("replies")}
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
          {selectedQuery ? (
            <div className="flex-1 flex flex-col">
              {/* Query Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedQuery.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">
                      {t("submittedBy")}{" "}
                      <span className="font-medium">
                        {selectedQuery.author?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedQuery.status}
                      onChange={(e) =>
                        updateQueryStatus(selectedQuery._id, e.target.value)
                      }
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="open">{t("open")}</option>
                      <option value="in_progress">{t("inProgress")}</option>
                      <option value="resolved">{t("resolved")}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t("created")}{" "}
                      {new Date(selectedQuery.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedQuery.status
                    )}`}
                  >
                    {selectedQuery.status?.replace("_", " ").toUpperCase() ||
                      t("open").toUpperCase()}
                  </div>
                </div>
                {selectedQuery.attachments?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedQuery.attachments.map((att, idx) => {
                        const isImage = (att.mimetype || "").startsWith("image/");
                        const isVideo = (att.mimetype || "").startsWith("video/");
                        return (
                          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {isImage ? (
                              <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                <img src={att.url} alt={att.originalName} className="w-full h-28 object-cover" />
                                <div className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><ImageIcon className="w-3 h-3 mr-1 text-gray-500" />{att.originalName}</div>
                              </a>
                            ) : isVideo ? (
                              <div className="w-full">
                                <video src={att.url} controls className="w-full h-28 object-cover bg-black" />
                                <a href={att.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs text-gray-700 truncate flex items-center"><VideoIcon className="w-3 h-3 mr-1 text-gray-500" />{att.originalName}</a>
                              </div>
                            ) : (
                              <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 p-2 text-xs text-gray-700 hover:bg-gray-50">
                                <FileText className="w-4 h-4 text-gray-500" />
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

              {/* Threads Container */}
              <div className="flex-1 flex flex-col min-h-0 max-h-[75vh]">
                {/* Timeline-style Updates List */}
                <div className="flex-1 overflow-y-auto p-6 bg-white/50">
                  {threads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t("noRepliesYetDept")}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t("beFirstToRespond")}
                      </p>
                    </div>
                  ) : (
                    <div className="relative max-w-4xl">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />
                      <div className="space-y-5">
                        {threads.map((thread, index) => {
                          const isAdmin = thread.authorType === "DepartmentMember";
                          return (
                            <div key={index} className="relative pl-12">
                              <div className={`absolute left-1.5 top-2 w-5 h-5 rounded-full border-2 ${isAdmin ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'} flex items-center justify-center`}>
                                {isAdmin ? <Building2 className="w-3 h-3 text-green-600" /> : <User className="w-3 h-3 text-blue-600" />}
                              </div>
                              <div className={`rounded-lg border ${isAdmin ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} p-4`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${isAdmin ? 'text-green-800' : 'text-blue-800'}`}>
                                      {isAdmin ? t('departmentResponseLabel') : t('user')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(thread.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-2 text-gray-900 leading-relaxed whitespace-pre-wrap">
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thread Input */}
                <div className="border-t border-gray-200 p-6">
                  <div className="max-w-4xl">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <textarea
                          placeholder={t("typeResponse")}
                          value={newThread}
                          onChange={(e) => setNewThread(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddThread(e);
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                          rows="3"
                        />
                      </div>
                      <button
                        onClick={handleAddThread}
                        disabled={!newThread.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors shrink-0 flex items-center justify-center"
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
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("selectQuery")}
                </h3>
                <p className="text-gray-600">{t("selectQueryDesc")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
