// app/page.js
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  User,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem("userId");
    const deptId = localStorage.getItem("departmentMemberId");

    if (userId) router.push("/dashboard");
    if (deptId) router.push("/department/dashboard");
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {t("heroTitle")} <br />
              <span className="text-blue-600">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl">
              {t("heroDescription")}
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
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("secureLoginOptions")}
                </h3>
              </div>

              {/* Citizen Login Card */}
              <div
                onClick={() => router.push("/login")}
                className="group border border-gray-200 rounded-xl p-6 mb-4 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("citizenLoginCard")}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("citizenLoginDesc")}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Department Login Card */}
              <div
                onClick={() => router.push("/department/login")}
                className="group border border-gray-200 rounded-xl p-6 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("departmentLoginCard")}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("departmentLoginDesc")}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-30"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-200 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
