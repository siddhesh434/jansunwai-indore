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
  RotateCcw,
  Grid3X3,
  List,
  FileSpreadsheet,
  Users,
  Calendar,
  HelpCircle,
  LogOut,
  Home,
  Star,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import MapAddressSelector from "./MapAddressSelector";
import AttachmentAI from "./components/AttachmentAI";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackDisplay from "../components/FeedbackDisplay";
import { clampWords } from "../api/lib/ai/wordClamp";

// Status configuration
const STATUS_CONFIG = {
  open: {
    label: "Pending",
    color: "blue",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
    dotClass: "bg-blue-500",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "amber",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotClass: "bg-amber-500",
    icon: Settings,
  },
  resolved: {
    label: "Resolved",
    color: "green",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
    dotClass: "bg-green-500",
    icon: CheckCircle2,
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
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bgClass} ${config.textClass} ${config.borderClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </div>
  );
};

// Status card component for dashboard overview
const StatusCard = ({ icon: Icon, title, count, subtitle, color, onClick, isActive }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-white hover:bg-blue-50',
    amber: 'border-amber-200 bg-white hover:bg-amber-50', 
    green: 'border-green-200 bg-white hover:bg-green-50',
  };
  
  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    amber: 'text-amber-600 bg-amber-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <div 
      className={`p-3 sm:p-6 rounded-lg border cursor-pointer transition-all duration-200 ${colorClasses[color]} ${
        isActive ? 'ring-2 ring-blue-500 border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 sm:p-2 rounded-lg ${iconColors[color]}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">{title}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{count}</div>
          <div className="text-xs sm:text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);

// Query card component for list view
const QueryCard = ({ query, isSelected, onClick, viewMode }) => {
  const config = STATUS_CONFIG[query.status?.toLowerCase()] || STATUS_CONFIG.open;
  
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onClick(query._id)}
        className={`group p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border bg-white hover:shadow-md ${
          isSelected ? "border-blue-300 shadow-md ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-2 line-clamp-2">
              {query.title || "Untitled Query"}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-3 mb-3">
              {query.description || "No description available"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={query.status} />
          <span className="text-xs text-gray-500">
            {new Date(query.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {query.objects?.length || 0} messages
          </span>
          {query.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Paperclip className="w-3 h-3" />
              {query.attachments.length}
            </span>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={() => onClick(query._id)}
      className={`group p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border bg-white hover:shadow-sm ${
        isSelected ? "border-blue-300 shadow-sm ring-1 ring-blue-100" : "border-gray-200 hover:border-blue-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
            {query.title || "Untitled Query"}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            {query.description || "No description available"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6 text-xs text-gray-500">
          <StatusBadge status={query.status} />
          
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">{query.objects?.length || 0}</span>
          </span>
          
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">{new Date(query.createdAt).toLocaleDateString()}</span>
          </span>
          
          {query.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Paperclip className="w-3 h-3" />
              <span className="hidden sm:inline">{query.attachments.length}</span>
            </span>
          )}
          
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
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
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      <h4 className="text-xs font-semibold text-gray-900 mb-3">Progress Status</h4>
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const completed = idx <= currentIdx;
          const isLast = idx === STATUS_STEPS.length - 1;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                  completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className={`mt-1 text-xs font-medium text-center ${
                  completed ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${
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



// Query Sidebar
const QuerySidebar = ({ 
  query, 
  threads, 
  onClose, 
  newThread, 
  setNewThread, 
  handleAddThread, 
  threadsContainerRef,
  isMobile,
  onFeedbackSubmitted
}) => {
    const [sidebarHeaderCollapsed, setSidebarHeaderCollapsed] = useState(false);
    
    // Debug logging
    console.log("QuerySidebar received query:", query);
    console.log("Query feedback data:", query?.feedback);
    
  if (!query) return null;
  return (
   <div className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col ${
     isMobile ? 'w-full' : 'w-[28rem]'
   }`} style={{ height: '100vh' }}>
      {/* Sidebar Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              {isMobile && (
                <button
                  onClick={onClose}
                  className="mr-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {query.title || "Query Details"}
              </h2>
              {!isMobile && (
                <button
                  onClick={onClose}
                  className="ml-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <StatusBadge status={query.status} />
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(query.updatedAt || query.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <ProgressStepper currentStatus={query.status} />
         {/* Make this section collapsible */}
  <button 
    onClick={() => setSidebarHeaderCollapsed(!sidebarHeaderCollapsed)}
    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
  >
    <span>Query Details</span>
    <ChevronDown className={`w-4 h-4 transition-transform ${sidebarHeaderCollapsed ? 'rotate-180' : ''}`} />
  </button>

  {!sidebarHeaderCollapsed && (
    <div className="space-y-3 max-h-48 overflow-y-auto">
      {/* Move description, location, and attachments here */}
      {/* Description */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <h3 className="text-xs font-semibold text-gray-900 mb-1">Description</h3>
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
            {query.description || "No description available"}
          </p>
        </div>

        {/* Location */}
        {query.address && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              Location
            </h3>
            <p className="text-xs text-gray-700 line-clamp-2">{query.address}</p>
            {query.latitude && query.longitude && (
              <div className="mt-1 text-xs text-blue-600 font-mono">
                {query.latitude.toFixed(6)}, {query.longitude.toFixed(6)}
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {query.attachments?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-gray-600" />
              Attachments ({query.attachments.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {query.attachments.slice(0, 4).map((att, idx) => {
                const isImage = (att.mimetype || "").startsWith("image/");
                const isVideo = (att.mimetype || "").startsWith("video/");
                return (
                  <div key={idx} className="border border-gray-200 rounded overflow-hidden bg-white hover:shadow-sm transition-shadow">
                    {isImage ? (
                      <a href={att.url} target="_blank" rel="noreferrer" className="block group">
                        <img src={att.url} alt={att.originalName} className="w-full h-16 object-cover group-hover:opacity-90 transition-opacity" />
                        <div className="p-1 text-xs text-gray-700 truncate flex items-center gap-1">
                          <ImageIcon className="w-2 h-2 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{att.originalName}</span>
                        </div>
                      </a>
                    ) : isVideo ? (
                      <div>
                        <video src={att.url} className="w-full h-16 object-cover bg-black" />
                        <a href={att.url} target="_blank" rel="noreferrer" className="block p-1 text-xs text-gray-700 truncate flex items-center gap-1 hover:bg-gray-50">
                          <VideoIcon className="w-2 h-2 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{att.originalName}</span>
                        </a>
                      </div>
                    ) : (
                      <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 p-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                        <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="truncate" title={att.originalName}>{att.originalName}</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            {query.attachments.length > 4 && (
              <p className="text-xs text-gray-500 mt-2">+{query.attachments.length - 4} more files</p>
            )}
          </div>
        )}
    </div>
  )}

  
      </div>

      {/* Conversation Thread */}
     
<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
  <div ref={threadsContainerRef} className="flex-1 overflow-y-auto bg-gray-50 p-3" style={{ minHeight: 0 }}>
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {query.status === "resolved" ? "No messages in this conversation" : "No messages yet"}
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                {query.status === "resolved" 
                  ? "This conversation has ended as the complaint was resolved" 
                  : "Start a conversation about this query"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread, index) => {
                const isAdmin = thread.authorType === "DepartmentMember";
                return (
                  <div key={index} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] ${isAdmin ? 'mr-auto' : 'ml-auto'}`}>
                      <div className={`rounded-lg p-2.5 shadow-sm border text-xs ${
                        isAdmin 
                          ? 'bg-white border-gray-200' 
                          : 'bg-blue-600 text-white border-blue-600'
                      }`}>
                        <div className="flex items-center gap-1 mb-1">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isAdmin ? 'bg-green-100' : 'bg-blue-500'
                          }`}>
                            {isAdmin ? (
                              <Building2 className="w-2 h-2 text-green-600" />
                            ) : (
                              <User className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className={`text-xs font-semibold ${
                            isAdmin ? 'text-green-800' : 'text-blue-100'
                          }`}>
                            {isAdmin 
                              ? (thread.authorDetails?.name || 'Department') 
                              : (thread.authorDetails?.name || 'You')
                            }
                          </span>
                          <span className={`text-xs ${
                            isAdmin ? 'text-gray-500' : 'text-blue-100'
                          }`}>
                            {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p className={`leading-relaxed whitespace-pre-wrap ${
                          isAdmin ? 'text-gray-900' : 'text-white'
                        }`}>
                          {thread.message}
                        </p>

                        {/* Thread Attachments */}
                        {Array.isArray(thread.attachments) && thread.attachments.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {thread.attachments.map((att, i) => {
                              const isImage = (att.mimetype || '').startsWith('image/');
                              const isVideo = (att.mimetype || '').startsWith('video/');
                              return (
                                <div key={i} className="border border-gray-200 rounded overflow-hidden bg-white">
                                  {isImage ? (
                                    <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                      <img src={att.url} alt={att.originalName} className="w-full h-12 object-cover" />
                                      <div className="p-1 text-xs text-gray-700 truncate flex items-center gap-1">
                                        <ImageIcon className="w-2 h-2 text-blue-500 flex-shrink-0" />
                                        <span className="truncate">{att.originalName}</span>
                                      </div>
                                    </a>
                                  ) : isVideo ? (
                                    <div>
                                      <video src={att.url} className="w-full h-12 object-cover bg-black" />
                                      <a href={att.url} target="_blank" rel="noreferrer" className="block p-1 text-xs text-gray-700 truncate flex items-center gap-1">
                                        <VideoIcon className="w-2 h-2 text-blue-500 flex-shrink-0" />
                                        <span className="truncate">{att.originalName}</span>
                                      </a>
                                    </div>
                                  ) : (
                                    <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 p-1 text-xs text-gray-700 hover:bg-gray-50">
                                      <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
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
          )}
        </div>

        {/* Conditional Content Based on Query Status */}
        {query.status === "resolved" ? (
          /* Feedback Section for Resolved Queries */
          <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
            {console.log("Query status:", query.status, "Query feedback:", query.feedback)}
            {query.feedback ? (
              <FeedbackDisplay feedback={query.feedback} />
            ) : (
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-green-800 mb-1">
                    Complaint Resolved!
                  </h3>
                  <p className="text-xs text-green-700 mb-3">
                    Your complaint has been successfully resolved. Please share your feedback to help us improve our services.
                  </p>
                </div>
                <FeedbackForm 
                  key={`feedback-${query._id}-${query.feedback ? 'submitted' : 'not-submitted'}`}
                  queryId={query._id} 
                  onFeedbackSubmitted={onFeedbackSubmitted}
                />
              </div>
            )}
          </div>
        ) : (
          /* Chat Input for Open/In Progress Queries */
          <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
            <div className="flex gap-2">
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-xs"
                rows="2"
              />
              <button
                onClick={handleAddThread}
                disabled={!newThread.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter to send</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({ query: "", address: "", latitude: null, longitude: null });
  const newQueryRef = useRef({ query: "", address: "", latitude: null, longitude: null });
  const threadsContainerRef = useRef(null);
  const [queryAnalysis, setQueryAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [newThread, setNewThread] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachmentAnalyses, setAttachmentAnalyses] = useState([]);
  const [attachmentAnalysisLoading, setAttachmentAnalysisLoading] = useState(false);
  const [documentRelevanceChecks, setDocumentRelevanceChecks] = useState({});

  // Voice-to-text states
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // Changed default to grid
  
  // Map visibility state
  const [showMap, setShowMap] = useState(false);

  // Mobile states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const router = useRouter();
  const { t } = useLanguage();
  const { user, isAuthenticated, loginUserFromGoogle } = useAuth();

  // Navigation items for sidebar
  const navigationItems = [
    { icon: Home, label: "Dashboard", active: true },
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (width >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Check for Google OAuth authentication via cookies and localStorage
    const checkGoogleAuth = () => {
      // Check for user-session cookie first


      // Check for backup userId cookie (from Google OAuth)
      const backupUserIdCookie = (() => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; google-auth-user-id=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop().split(';').shift();
          return cookieValue;
        }
        return null;
      })();
      
      // Use backup cookie if localStorage is empty
      if (backupUserIdCookie && backupUserIdCookie !== "null" && backupUserIdCookie !== "undefined" && backupUserIdCookie.trim() !== "") {
        if (!localStorage.getItem("userId") || localStorage.getItem("userId") === "null") {
          localStorage.setItem("userId", backupUserIdCookie);
          console.log('Dashboard: Set localStorage from backup cookie:', backupUserIdCookie);
        }
      }

      const userId = localStorage.getItem("userId");
      if (userId && userId !== "null" && userId !== "undefined" && userId.trim() !== "") {
        console.log('Dashboard: User authenticated via Google OAuth:', userId);
        if (!user || !user._id) {
          // Fetch user data if not already loaded
          fetchUserData(userId);
        }
        fetchDepartments();
        return;
      }
    };

    if (!isAuthenticated || !user || !user._id) {
      // Try to check for Google OAuth authentication
      checkGoogleAuth();
      
      if (!isAuthenticated && !localStorage.getItem("userId")) {
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
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  };

  const handleFeedbackSubmitted = async (updatedQuery) => {
    console.log("handleFeedbackSubmitted called with:", updatedQuery);
    
    // Update the selected query with feedback data
    setSelectedQuery(updatedQuery);
    
    // Update the local queries array with the updated query
    setQueries(prevQueries => {
      return prevQueries.map(query => 
        query._id === updatedQuery._id ? updatedQuery : query
      );
    });
    
    // Also refresh the queries list from the server to ensure consistency
    if (user?._id) {
      try {
        console.log("Refreshing queries for user:", user._id);
        const res = await fetch(`/api/users/${user._id}`);
        if (res.ok) {
          const userData = await res.json();
          console.log("User data received:", userData);
          const userQueries = Array.isArray(userData.queries) ? userData.queries : [];
          userQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log("Updated queries list:", userQueries);
          setQueries(userQueries);
        }
      } catch (error) {
        console.error("Error refreshing queries after feedback:", error);
      }
    }
  };

  const handleLocationSelect = (locationData) => {
    setNewQuery(prev => ({
      ...prev,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
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
      
      // Update AuthContext if user is not already set
      if (!user || !user._id) {
        loginUserFromGoogle(userData);
      }
      
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
          departmentName: departments[0]?.departmentName || "Sewage",
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
        departmentName: departments[0]?.departmentName || "Sewage",
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
      // First, try to get the latest query data from the API
      const queryRes = await fetch(`/api/queries/${queryId}`);
      if (queryRes.ok) {
        const queryData = await queryRes.json();
        setSelectedQuery(queryData);
      } else {
        // Fallback to local queries array
        const query = (queries || []).find(q => q._id === queryId);
        if (query) {
          setSelectedQuery(query);
        }
      }
      
      // Fetch conversations from the API with author details
      const res = await fetch(`/api/conversations/${queryId}?includeAuthorDetails=true`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data.conversations || []);
      } else {
        // Fallback to query objects if API fails
        const query = (queries || []).find(q => q._id === queryId);
        if (query) {
          setThreads(query.objects || []);
        }
      }
    } catch (error) {
      console.error("Error fetching query threads:", error);
      // Fallback to query objects if API fails
      const query = (queries || []).find(q => q._id === queryId);
      if (query) {
        setSelectedQuery(query);
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

    if (attachmentAnalysisLoading) {
      alert("Please wait for document analysis to complete before submitting your complaint.");
      return;
    }

    // Check for irrelevant documents
    const irrelevantDocuments = Object.entries(documentRelevanceChecks)
      .filter(([fileName, isRelevant]) => isRelevant === false)
      .map(([fileName]) => fileName);

    if (irrelevantDocuments.length > 0) {
      alert(`Please remove the following irrelevant documents before submitting: ${irrelevantDocuments.join(", ")}`);
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
              lines.push(`   Description: ${(analysis.analysis.description, 50, 60)}`);
            }
            
            if (analysis.analysis.summary) {
              lines.push(`   Municipal Summary: ${(analysis.analysis.summary, 50, 60)}`);
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
      formData.append("latitude", newQuery.latitude || "");
      formData.append("longitude", newQuery.longitude || "");
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
      setNewQuery({ query: "", address: "", latitude: null, longitude: null });
      setQueryAnalysis(null);
             setSelectedFiles([]);
       setAttachmentAnalyses([]);
       setDocumentRelevanceChecks({});
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
    
    let matchesStatus = true;
    if (activeStatusFilter !== "all") {
      if (activeStatusFilter === "pending") {
        matchesStatus = !query.status || query.status.toLowerCase() === "open";
      } else {
        matchesStatus = query.status?.toLowerCase() === activeStatusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  // Calculate counts for status cards
  const getStatusCounts = () => {
    const total = queries?.length || 0;
    const pending = queries?.filter(q => !q.status || q.status.toLowerCase() === "open").length || 0;
    const inProgress = queries?.filter(q => q.status?.toLowerCase() === "in_progress").length || 0;
    const resolved = queries?.filter(q => q.status?.toLowerCase() === "resolved").length || 0;
    
    return { total, pending, inProgress, resolved };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col mobile-content">
      {/* Mobile Header */}
      {(isMobile || isTablet) && (
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between p-4">
            {!showNewQueryForm ? (
              <>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Complaints Management</h1>
                <div className="w-10"></div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    stopVoiceInput();
                    setShowNewQueryForm(false);
                    setNewQuery({ query: "", address: "", latitude: null, longitude: null });
                    setQueryAnalysis(null);
                    setSelectedFiles([]);
                    setAttachmentAnalyses([]);
                    setShowMap(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Create Complaint</h1>
                <div className="w-10"></div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Mobile Sidebar Overlay */}
        {(isMobile || isTablet) && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          (isMobile || isTablet)
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col`}>
          
          {/* Navigation */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigationItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (item.label === "Dashboard" && showNewQueryForm) {
                      stopVoiceInput();
                      setShowNewQueryForm(false);
                      setNewQuery({ query: "", address: "", latitude: null, longitude: null });
                      setQueryAnalysis(null);
                      setSelectedFiles([]);
                      setAttachmentAnalyses([]);
                      setShowMap(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
            
                         {/* Create Complaint Button - Desktop Only */}
             {!showNewQueryForm && !isMobile && !isTablet && (
               <div className="px-3 mt-6">
                 <button
                   onClick={() => setShowNewQueryForm(true)}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 justify-center shadow-sm hover:shadow-md"
                 >
                   <Plus className="w-5 h-5" />
                   <span>Create Complaint</span>
                 </button>
               </div>
             )}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Adi Jain'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || 'ce220004003@iiti.ac.in'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden mobile-safe-area ${selectedQuery && !isMobile ? 'pr-[28rem]' : ''} ${selectedQuery && isMobile ? 'hidden' : ''}`}>

          {/* Main Dashboard View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    {showNewQueryForm ? "Create New Complaint" : "Complaints Management"}
                  </h1>
                  {showNewQueryForm && (
                    <p className="text-sm text-gray-600 mt-1">Describe your complaint and we&apos;ll route it to the right department</p>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {!showNewQueryForm && (
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {showNewQueryForm && (
                    <button
                      onClick={() => {
                        stopVoiceInput();
                        setShowNewQueryForm(false);
                        setNewQuery({ query: "", address: "", latitude: null, longitude: null });
                        setQueryAnalysis(null);
                        setSelectedFiles([]);
                        setAttachmentAnalyses([]);
                        setShowMap(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                      <span className="sm:hidden">Back</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

                         {/* Content Area */}
             {showNewQueryForm ? (
               /* Create Complaint Form */
               <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                 <div className="max-w-7xl mx-auto">
                   <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                     {/* Left Column - Form Inputs */}
                     <div className="space-y-6">
                       {/* Query Input */}
                       <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
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
                       <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                         <label className="block text-sm font-semibold text-gray-900 mb-3">
                           Location <span className="text-gray-500 font-normal">(Optional but recommended)</span>
                         </label>
                         <MapAddressSelector
                           value={newQuery.address}
                           onChange={(value) => setNewQuery({ ...newQuery, address: value })}
                           onLocationSelect={handleLocationSelect}
                           placeholder="Search or click on map to select address..."
                           showMap={showMap}
                           onToggleMap={() => setShowMap(!showMap)}
                         />
                         <p className="text-xs text-gray-500 mt-2">
                           Providing an accurate location helps departments respond more effectively
                         </p>
                       </div>

                       {/* File Attachments */}
                       <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                         <label className="block text-sm font-semibold text-gray-900 mb-3">
                           Attach Supporting Files
                         </label>
                                                 <AttachmentAI
                          onAnalyzed={(items) => {
                            setAttachmentAnalyses(items);
                            setSelectedFiles(items.map((i) => i.file).filter(Boolean));
                          }}
                          onLoadingChange={(loading) => {
                            setAttachmentAnalysisLoading(loading);
                          }}
                          onRelevanceCheck={(relevanceChecks) => {
                            setDocumentRelevanceChecks(relevanceChecks);
                          }}
                          query={newQuery.query}
                        />
                         <p className="text-xs text-gray-500 mt-2">
                           Upload photos, videos, or documents that support your complaint
                         </p>
                         
                                                   {/* Document Analysis Loading Indicator */}
                          {attachmentAnalysisLoading && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <LoadingSpinner size="sm" />
                                <div>
                                  <p className="text-sm font-medium text-amber-800">Analyzing uploaded documents...</p>
                                  <p className="text-xs text-amber-700 mt-1">Please wait while we process your files</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Irrelevant Documents Warning */}
                          {Object.values(documentRelevanceChecks).some(relevant => relevant === false) && (
                            <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-red-900 mb-2">⚠️ SUBMISSION BLOCKED - Irrelevant Documents</p>
                                  <p className="text-sm text-red-800 mb-2">
                                    The following documents are not related to municipal complaints and must be removed:
                                  </p>
                                  <ul className="text-xs text-red-700 space-y-1 mb-3">
                                    {Object.entries(documentRelevanceChecks)
                                      .filter(([fileName, isRelevant]) => isRelevant === false)
                                      .map(([fileName]) => (
                                        <li key={fileName} className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                          <span className="font-medium">{fileName}</span>
                                        </li>
                                      ))}
                                  </ul>
                                  <p className="text-xs text-red-700 font-medium">
                                    Only upload documents that directly relate to your municipal complaint (infrastructure, services, etc.)
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                       </div>

                                               {/* Action Buttons - Desktop Only */}
                        <div className="hidden lg:flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                          <button
                            onClick={handleCreateQuery}
                            disabled={!queryAnalysis || !newQuery.query.trim() || queryAnalysis.detailsSufficient === false || attachmentAnalysisLoading || Object.values(documentRelevanceChecks).some(relevant => relevant === false)}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
                          >
                            {analyzing ? (
                              <div className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                Analyzing...
                              </div>
                            ) : attachmentAnalysisLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                Analyzing Documents...
                              </div>
                            ) : queryAnalysis?.detailsSufficient === false ? (
                              "Cannot Submit - Details Insufficient"
                            ) : Object.values(documentRelevanceChecks).some(relevant => relevant === false) ? (
                              "Cannot Submit - Remove Irrelevant Documents"
                            ) : (
                              "Submit Complaint"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              stopVoiceInput();
                              setShowNewQueryForm(false);
                              setNewQuery({ query: "", address: "", latitude: null, longitude: null });
                              setQueryAnalysis(null);
                              setSelectedFiles([]);
                              setAttachmentAnalyses([]);
                              setShowMap(false);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors border border-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                     </div>

                     {/* Right Column - AI Analysis */}
                     <div className="space-y-6">
                       {/* Analysis Loading */}
                       {analyzing && (
                         <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sticky top-6">
                           <div className="flex items-center gap-4">
                             <LoadingSpinner size="md" />
                             <div>
                               <p className="font-semibold text-blue-900">Analyzing your complaint...</p>
                               <p className="text-sm text-blue-700 mt-1">We&apos;re determining the best department to handle your request</p>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* Analysis Results */}
                       {queryAnalysis && !analyzing && (
                         <div className={`rounded-xl border p-6 shadow-sm sticky top-6 ${
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
                                   <div className="flex-1">
                                     <span className="text-sm text-gray-700 break-words">{newQuery.address}</span>
                                     {newQuery.latitude && newQuery.longitude && (
                                       <div className="mt-1 text-xs text-gray-500 font-mono">
                                         {newQuery.latitude.toFixed(6)}, {newQuery.longitude.toFixed(6)}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             )}

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

                             {/* Submission Warning */}
                             {queryAnalysis.detailsSufficient === false && (
                               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                          </div>
                        )}

                        {/* Action Buttons - Mobile/Tablet Only */}
                        <div className="lg:hidden flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                          <button
                            onClick={handleCreateQuery}
                            disabled={!queryAnalysis || !newQuery.query.trim() || queryAnalysis.detailsSufficient === false || attachmentAnalysisLoading || Object.values(documentRelevanceChecks).some(relevant => relevant === false)}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
                          >
                            {analyzing ? (
                              <div className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                Analyzing...
                              </div>
                            ) : attachmentAnalysisLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <LoadingSpinner size="sm" />
                                Analyzing Documents...
                              </div>
                            ) : queryAnalysis?.detailsSufficient === false ? (
                              "Cannot Submit - Details Insufficient"
                            ) : Object.values(documentRelevanceChecks).some(relevant => relevant === false) ? (
                              "Cannot Submit - Remove Irrelevant Documents"
                            ) : (
                              "Submit Complaint"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              stopVoiceInput();
                              setShowNewQueryForm(false);
                              setNewQuery({ query: "", address: "", latitude: null, longitude: null });
                              setQueryAnalysis(null);
                              setSelectedFiles([]);
                              setAttachmentAnalyses([]);
                              setShowMap(false);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors border border-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
              /* Dashboard View */
              <>
                                 {/* Create Complaint Button - Mobile/Tablet Only */}
                 {(isMobile || isTablet) && !showNewQueryForm && (
                   <div className="p-4 sm:p-6 bg-gray-50 flex-shrink-0">
                     <button
                       onClick={() => setShowNewQueryForm(true)}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-base font-medium transition-colors flex items-center gap-3 justify-center shadow-sm hover:shadow-md"
                     >
                       <Plus className="w-6 h-6" />
                       <span>Create New Complaint</span>
                     </button>
                   </div>
                 )}

                 {/* Status Cards */}
                 <div className="p-4 sm:p-6 bg-gray-50 flex-shrink-0">
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <StatusCard
                      icon={FileText}
                      title="Total"
                      count={statusCounts.total}
                      subtitle="Complaints"
                      color="blue"
                      isActive={activeStatusFilter === "all"}
                      onClick={() => setActiveStatusFilter("all")}
                    />
                    <StatusCard
                      icon={Clock}
                      title="Pending"
                      count={statusCounts.pending}
                      subtitle="Pending Review"
                      color="blue"
                      isActive={activeStatusFilter === "pending"}
                      onClick={() => setActiveStatusFilter("pending")}
                    />
                    <StatusCard
                      icon={Settings}
                      title="In Progress"
                      count={statusCounts.inProgress}
                      subtitle="Being Handled"
                      color="amber"
                      isActive={activeStatusFilter === "in_progress"}
                      onClick={() => setActiveStatusFilter("in_progress")}
                    />
                    <StatusCard
                      icon={CheckCircle2}
                      title="Resolved"
                      count={statusCounts.resolved}
                      subtitle="Fixed Issues"
                      color="green"
                      isActive={activeStatusFilter === "resolved"}
                      onClick={() => setActiveStatusFilter("resolved")}
                    />
                  </div>

                  {/* Advanced Filters */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                      </div>
                      <button 
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("all");
                          setActiveStatusFilter("all");
                        }}
                        className="sm:ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Filters
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: "All Complaints", color: "blue" },
                        { key: "pending", label: "Pending", color: "blue" },
                        { key: "in_progress", label: "In Progress", color: "amber" },
                        { key: "resolved", label: "Resolved", color: "green" }
                      ].map((status) => (
                        <button
                          key={status.key}
                          onClick={() => setActiveStatusFilter(status.key)}
                          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            activeStatusFilter === status.key
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0">
                    {filteredQueries.length === 0 ? (
                      <EmptyState
                        icon={FileSpreadsheet}
                        title="No complaints found"
                        description="Try changing your search or filter criteria"
                      />
                    ) : (
                      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                        <div className={`${
                          viewMode === 'grid' 
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' 
                            : 'space-y-3'
                        }`}>
                          {filteredQueries.map((query) => (
                            <QueryCard
                              key={query._id || `query-${Math.random()}`}
                              query={query}
                              isSelected={selectedQuery?._id === query._id}
                              onClick={handleQuerySelect}
                              viewMode={viewMode}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Query Sidebar */}
        {selectedQuery && (
          <QuerySidebar
            query={selectedQuery}
            threads={threads}
            onClose={() => {
              setSelectedQuery(null);
              setThreads([]);
            }}
            newThread={newThread}
            setNewThread={setNewThread}
            handleAddThread={handleAddThread}
            threadsContainerRef={threadsContainerRef}
            isMobile={isMobile}
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />
        )}
      </div>


    </div>
  );
}