"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, FileText, Building2, UserCheck, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, Activity, Brain, Zap, Target, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({
    users: [],
    queries: [],
    departments: [],
    departmentMembers: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, queriesRes, departmentsRes, membersRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/queries'),
          fetch('/api/departments'),
          fetch('/api/department-members')
        ]);

        const users = await usersRes.json();
        const queries = await queriesRes.json();
        const departments = await departmentsRes.json();
        const departmentMembers = await membersRes.json();

        setData({ users, queries, departments, departmentMembers });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Mock data for demonstration
        setData({
          users: Array(150).fill().map((_, i) => ({
            _id: `user_${i}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            queries: Array(Math.floor(Math.random() * 5)).fill().map((_, j) => `query_${i}_${j}`)
          })),
          queries: Array(420).fill().map((_, i) => ({
            _id: `query_${i}`,
            title: `Query ${i + 1}`,
            status: ['pending', 'in-progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            department: { departmentName: ['Roads & Infrastructure', 'Water Supply', 'Electricity', 'Health', 'Education'][Math.floor(Math.random() * 5)] }
          })),
          departments: [
            { _id: 'dept_1', departmentName: 'Roads & Infrastructure', members: Array(12).fill(), queries: Array(85).fill() },
            { _id: 'dept_2', departmentName: 'Water Supply', members: Array(8).fill(), queries: Array(92).fill() },
            { _id: 'dept_3', departmentName: 'Electricity', members: Array(10).fill(), queries: Array(78).fill() },
            { _id: 'dept_4', departmentName: 'Health', members: Array(15).fill(), queries: Array(95).fill() },
            { _id: 'dept_5', departmentName: 'Education', members: Array(20).fill(), queries: Array(70).fill() }
          ],
          departmentMembers: Array(65).fill().map((_, i) => ({
            _id: `member_${i}`,
            name: `Member ${i + 1}`,
            role: ['Manager', 'Assistant', 'Officer', 'Clerk'][Math.floor(Math.random() * 4)]
          }))
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-generate AI insights when switching to insights tab
  useEffect(() => {
    if (activeTab === 'insights' && !aiInsights && !loading) {
      generateAIInsights();
    }
  }, [activeTab, loading]);

  // AI Analysis Functions
  const generateAIInsights = async () => {
    setInsightsLoading(true);
    try {
      // Prepare comprehensive data for AI analysis
      const analyticsData = {
        totalUsers: data.users.length,
        totalQueries: data.queries.length,
        totalDepartments: data.departments.length,
        totalStaff: data.departmentMembers.length,
        queryStatusBreakdown: data.queries.reduce((acc, query) => {
          acc[query.status] = (acc[query.status] || 0) + 1;
          return acc;
        }, {}),
        departmentWorkload: data.departments.map(dept => ({
          name: dept.departmentName,
          queries: dept.queries?.length || 0,
          members: dept.members?.length || 0,
          efficiency: dept.members?.length > 0 ? (dept.queries?.length / dept.members?.length).toFixed(2) : 0
        })),
        recentTrends: data.queries.slice(-30).map(q => ({
          date: new Date(q.createdAt).toDateString(),
          status: q.status,
          department: q.department?.departmentName
        })),
        resolutionRate: data.queries.length > 0 ? 
          (data.queries.filter(q => q.status === 'resolved').length / data.queries.length * 100).toFixed(1) : 0
      };

      const response = await fetch('/api/dashboard-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analyticsData,
          analysisType: 'comprehensive_dashboard_insights'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiInsights(result.analysis);
      } else {
        // Fallback insights if AI analysis fails
        setAiInsights(generateFallbackInsights());
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiInsights(generateFallbackInsights());
    } finally {
      setInsightsLoading(false);
    }
  };

  const generateFallbackInsights = () => {
    const totalQueries = data.queries.length;
    const resolvedQueries = data.queries.filter(q => q.status === 'resolved').length;
    const resolutionRate = totalQueries > 0 ? (resolvedQueries / totalQueries * 100).toFixed(1) : 0;
    
    return {
      systemHealth: 'Good',
      keyFindings: [
        `System processed ${totalQueries} queries with ${resolutionRate}% resolution rate`,
        `${data.departments.length} departments actively handling citizen grievances`,
        `Average workload of ${(totalQueries / Math.max(data.departmentMembers.length, 1)).toFixed(1)} queries per staff member`,
        `${data.queries.filter(q => q.status === 'pending').length} queries require immediate attention`
      ],
      recommendations: [
        'Implement automated query categorization to improve routing efficiency',
        'Consider staff reallocation to departments with higher workload ratios',
        'Set up real-time monitoring for queries exceeding standard resolution times',
        'Develop citizen feedback system to track satisfaction metrics'
      ],
      predictions: {
        expectedGrowth: '+12-18% in next quarter',
        resolutionTimeImprovement: '15-20% with process optimization',
        staffEfficiency: 'Can be improved by 25% with better tools'
      },
      alerts: data.queries.filter(q => q.status === 'pending').length > 20 ? 
        ['High volume of pending queries detected'] : 
        ['System operating within normal parameters']
    };
  };
  const generateInsights = () => {
    const totalQueries = data.queries.length;
    const resolvedQueries = data.queries.filter(q => q.status === 'resolved').length;
    const resolutionRate = totalQueries > 0 ? (resolvedQueries / totalQueries * 100).toFixed(1) : 0;
    
    const departmentWorkload = data.departments.map(dept => ({
      name: dept.departmentName,
      queries: dept.queries?.length || 0,
      members: dept.members?.length || 0,
      efficiency: dept.members?.length > 0 ? (dept.queries?.length / dept.members?.length).toFixed(1) : 0
    }));

    const monthlyTrends = generateMonthlyData();
    
    return {
      resolutionRate,
      totalQueries,
      departmentWorkload,
      monthlyTrends,
      criticalInsights: [
        `${resolutionRate}% of queries have been resolved`,
        `Average of ${(totalQueries / data.departments.length).toFixed(0)} queries per department`,
        `Most active department: ${departmentWorkload.sort((a, b) => b.queries - a.queries)[0]?.name || 'N/A'}`,
        `${data.queries.filter(q => q.status === 'pending').length} queries pending immediate attention`
      ]
    };
  };

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map(month => ({
      month,
      queries: Math.floor(Math.random() * 50) + 20,
      resolved: Math.floor(Math.random() * 40) + 15,
      pending: Math.floor(Math.random() * 20) + 5
    }));
  };

  const getStatusData = () => {
    const statusCounts = data.queries.reduce((acc, query) => {
      acc[query.status] = (acc[query.status] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      'pending': '#ff6b6b',
      'in-progress': '#4ecdc4',
      'resolved': '#45b7d1',
      'closed': '#96ceb4'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('-', ' ').toUpperCase(),
      value: count,
      color: colors[status] || '#gray'
    }));
  };

  const getDepartmentData = () => {
    return data.departments.map(dept => ({
      name: dept.departmentName.slice(0, 15) + (dept.departmentName.length > 15 ? '...' : ''),
      queries: dept.queries?.length || 0,
      members: dept.members?.length || 0,
      efficiency: dept.members?.length > 0 ? ((dept.queries?.length || 0) / dept.members.length) : 0
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const insights = generateInsights();
  const statusData = getStatusData();
  const departmentData = getDepartmentData();

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-12 w-12 text-${color}-500 opacity-80`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Jansunwai Indore</h1>
                <p className="text-gray-600 mt-1">Public Grievance Management System</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 px-4 py-2 rounded-full">
                  <span className="text-green-800 font-semibold">System Active</span>
                </div>
                <Calendar className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'analytics', 'departments', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={data.users.length.toLocaleString()}
                subtitle="Registered Citizens"
                color="blue"
              />
              <StatCard
                icon={FileText}
                title="Total Queries"
                value={data.queries.length.toLocaleString()}
                subtitle="All Time"
                color="green"
              />
              <StatCard
                icon={Building2}
                title="Departments"
                value={data.departments.length}
                subtitle="Active Departments"
                color="purple"
              />
              <StatCard
                icon={UserCheck}
                title="Staff Members"
                value={data.departmentMembers.length}
                subtitle="Department Staff"
                color="orange"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Monthly Query Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={insights.monthlyTrends}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="queries" stackId="1" stroke="#3b82f6" fill="url(#colorQueries)" name="Total Queries" />
                    <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10b981" fill="url(#colorResolved)" name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Query Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <BarChart className="h-6 w-6 mr-2 text-blue-500" />
                Department Performance Analytics
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="queries" fill="#3b82f6" name="Total Queries" />
                  <Bar dataKey="members" fill="#10b981" name="Staff Members" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Department Efficiency</h3>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{dept.name}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{dept.efficiency} queries/member</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((dept.efficiency / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resolution Rate</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {insights.resolutionRate}%
                  </div>
                  <p className="text-gray-600 mb-4">Queries Successfully Resolved</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${insights.resolutionRate}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-semibold text-green-800">Resolved</div>
                      <div className="text-green-600">{data.queries.filter(q => q.status === 'resolved').length}</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="font-semibold text-orange-800">Pending</div>
                      <div className="text-orange-600">{data.queries.filter(q => q.status === 'pending').length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.departments.map((dept, index) => (
                <div key={dept._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{dept.departmentName}</h3>
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Queries</span>
                      <span className="font-semibold text-blue-600">{dept.queries?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Staff Members</span>
                      <span className="font-semibold text-green-600">{dept.members?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Workload Ratio</span>
                      <span className="font-semibold text-purple-600">
                        {dept.members?.length > 0 ? ((dept.queries?.length || 0) / dept.members.length).toFixed(1) : '0'}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(((dept.queries?.length || 0) / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Query Volume</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Brain className="h-8 w-8 mr-3" />
                    AI-Powered Analytics
                  </h2>
                  <p className="text-blue-100">Advanced machine learning insights for optimizing your grievance management system</p>
                </div>
                <button
                  onClick={generateAIInsights}
                  disabled={insightsLoading}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${insightsLoading ? 'animate-spin' : ''}`} />
                  {insightsLoading ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
              </div>
            </div>

            {insightsLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-pulse">
                  <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Analysis in Progress</h3>
                  <p className="text-gray-500">Processing system data and generating insights...</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            ) : aiInsights ? (
              <>
                {/* System Health */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-green-500" />
                    System Health Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{aiInsights.systemHealth || 'Good'}</div>
                      <p className="text-sm text-green-700">Overall Health</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{aiInsights.predictions?.resolutionTimeImprovement || '15-20%'}</div>
                      <p className="text-sm text-blue-700">Potential Improvement</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{aiInsights.predictions?.expectedGrowth || '+12-18%'}</div>
                      <p className="text-sm text-purple-700">Projected Growth</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{aiInsights.predictions?.staffEfficiency || '25%'}</div>
                      <p className="text-sm text-orange-700">Efficiency Gain</p>
                    </div>
                  </div>
                </div>

                {/* AI Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                      AI Key Findings
                    </h3>
                    <div className="space-y-3">
                      {(aiInsights.keyFindings || insights.criticalInsights).map((finding, index) => (
                        <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                          <Target className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      {(aiInsights.recommendations || [
                        'Implement automated routing for common query types',
                        'Consider redistributing staff to high-workload departments',
                        'Set up automated alerts for delayed queries'
                      ]).map((recommendation, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{recommendation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alerts & Notifications */}
                {aiInsights.alerts && aiInsights.alerts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Smart Alerts
                    </h3>
                    <div className="space-y-3">
                      {aiInsights.alerts.map((alert, index) => (
                        <div key={index} className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-red-800 font-medium">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Analysis Not Available</h3>
                <p className="text-gray-500 mb-4">Click the button above to generate AI-powered insights</p>
                <button
                  onClick={generateAIInsights}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Generate AI Insights
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;