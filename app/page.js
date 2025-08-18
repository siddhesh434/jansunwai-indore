"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  User,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
} from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, user, departmentMember, databaseConnectionError } = useAuth();
  const [topQueries, setTopQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopQueries = async () => {
      try {
        const response = await fetch('/api/queries/top-urgent');
        if (response.ok) {
          const data = await response.json();
          setTopQueries(data);
        }
      } catch (error) {
        console.error('Error fetching top queries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopQueries();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Wavy Indian Flag Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="wavy-flag">
          <style jsx>{`
            .wavy-flag {
              width: 100%;
              height: 100%;
              position: relative;
              background: linear-gradient(
                to bottom,
                #ff9933 33.33%, /* Saffron */
                #ffffff 33.33%,
                #ffffff 66.66%,
                #138808 66.66% /* Green */
              );
              opacity: 0.3; /* Subtle opacity for professionalism */
            }
            .wavy-flag::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(
                to bottom,
                #ff9933 33.33%,
                #ffffff 33.33%,
                #ffffff 66.66%,
                #138808 66.66%
              );

              transform: skewY(-5deg);
            }
            @keyframes wave {
              0% {
                transform: translateX(0) skewY(-5deg);
              }
              100% {
                transform: translateX(-100%) skewY(-5deg);
              }
            }
          `}</style>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {t("heroTitle")} <br />
                <span className="text-blue-600">{t("heroTitleHighlight")}</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl">
                {t("heroDescription") || "We are working on improving our municipal complaint management system. Track the most urgent issues and see how we're addressing them in real-time."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg transition-colors font-medium"
                >
                  <span>{t("citizenLogin")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push("/department/login")}
                  className="flex items-center justify-center space-x-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-lg transition-colors font-medium"
                >
                  <span>{t("departmentLogin")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Top 3 Urgent Issues
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">We are working on these</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : topQueries.length > 0 ? (
                  <div className="space-y-4">
                    {topQueries.map((query, index) => (
                                             <div
                         key={query._id}
                         className="border border-gray-200 rounded-xl p-4 transition-all"
                       >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              query.urgencyScore >= 4 ? 'bg-red-500' :
                              query.urgencyScore >= 3 ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-600">
                              {query.urgencyLabel || `Score: ${query.urgencyScore}`}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {query.title}
                        </h4>
                        
                        {query.address && (
                          <div className="flex items-center space-x-1 mb-2 text-sm text-blue-600 font-medium">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{query.address}</span>
                          </div>
                        )}
                        
                        {query.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {query.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {query.department && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3" />
                                <span>{query.department.departmentName}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            query.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            query.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {query.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No urgent queries at the moment</p>
                    <p className="text-sm text-gray-400 mt-1">We're working on improving our system</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  >
                    <span>Report Your Issue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200 rounded-full opacity-30"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-red-200 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
        {/* Database Connection Error Banner */}
        {databaseConnectionError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <h3 className="text-red-800 font-medium">Database Connection Issue</h3>
                    <p className="text-red-700 text-sm mt-1">
                      The application cannot connect to the database. Please check your MONGOURL environment variable.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                  >
                    Retry
                  </button>
                  <a
                    href="https://docs.mongodb.com/manual/installation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                  >
                    Setup Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 bg-white">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("howItWorks")}
            </h2>
            <p className="text-gray-600">{t("featuresDescription")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t("raiseQueries"),
                description: t("raiseQueriesDesc"),
                icon: <User className="w-8 h-8 text-blue-600" />,
              },
              {
                title: t("departmentResponse"),
                description: t("departmentResponseDesc"),
                icon: <Building2 className="w-8 h-8 text-blue-600" />,
              },
              {
                title: t("trackProgress"),
                description: t("trackProgressDesc"),
                icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Us Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 bg-gray-50">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("aboutUs") || "About Jansunwai Indore"}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("aboutUsDescription") || "Discover how our AI-powered system revolutionizes municipal complaint management for the citizens of Indore."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                icon: "🤖",
                title: "AI-Powered",
                description: "Advanced artificial intelligence for smart complaint routing and analysis"
              },
              {
                icon: "🏢",
                title: "Department Specific",
                description: "Specialized dashboards for each municipal department"
              },
              {
                icon: "🌍",
                title: "Multilingual",
                description: "Support for English and Hindi languages"
              },
              {
                icon: "📱",
                title: "Modern Interface",
                description: "User-friendly design with real-time updates"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={() => router.push("/about")}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              <span>{t("learnMore") || "Learn More"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}