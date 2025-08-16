"use client";

import { useState } from "react";
import { 
  Brain, 
  MessageSquare, 
  Building2, 
  Users, 
  Shield, 
  Globe, 
  Zap, 
  Target, 
  BarChart3, 
  FileText, 
  MapPin, 
  Mic,
  CheckCircle,
  ArrowRight,
  Github,
  Linkedin,
  Mail
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function AboutPage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Complaint Analysis",
      description: "Advanced artificial intelligence automatically categorizes and routes complaints to the appropriate departments, ensuring faster response times and better service delivery.",
      color: "text-blue-600"
    },
    {
      icon: MessageSquare,
      title: "Intelligent AI Assistant",
      description: "24/7 AI chatbot that helps citizens draft detailed complaints, provides guidance on procedures, and offers real-time support in multiple languages.",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Smart Dashboard Analytics",
      description: "AI-driven insights and predictive analytics help departments optimize their operations, track performance metrics, and identify improvement opportunities.",
      color: "text-purple-600"
    },
    {
      icon: FileText,
      title: "Document AI Analysis",
      description: "AI automatically analyzes uploaded documents, images, and videos to extract relevant information and provide intelligent summaries for faster processing.",
      color: "text-orange-600"
    },
    {
      icon: MapPin,
      title: "Geospatial Intelligence",
      description: "AI-powered location services and mapping integration for precise complaint location tracking and efficient resource allocation.",
      color: "text-red-600"
    },
    {
      icon: Mic,
      title: "Voice-to-Text AI",
      description: "Advanced speech recognition technology allows citizens to submit complaints using voice commands, making the platform more accessible.",
      color: "text-indigo-600"
    }
  ];

  const departments = [
    {
      name: "Sewage",
      description: "Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints",
      icon: Building2,
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Compost with dried leaves",
      description: "Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing",
      icon: Globe,
      color: "bg-cyan-100 text-cyan-800"
    },
    {
      name: "Water Supply",
      description: "Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers",
      icon: Globe,
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Electricity",
      description: "Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs",
      icon: Zap,
      color: "bg-orange-100 text-orange-800"
    },
    {
      name: "Engineering",
      description: "Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals",
      icon: Target,
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Revenue",
      description: "Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents",
      icon: FileText,
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      name: "Fire Brigade",
      description: "Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC",
      icon: Zap,
      color: "bg-red-100 text-red-800"
    },
    {
      name: "Finance",
      description: "Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency",
      icon: FileText,
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Garden",
      description: "Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation",
      icon: Globe,
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      name: "Miscellaneous Complaints",
      description: "General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling",
      icon: Users,
      color: "bg-gray-100 text-gray-800"
    },
    {
      name: "Parking",
      description: "Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations",
      icon: Target,
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      name: "Building Allowance",
      description: "Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight",
      icon: Building2,
      color: "bg-amber-100 text-amber-800"
    },
    {
      name: "Lake Protection",
      description: "Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration",
      icon: Globe,
      color: "bg-teal-100 text-teal-800"
    },
    {
      name: "Social Security",
      description: "Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services",
      icon: Shield,
      color: "bg-pink-100 text-pink-800"
    },
    {
      name: "Govardhan Project",
      description: "Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination",
      icon: Target,
      color: "bg-violet-100 text-violet-800"
    },
    {
      name: "BRTS and BCL",
      description: "Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination",
      icon: Target,
      color: "bg-slate-100 text-slate-800"
    }
  ];

  const developers = [
    {
      name: "Siddhesh Waje",
      role: "Lead Developer",
      description: "Full-stack development, AI integration, system architecture",
      avatar: "SW",
      color: "bg-blue-500"
    },
    {
      name: "Adi Jain",
      role: "Frontend Developer",
      description: "User interface design, responsive layouts, user experience",
      avatar: "AJ",
      color: "bg-green-500"
    },
    {
      name: "Rishi Rathore",
      role: "Backend Developer",
      description: "API development, database design, server infrastructure",
      avatar: "RR",
      color: "bg-purple-500"
    }
  ];

  const aiTechnologies = [
    "OpenAI GPT-4",
    "Anthropic Claude",
    "Groq LLama",
    "Google Gemini",
    "DeepInfra Models",
    "Natural Language Processing",
    "Computer Vision",
    "Speech Recognition",
    "Predictive Analytics",
    "Machine Learning"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {language === "hi" ? "जनसुनवाई इंदौर के बारे में" : "About Jansunwai Indore"}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {language === "hi" 
                ? "इंदौर शहर के नागरिकों के लिए AI-संचालित नगरपालिका शिकायत प्रबंधन प्रणाली"
                : "AI-powered municipal complaint management system for the citizens of Indore city"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "overview", label: language === "hi" ? "अवलोकन" : "Overview" },
              { id: "ai-features", label: language === "hi" ? "AI सुविधाएं" : "AI Features" },
              { id: "departments", label: language === "hi" ? "विभाग" : "Departments" },
              { id: "technology", label: language === "hi" ? "तकनीक" : "Technology" },
              { id: "team", label: language === "hi" ? "टीम" : "Our Team" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === "hi" ? "हमारा मिशन" : "Our Mission"}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {language === "hi"
                  ? "जनसुनवाई इंदौर का उद्देश्य नागरिकों और नगरपालिका प्रशासन के बीच एक डिजिटल पुल बनाना है। हमारी AI-संचालित प्रणाली शिकायतों को तेजी से, कुशलतापूर्वक और पारदर्शिता के साथ संभालती है।"
                  : "Jansunwai Indore aims to create a digital bridge between citizens and municipal administration. Our AI-powered system handles complaints faster, more efficiently, and with complete transparency."
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === "hi" ? "नागरिक केंद्रित" : "Citizen-Centric"}
                </h3>
                <p className="text-gray-600">
                  {language === "hi"
                    ? "नागरिकों की जरूरतों को प्राथमिकता देते हुए सरल और सुलभ सेवाएं"
                    : "Simple and accessible services prioritizing citizen needs"
                  }
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === "hi" ? "AI-संचालित" : "AI-Powered"}
                </h3>
                <p className="text-gray-600">
                  {language === "hi"
                    ? "कृत्रिम बुद्धिमत्ता के माध्यम से तेज और स्मार्ट समाधान"
                    : "Fast and smart solutions through artificial intelligence"
                  }
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === "hi" ? "पारदर्शी" : "Transparent"}
                </h3>
                <p className="text-gray-600">
                  {language === "hi"
                    ? "पूरी प्रक्रिया में पारदर्शिता और जवाबदेही"
                    : "Complete transparency and accountability throughout the process"
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Features Tab */}
        {activeTab === "ai-features" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === "hi" ? "AI सुविधाएं" : "AI Features"}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {language === "hi"
                  ? "हमारी प्रणाली में उन्नत कृत्रिम बुद्धिमत्ता तकनीकों का उपयोग किया गया है जो नागरिक सेवाओं को क्रांतिकारी बनाती हैं"
                  : "Our system leverages cutting-edge artificial intelligence technologies that revolutionize citizen services"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className={`w-12 h-12 ${feature.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "hi" ? "AI तकनीकें" : "AI Technologies"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {aiTechnologies.map((tech, index) => (
                    <div key={index} className="bg-white rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === "departments" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === "hi" ? "विभागीय डैशबोर्ड" : "Department Dashboards"}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {language === "hi"
                  ? "प्रत्येक विभाग के पास अपना विशेष डैशबोर्ड है जो उन्हें शिकायतों को कुशलतापूर्वक प्रबंधित करने में मदद करता है"
                  : "Each department has its specialized dashboard that helps them efficiently manage complaints and track performance"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 ${dept.color} rounded-lg flex items-center justify-center`}>
                      <dept.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{dept.description}</p>
                  
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "hi" ? "विभागीय विशेषताएं" : "Department Features"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="text-left">
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "शिकायत ट्रैकिंग और प्रबंधन" : "Complaint tracking and management"}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "प्रदर्शन विश्लेषण" : "Performance analytics"}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "AI-संचालित अंतर्दृष्टि" : "AI-powered insights"}
                      </li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "स्टाफ प्रबंधन" : "Staff management"}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "रिपोर्ट जनरेशन" : "Report generation"}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {language === "hi" ? "स्वचालित नोटिफिकेशन" : "Automated notifications"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technology Tab */}
        {activeTab === "technology" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === "hi" ? "तकनीकी वास्तुकला" : "Technical Architecture"}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {language === "hi"
                  ? "आधुनिक तकनीकों का उपयोग करके निर्मित एक मजबूत और स्केलेबल प्रणाली"
                  : "A robust and scalable system built using modern technologies"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === "hi" ? "फ्रंटएंड तकनीकें" : "Frontend Technologies"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Next.js</span>
                    <span className="text-green-600 font-semibold">React Framework</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Tailwind CSS</span>
                    <span className="text-blue-600 font-semibold">Styling</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Lucide Icons</span>
                    <span className="text-purple-600 font-semibold">Icon Library</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === "hi" ? "बैकएंड तकनीकें" : "Backend Technologies"}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Node.js</span>
                    <span className="text-green-600 font-semibold">Runtime</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">MongoDB</span>
                    <span className="text-blue-600 font-semibold">Database</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">REST APIs</span>
                    <span className="text-purple-600 font-semibold">API Design</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "hi" ? "AI इंटीग्रेशन" : "AI Integration"}
                </h3>
                <p className="text-gray-700 mb-6">
                  {language === "hi"
                    ? "हमारी प्रणाली कई AI प्रदाताओं के साथ एकीकृत है, जो विश्वसनीयता और प्रदर्शन सुनिश्चित करती है"
                    : "Our system integrates with multiple AI providers ensuring reliability and performance"
                  }
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["OpenAI", "Anthropic", "Groq", "Google"].map((provider, index) => (
                    <div key={index} className="bg-white rounded-lg px-4 py-3 text-center shadow-sm">
                      <div className="font-semibold text-gray-800">{provider}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === "hi" ? "हमारी टीम" : "Our Team"}
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {language === "hi"
                  ? "टीम इंदोरिकरण के प्रतिभाशाली डेवलपर्स द्वारा निर्मित"
                  : "Built by the talented developers of Team Indorikaran"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {developers.map((dev, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className={`w-20 h-20 ${dev.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold`}>
                    {dev.avatar}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{dev.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{dev.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{dev.description}</p>
                  
                  
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "hi" ? "टीम इंदोरिकरण" : "Team Indorikaran"}
                </h3>
                <p className="text-gray-700 mb-6">
                  {language === "hi"
                    ? "इंदौर के युवा प्रतिभाओं का एक समूह जो नवीनतम तकनीकों का उपयोग करके सामाजिक समस्याओं को हल करने के लिए प्रतिबद्ध है"
                    : "A group of young talents from Indore committed to solving social problems using cutting-edge technologies"
                  }
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg">
                  <span>{language === "hi" ? "नवाचार के लिए प्रतिबद्ध" : "Committed to Innovation"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      
    </div>
  );
}
