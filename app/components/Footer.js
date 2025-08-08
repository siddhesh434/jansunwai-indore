"use client";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold">Jansunwai Indore</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-blue-200">{t("governmentOfMP")}</p>
            <p className="text-blue-200 mt-1">
              © {new Date().getFullYear()} {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
