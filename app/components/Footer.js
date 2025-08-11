"use client";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold">Jansunwai Indore</span>
          </div>
          
          {/* Quick Links */}
          <div className="text-center">
            <h3 className="font-semibold mb-3 text-blue-100">Quick Links</h3>
            <div className="space-y-2">
              <a href="/" className="block text-blue-200 hover:text-white transition-colors">
                Home
              </a>
              <a href="/about" className="block text-blue-200 hover:text-white transition-colors">
                About Us
              </a>
              <a href="/login" className="block text-blue-200 hover:text-white transition-colors">
                Citizen Login
              </a>
              <a href="/department/login" className="block text-blue-200 hover:text-white transition-colors">
                Department Login
              </a>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-blue-200">{t("governmentOfMP")}</p>
            <p className="text-blue-200 mt-1">
              © {new Date().getFullYear()} {t("allRightsReserved")}
            </p>
            <p className="text-blue-200 mt-2 text-sm">
              Built by Team Indorikaran
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
