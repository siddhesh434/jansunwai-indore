"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-blue-900">
          Jansunwai Indore
        </span>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
        >
          Citizen Login
        </button>
        <button
          onClick={() => router.push("/department/login")}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Department Login
        </button>
      </div>
    </nav>
  );
}
