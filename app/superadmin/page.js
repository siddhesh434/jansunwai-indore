"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, FileText, Building2, UserCheck, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, Activity, Brain, Zap, Target, RefreshCw, Shield, LogOut, Search, Filter, SortAsc, SortDesc, Eye, MapPin, Star, MessageSquare, ThumbsUp, ThumbsDown, X, Download, Paperclip, Send, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const IndoreMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-lg p-8 text-center">Loading map...</div>
});

const Dashboard = () => {
  const [data, setData] = useState({
    users: [],
    queries: [],
    departments: [],
    departmentMembers: []
  });
  const [allQueries, setAllQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackAIInsights, setFeedbackAIInsights] = useState(null);
  const [feedbackAILoading, setFeedbackAILoading] = useState(false);
  const [feedbackDepartmentFilter, setFeedbackDepartmentFilter] = useState('all');
  
  // New state variables for urgency sorting and modal
  const [urgencySortOrder, setUrgencySortOrder] = useState('high');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);

  const router = useRouter();
  const { superadmin, isSuperadminAuthenticated, logout } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSuperadminAuthenticated) {
      router.push('/superadmin/login');
    }
  }, [isSuperadminAuthenticated, router]);

  // Fetch initial data
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
                     queries: Array(420).fill().map((_, i) => {
             const currentDate = new Date();
             const randomDaysAgo = Math.floor(Math.random() * 365); // Spread across the year
             const createdAt = new Date(currentDate.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
             
             return {
               _id: `query_${i}`,
               title: `Query ${i + 1}`,
               description: `This is a detailed description for query ${i + 1}. It contains important information about the issue that needs to be addressed by the concerned department.`,
               status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
               urgencyScore: Math.floor(Math.random() * 10) + 1, // 1-10 urgency score
               createdAt: createdAt.toISOString(),
               updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
               author: {
                 _id: `user_${i}`,
                 name: `Citizen ${i + 1}`,
                 email: `citizen${i + 1}@example.com`
               },
               department: { departmentName: ['Sewage', 'Compost with dried leaves', 'Water Supply', 'Electricity', 'Engineering', 'Revenue', 'Fire Brigade', 'Finance', 'Garden', 'Miscellaneous Complaints', 'Parking', 'Building Allowance', 'Lake Protection', 'Social Security', 'Govardhan Project', 'BRTS and BCL'][Math.floor(Math.random() * 16)] },
               // Mock chat messages using objects field
               objects: [
                 {
                   message: `Initial complaint: ${['Water supply has been cut off for 3 days', 'Street light is not working', 'Garbage is not being collected', 'Road has potholes', 'Electricity bill is too high', 'Sewage is overflowing'][Math.floor(Math.random() * 6)]}`,
                   authorType: 'User',
                   authorId: `user_${i}`,
                   timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                   attachments: []
                 },
                 {
                   message: `Thank you for your complaint. We have received your query and assigned it to our team. Reference ID: ${i + 1000}`,
                   authorType: 'DepartmentMember',
                   authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
                   timestamp: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
                   attachments: []
                 },
                 {
                   message: `Follow up: When can I expect this to be resolved? It's been affecting our daily routine.`,
                   authorType: 'User',
                   authorId: `user_${i}`,
                   timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
                   attachments: []
                 },
                 {
                   message: `We understand your concern. Our team is working on this issue and we expect to resolve it within ${Math.floor(Math.random() * 5) + 1} days. We will keep you updated on the progress.`,
                   authorType: 'DepartmentMember',
                   authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
                   timestamp: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
                   attachments: []
                 }
               ],
               // Mock documents
               documents: [
                 {
                   _id: `doc_${i}_1`,
                   name: 'photo_evidence.jpg',
                   type: 'image',
                   url: '#',
                   uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                 },
                 {
                   _id: `doc_${i}_2`,
                   name: 'location_details.pdf',
                   type: 'pdf',
                   url: '#',
                   uploadedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
                 }
               ]
             };
           }),
          departments: [
            { _id: 'dept_1', departmentName: 'Sewage', members: Array(12).fill(), queries: Array(85).fill() },
            { _id: 'dept_2', departmentName: 'Compost with dried leaves', members: Array(8).fill(), queries: Array(92).fill() },
            { _id: 'dept_3', departmentName: 'Water Supply', members: Array(10).fill(), queries: Array(78).fill() },
            { _id: 'dept_4', departmentName: 'Electricity', members: Array(15).fill(), queries: Array(95).fill() },
            { _id: 'dept_5', departmentName: 'Engineering', members: Array(20).fill(), queries: Array(70).fill() },
            { _id: 'dept_6', departmentName: 'Revenue', members: Array(18).fill(), queries: Array(88).fill() },
            { _id: 'dept_7', departmentName: 'Fire Brigade', members: Array(14).fill(), queries: Array(65).fill() },
            { _id: 'dept_8', departmentName: 'Finance', members: Array(16).fill(), queries: Array(72).fill() },
            { _id: 'dept_9', departmentName: 'Garden', members: Array(11).fill(), queries: Array(55).fill() },
            { _id: 'dept_10', departmentName: 'Miscellaneous Complaints', members: Array(13).fill(), queries: Array(120).fill() },
            { _id: 'dept_11', departmentName: 'Parking', members: Array(9).fill(), queries: Array(68).fill() },
            { _id: 'dept_12', departmentName: 'Building Allowance', members: Array(17).fill(), queries: Array(82).fill() },
            { _id: 'dept_13', departmentName: 'Lake Protection', members: Array(7).fill(), queries: Array(45).fill() },
            { _id: 'dept_14', departmentName: 'Social Security', members: Array(19).fill(), queries: Array(95).fill() },
            { _id: 'dept_15', departmentName: 'Govardhan Project', members: Array(12).fill(), queries: Array(58).fill() },
            { _id: 'dept_16', departmentName: 'BRTS and BCL', members: Array(15).fill(), queries: Array(75).fill() }
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

  // Function definitions - must come before useEffect hooks that use them
  const fetchAllQueries = useCallback(async () => {
    setQueriesLoading(true);
    try {
      const response = await fetch(`/api/populatedqueries?sortOrder=${sortOrder}`);
      const queries = await response.json();
      
      if (Array.isArray(queries)) {
        setAllQueries(queries);
      } else {
        // Fallback to mock data
        const mockQueries = Array(50).fill().map((_, i) => ({
          _id: `query_${i}`,
          title: `Sample Query ${i + 1}: ${['Water shortage in area', 'Road repair needed', 'Electricity outage', 'Garbage collection issue', 'Street light maintenance', 'Sewage overflow', 'Parking violation', 'Building permit issue', 'Lake pollution', 'Composting facility needed', 'Fire safety concern', 'Revenue collection issue', 'Garden maintenance', 'BRTS service complaint', 'Social security application', 'Govardhan project update'][Math.floor(Math.random() * 16)]}`,
          description: `This is a detailed description for query ${i + 1}. It contains important information about the issue that needs to be addressed by the concerned department. The citizen has provided specific details about the location, severity, and impact of the problem.`,
          status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
          urgencyScore: Math.floor(Math.random() * 10) + 1, // 1-10 urgency score
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          author: {
            _id: `user_${i}`,
            name: `Citizen ${i + 1}`,
            email: `citizen${i + 1}@example.com`
          },
          department: {
            _id: `dept_${Math.floor(Math.random() * 16)}`,
            departmentName: ['Sewage', 'Compost with dried leaves', 'Water Supply', 'Electricity', 'Engineering', 'Revenue', 'Fire Brigade', 'Finance', 'Garden', 'Miscellaneous Complaints', 'Parking', 'Building Allowance', 'Lake Protection', 'Social Security', 'Govardhan Project', 'BRTS and BCL'][Math.floor(Math.random() * 16)]
          },
          // Mock chat messages using objects field
          objects: [
            {
              message: `Initial complaint: ${['Water supply has been cut off for 3 days', 'Street light is not working', 'Garbage is not being collected', 'Road has potholes', 'Electricity bill is too high', 'Sewage is overflowing'][Math.floor(Math.random() * 6)]}`,
              authorType: 'User',
              authorId: `user_${i}`,
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              attachments: []
            },
            {
              message: `Thank you for your complaint. We have received your query and assigned it to our team. Reference ID: ${i + 1000}`,
              authorType: 'DepartmentMember',
              authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
              timestamp: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
              attachments: []
            },
            {
              message: `Follow up: When can I expect this to be resolved? It's been affecting our daily routine.`,
              authorType: 'User',
              authorId: `user_${i}`,
              timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
              attachments: []
            },
            {
              message: `We understand your concern. Our team is working on this issue and we expect to resolve it within ${Math.floor(Math.random() * 5) + 1} days. We will keep you updated on the progress.`,
              authorType: 'DepartmentMember',
              authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
              timestamp: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
              attachments: []
            }
          ],
          // Mock documents
          documents: [
            {
              _id: `doc_${i}_1`,
              name: 'photo_evidence.jpg',
              type: 'image',
              url: '#',
              uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              _id: `doc_${i}_2`,
              name: 'location_details.pdf',
              type: 'pdf',
              url: '#',
              uploadedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
            }
                  ]
      }));
      
      setAllQueries(mockQueries);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      // Fallback to mock data on error
      const mockQueries = Array(50).fill().map((_, i) => ({
        _id: `query_${i}`,
        title: `Sample Query ${i + 1}: ${['Water shortage in area', 'Road repair needed', 'Electricity outage', 'Garbage collection issue', 'Street light maintenance', 'Sewage overflow', 'Parking violation', 'Building permit issue', 'Lake pollution', 'Composting facility needed', 'Fire safety concern', 'Revenue collection issue', 'Garden maintenance', 'BRTS service complaint', 'Social security application', 'Govardhan project update'][Math.floor(Math.random() * 16)]}`,
        description: `This is a detailed description for query ${i + 1}. It contains important information about the issue that needs to be addressed by the concerned department. The citizen has provided specific details about the location, severity, and impact of the problem.`,
        status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
        urgencyScore: Math.floor(Math.random() * 10) + 1, // 1-10 urgency score
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        author: {
          _id: `user_${i}`,
          name: `Citizen ${i + 1}`,
          email: `citizen${i + 1}@example.com`
        },
        department: {
          _id: `dept_${Math.floor(Math.random() * 16)}`,
          departmentName: ['Sewage', 'Compost with dried leaves', 'Water Supply', 'Electricity', 'Engineering', 'Revenue', 'Fire Brigade', 'Finance', 'Garden', 'Miscellaneous Complaints', 'Parking', 'Building Allowance', 'Lake Protection', 'Social Security', 'Govardhan Project', 'BRTS and BCL'][Math.floor(Math.random() * 16)]
        },
        // Mock chat messages using objects field
        objects: [
          {
            message: `Initial complaint: ${['Water supply has been cut off for 3 days', 'Street light is not working', 'Garbage is not being collected', 'Road has potholes', 'Electricity bill is too high', 'Sewage is overflowing'][Math.floor(Math.random() * 6)]}`,
            authorType: 'User',
            authorId: `user_${i}`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: []
          },
          {
            message: `Thank you for your complaint. We have received your query and assigned it to our team. Reference ID: ${i + 1000}`,
            authorType: 'DepartmentMember',
            authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
            timestamp: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: []
          },
          {
            message: `Follow up: When can I expect this to be resolved? It's been affecting our daily routine.`,
            authorType: 'User',
            authorId: `user_${i}`,
            timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: []
          },
          {
            message: `We understand your concern. Our team is working on this issue and we expect to resolve it within ${Math.floor(Math.random() * 5) + 1} days. We will keep you updated on the progress.`,
            authorType: 'DepartmentMember',
            authorId: `dept_member_${Math.floor(Math.random() * 10)}`,
            timestamp: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: []
          }
        ],
        // Mock documents
        documents: [
          {
            _id: `doc_${i}_1`,
            name: 'photo_evidence.jpg',
            type: 'image',
            url: '#',
            uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: `doc_${i}_2`,
            name: 'location_details.pdf',
            type: 'pdf',
            url: '#',
            uploadedAt: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }));
      
      setAllQueries(mockQueries);
    } finally {
      setQueriesLoading(false);
    }
  }, [sortOrder]);

  // AI Analysis Functions
  const generateAIInsights = useCallback(async () => {
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
  }, [data.users.length, data.queries.length, data.departments.length, data.departmentMembers.length]);

  // Now the useEffect hooks that use these functions
  useEffect(() => {
    if (activeTab === 'queries') {
      fetchAllQueries();
    }
  }, [activeTab, sortOrder, fetchAllQueries]);

  // Auto-generate AI insights when switching to insights tab
  useEffect(() => {
    if (activeTab === 'insights' && !aiInsights && !loading) {
      generateAIInsights();
    }
  }, [activeTab, loading, aiInsights, generateAIInsights]);

  // Fetch feedback data when switching to feedbacks tab
  useEffect(() => {
    if (activeTab === 'feedbacks') {
      fetchFeedbackData();
    }
  }, [activeTab]);

  // Fetch feedback data
  const fetchFeedbackData = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch('/api/populatedqueries');
      if (response.ok) {
        const queries = await response.json();
        // Filter queries that have feedback
        const queriesWithFeedback = Array.isArray(queries) ? 
          queries.filter(query => query.feedback) : [];
        setFeedbackData(queriesWithFeedback);
      } else {
        // Fallback to mock feedback data
        setFeedbackData([
          {
            _id: '1',
            title: 'Water supply issue resolved',
            feedback: {
              rating: 5,
              description: 'Excellent service! The water supply was restored within 24 hours.',
              submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            department: { departmentName: 'Water Supply' },
            status: 'resolved',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '2',
            title: 'Street light repair',
            feedback: {
              rating: 4,
              description: 'Good response time. The street light was fixed quickly.',
              submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            department: { departmentName: 'Electricity' },
            status: 'resolved',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '3',
            title: 'Garbage collection complaint',
            feedback: {
              rating: 3,
              description: 'Issue was resolved but took longer than expected.',
              submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            department: { departmentName: 'Miscellaneous Complaints' },
            status: 'resolved',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '4',
            title: 'Road repair request',
            feedback: {
              rating: 2,
              description: 'Poor communication about the timeline. Still waiting for updates.',
              submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            department: { departmentName: 'Engineering' },
            status: 'in_progress',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: '5',
            title: 'Sewage overflow issue',
            feedback: {
              rating: 1,
              description: 'Very disappointed with the response. Issue still not resolved.',
              submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            department: { departmentName: 'Sewage' },
            status: 'open',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      // Use mock data on error
      setFeedbackData([
        {
          _id: '1',
          title: 'Water supply issue resolved',
          feedback: {
            rating: 5,
            description: 'Excellent service! The water supply was restored within 24 hours.',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          department: { departmentName: 'Water Supply' },
          status: 'resolved',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          title: 'Street light repair',
          feedback: {
            rating: 4,
            description: 'Good response time. The street light was fixed quickly.',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
          department: { departmentName: 'Electricity' },
          status: 'resolved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          title: 'Garbage collection complaint',
          feedback: {
            rating: 3,
            description: 'Issue was resolved but took longer than expected.',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          department: { departmentName: 'Miscellaneous Complaints' },
          status: 'resolved',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          title: 'Road repair request',
          feedback: {
            rating: 2,
            description: 'Poor communication about the timeline. Still waiting for updates.',
            submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          department: { departmentName: 'Engineering' },
          status: 'in_progress',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          title: 'Sewage overflow issue',
          feedback: {
            rating: 1,
            description: 'Very disappointed with the response. Issue still not resolved.',
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          department: { departmentName: 'Sewage' },
          status: 'open',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Generate AI feedback insights
  const generateFeedbackAIInsights = async () => {
    setFeedbackAILoading(true);
    try {
      const feedbackAnalytics = {
        totalFeedback: feedbackData.length,
        averageRating: feedbackData.length > 0 ? 
          (feedbackData.reduce((sum, item) => sum + item.feedback.rating, 0) / feedbackData.length).toFixed(1) : 0,
        ratingDistribution: feedbackData.reduce((acc, item) => {
          acc[item.feedback.rating] = (acc[item.feedback.rating] || 0) + 1;
          return acc;
        }, {}),
        departmentPerformance: feedbackData.reduce((acc, item) => {
          const dept = item.department?.departmentName || 'Unknown';
          if (!acc[dept]) {
            acc[dept] = { total: 0, sum: 0, ratings: [] };
          }
          acc[dept].total += 1;
          acc[dept].sum += item.feedback.rating;
          acc[dept].ratings.push(item.feedback.rating);
          return acc;
        }, {}),
        sentimentAnalysis: feedbackData.map(item => ({
          rating: item.feedback.rating,
          description: item.feedback.description,
          department: item.department?.departmentName,
          status: item.status
        }))
      };

      const response = await fetch('/api/dashboard-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: feedbackAnalytics,
          analysisType: 'feedback_sentiment_analysis'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFeedbackAIInsights(result.analysis);
      } else {
        // Fallback insights if AI analysis fails
        setFeedbackAIInsights(generateFallbackFeedbackInsights());
      }
    } catch (error) {
      console.error('Feedback AI Analysis failed:', error);
      setFeedbackAIInsights(generateFallbackFeedbackInsights());
    } finally {
      setFeedbackAILoading(false);
    }
  };

  const generateFallbackFeedbackInsights = () => {
    const avgRating = feedbackData.length > 0 ? 
      (feedbackData.reduce((sum, item) => sum + item.feedback.rating, 0) / feedbackData.length).toFixed(1) : 0;
    
    const ratingDistribution = feedbackData.reduce((acc, item) => {
      acc[item.feedback.rating] = (acc[item.feedback.rating] || 0) + 1;
      return acc;
    }, {});

    const departmentPerformance = feedbackData.reduce((acc, item) => {
      const dept = item.department?.departmentName || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { total: 0, sum: 0 };
      }
      acc[dept].total += 1;
      acc[dept].sum += item.feedback.rating;
      return acc;
    }, {});

    return {
      overallSatisfaction: avgRating >= 4 ? 'High' : avgRating >= 3 ? 'Moderate' : 'Low',
      keyFindings: [
        `Average satisfaction rating: ${avgRating}/5`,
        `${feedbackData.length} feedback responses analyzed`,
        `Most common rating: ${Object.keys(ratingDistribution).reduce((a, b) => ratingDistribution[a] > ratingDistribution[b] ? a : b)}/5`,
        `${Object.keys(departmentPerformance).length} departments received feedback`
      ],
      recommendations: [
        'Focus on improving response times for departments with lower ratings',
        'Implement regular feedback collection for all resolved queries',
        'Provide training on customer communication for staff',
        'Set up automated follow-up systems for ongoing issues'
      ],
      departmentInsights: Object.entries(departmentPerformance).map(([dept, data]) => ({
        department: dept,
        averageRating: (data.sum / data.total).toFixed(1),
        totalFeedback: data.total,
        performance: (data.sum / data.total) >= 4 ? 'Excellent' : 
                    (data.sum / data.total) >= 3 ? 'Good' : 'Needs Improvement'
      })),
      sentimentTrends: {
        positive: Object.values(ratingDistribution).slice(4).reduce((a, b) => a + b, 0),
        neutral: ratingDistribution[3] || 0,
        negative: Object.values(ratingDistribution).slice(0, 3).reduce((a, b) => a + b, 0)
      }
    };
  };

  // Helper functions and computed values
  const filteredQueries = allQueries.filter(query => {
    const matchesSearch = query.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.department?.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Apply sorting based on current sort order
    if (sortOrder === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === 'urgency_high') {
      return (b.urgencyScore || 5) - (a.urgencyScore || 5);
    } else if (sortOrder === 'urgency_low') {
      return (a.urgencyScore || 5) - (b.urgencyScore || 5);
    }
    return 0;
  });

  // Filter feedback data based on department
  const filteredFeedbackData = feedbackData.filter(item => {
    const matchesDepartment = feedbackDepartmentFilter === 'all' || 
      item.department?.departmentName === feedbackDepartmentFilter;
    return matchesDepartment;
  });

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
      efficiency: dept.members?.length > 0 ? ((dept.queries?.length || 0) / dept.members.length) : 0
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Group queries by month
    const monthlyData = {};
    
    // Initialize all months with 0 values
    months.forEach((month, index) => {
      monthlyData[index] = {
        month,
        queries: 0,
        resolved: 0,
        pending: 0
      };
    });
    
    // Process actual query data
    data.queries.forEach(query => {
      const queryDate = new Date(query.createdAt);
      const queryYear = queryDate.getFullYear();
      
      // Only process current year data
      if (queryYear === currentYear) {
        const monthIndex = queryDate.getMonth();
        
        if (monthlyData[monthIndex]) {
          monthlyData[monthIndex].queries += 1;
          
          if (query.status === 'resolved') {
            monthlyData[monthIndex].resolved += 1;
          } else if (query.status === 'open' || query.status === 'pending') {
            monthlyData[monthIndex].pending += 1;
          }
        }
      }
    });
    
    return Object.values(monthlyData);
  };

  const getStatusData = () => {
    const statusCounts = data.queries.reduce((acc, query) => {
      acc[query.status] = (acc[query.status] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      'open': '#ff6b6b',
      'in_progress': '#4ecdc4',
      'resolved': '#45b7d1',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (score) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getUrgencyLabel = (score) => {
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setShowQueryModal(true);
  };

  const closeQueryModal = () => {
    setShowQueryModal(false);
    setSelectedQuery(null);
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  // Don't render if not authenticated
  if (!isSuperadminAuthenticated) {
    return null;
  }

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/superadmin/login');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-8 px-6">
            {['overview', 'analytics', 'departments', 'queries', 'insights', 'map', 'feedbacks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

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

        {activeTab === 'queries' && (
          <div className="space-y-6">
            {/* Queries Header with Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileText className="h-7 w-7 mr-3 text-blue-500" />
                    All Queries ({filteredQueries.length})
                  </h2>
                  <p className="text-gray-600 mt-1">View and manage all citizen queries</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search queries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  
                  {/* Sort Order */}
                  <select
                    value={sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="urgency_high">Urgency: High to Low</option>
                    <option value="urgency_low">Urgency: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Queries List */}
            {queriesLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading queries...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredQueries.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No queries found</h3>
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'No queries have been submitted yet'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Query Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Author
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Urgency
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQueries.map((query) => (
                          <tr key={query._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {query.title}
                                </h4>
                                {query.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                    {query.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  ID: {query._id}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {query.author?.name || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {query.author?.email || 'No email'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {query.department?.departmentName || 'Unassigned'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(query.status)}`}>
                                {query.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(query.urgencyScore || 5)}`}>
                                  {getUrgencyLabel(query.urgencyScore || 5)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({query.urgencyScore || 5}/10)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {formatDate(query.createdAt)}
                                </p>
                                {query.updatedAt !== query.createdAt && (
                                  <p className="text-xs text-gray-500">
                                    Updated: {formatDate(query.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleViewQuery(query)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredQueries.filter(q => q.status === 'open').length}
                </div>
                <div className="text-sm text-gray-600">Open Queries</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredQueries.filter(q => q.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredQueries.filter(q => q.status === 'resolved').length}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredQueries.filter(q => (q.urgencyScore || 5) >= 8).length}
                </div>
                <div className="text-sm text-gray-600">Critical Priority</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredQueries.length}
                </div>
                <div className="text-sm text-gray-600">Total Shown</div>
              </div>
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

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MapPin className="h-7 w-7 mr-3 text-blue-500" />
                    Indore City Map
                  </h2>
                  <p className="text-gray-600 mt-1">Geographic overview of query locations and city landmarks</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <IndoreMap />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Map Features</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Interactive city landmarks</li>
                    <li>• Query location tracking</li>
                    <li>• Department coverage areas</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Current Status</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 5 active landmarks</li>
                    <li>• Real-time updates</li>
                    <li>• Mobile responsive</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Future Enhancements</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Query clustering</li>
                    <li>• Heat map analytics</li>
                    <li>• Route optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className="space-y-6">
            {/* Feedback Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <MessageSquare className="h-8 w-8 mr-3" />
                    Citizen Feedback Analytics
                  </h2>
                  <p className="text-purple-100">AI-powered sentiment analysis and performance insights from citizen feedback</p>
                </div>
                <button
                  onClick={generateFeedbackAIInsights}
                  disabled={feedbackAILoading}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center disabled:opacity-50"
                >
                  <Brain className={`h-4 w-4 mr-2 ${feedbackAILoading ? 'animate-spin' : ''}`} />
                  {feedbackAILoading ? 'Analyzing...' : 'AI Analysis'}
                </button>
              </div>
            </div>

            {feedbackLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading feedback data...</p>
              </div>
            ) : (
              <>
                                 {/* Feedback Filters */}
                 <div className="bg-white rounded-xl shadow-lg p-6">
                   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                     <div>
                       <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                         <Filter className="h-5 w-5 mr-2 text-purple-500" />
                         Filter Feedback
                       </h3>
                                               <p className="text-gray-600 mt-1">Filter feedback by department</p>
                     </div>
                     
                                           <div className="flex flex-col sm:flex-row gap-3">
                        {/* Department Filter */}
                        <select
                          value={feedbackDepartmentFilter}
                          onChange={(e) => setFeedbackDepartmentFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Departments</option>
                          {Array.from(new Set(feedbackData.map(item => item.department?.departmentName))).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                 </div>

                 {/* Feedback Statistics */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                     <div className="text-3xl font-bold text-purple-600 mb-2">
                       {filteredFeedbackData.length}
                     </div>
                     <div className="text-sm text-gray-600">Filtered Feedback</div>
                     <div className="text-xs text-gray-500 mt-1">
                       of {feedbackData.length} total
                     </div>
                   </div>
                   <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                     <div className="text-3xl font-bold text-green-600 mb-2">
                       {filteredFeedbackData.length > 0 ? 
                         (filteredFeedbackData.reduce((sum, item) => sum + item.feedback.rating, 0) / filteredFeedbackData.length).toFixed(1) : '0.0'}
                     </div>
                     <div className="text-sm text-gray-600">Average Rating</div>
                   </div>
                   <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                     <div className="text-3xl font-bold text-blue-600 mb-2">
                       {filteredFeedbackData.filter(item => item.feedback.rating >= 4).length}
                     </div>
                     <div className="text-sm text-gray-600">Positive Reviews</div>
                   </div>
                   <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                     <div className="text-3xl font-bold text-orange-600 mb-2">
                       {new Set(filteredFeedbackData.map(item => item.department?.departmentName)).size}
                     </div>
                     <div className="text-sm text-gray-600">Departments Rated</div>
                   </div>
                 </div>

                {/* Rating Distribution Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Rating Distribution
                  </h3>
                                     <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={Array.from({ length: 5 }, (_, i) => {
                       const rating = i + 1;
                       const count = filteredFeedbackData.filter(item => item.feedback.rating === rating).length;
                       return { rating: `${rating}★`, count, percentage: filteredFeedbackData.length > 0 ? (count / filteredFeedbackData.length * 100).toFixed(1) : 0 };
                     })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Count' : 'Percentage']} />
                      <Bar dataKey="count" fill="#8b5cf6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Insights */}
                {feedbackAILoading ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="animate-pulse">
                      <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Analysis in Progress</h3>
                      <p className="text-gray-500">Analyzing feedback sentiment and generating insights...</p>
                    </div>
                  </div>
                ) : feedbackAIInsights ? (
                  <div className="space-y-6">
                    {/* Overall Satisfaction */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
                        Overall Satisfaction Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {feedbackAIInsights.overallSatisfaction || 'Moderate'}
                          </div>
                          <p className="text-sm text-green-700">Overall Satisfaction</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {feedbackAIInsights.sentimentTrends?.positive || 0}
                          </div>
                          <p className="text-sm text-blue-700">Positive Feedback</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-b from-red-50 to-red-100 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {feedbackAIInsights.sentimentTrends?.negative || 0}
                          </div>
                          <p className="text-sm text-red-700">Negative Feedback</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-purple-500" />
                          AI Key Findings
                        </h3>
                        <div className="space-y-3">
                          {(feedbackAIInsights.keyFindings || []).map((finding, index) => (
                            <div key={index} className="flex items-start p-3 bg-purple-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
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
                          {(feedbackAIInsights.recommendations || []).map((recommendation, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{recommendation}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Department Performance */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                        Department Performance by Feedback
                      </h3>
                      <div className="space-y-4">
                        {(feedbackAIInsights.departmentInsights || []).map((dept, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                dept.performance === 'Excellent' ? 'bg-green-500' :
                                dept.performance === 'Good' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <h4 className="font-medium text-gray-900">{dept.department}</h4>
                                <p className="text-sm text-gray-600">{dept.totalFeedback} feedback responses</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{dept.averageRating}/5</div>
                              <div className={`text-sm font-medium ${
                                dept.performance === 'Excellent' ? 'text-green-600' :
                                dept.performance === 'Good' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {dept.performance}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Analysis Not Available</h3>
                    <p className="text-gray-500 mb-4">Click the AI Analysis button above to generate insights</p>
                    <button
                      onClick={generateFeedbackAIInsights}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-all duration-200"
                    >
                      Generate AI Insights
                    </button>
                  </div>
                )}

                                 {/* Feedback List */}
                 <div className="bg-white rounded-xl shadow-lg p-6">
                   <h3 className="text-lg font-semibold mb-4 flex items-center">
                     <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
                     Recent Feedback ({filteredFeedbackData.length})
                   </h3>
                   <div className="space-y-4">
                     {filteredFeedbackData.length === 0 ? (
                       <div className="text-center py-8">
                         <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                         <h3 className="text-lg font-semibold text-gray-700 mb-2">No feedback found</h3>
                                                   <p className="text-gray-500">
                            {feedbackDepartmentFilter !== 'all' 
                              ? 'Try adjusting your filter criteria' 
                              : 'No feedback has been submitted yet'}
                          </p>
                       </div>
                     ) : (
                       filteredFeedbackData.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                {item.department?.departmentName}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < item.feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {item.feedback.rating}/5
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{item.feedback.description}</p>
                                                 <div className="text-xs text-gray-500">
                           Feedback submitted: {new Date(item.feedback.submittedAt).toLocaleDateString()}
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
              </>
            )}
          </div>
        )}

        {/* Detailed Query Modal */}
        {showQueryModal && selectedQuery && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Query Details</h2>
                    <p className="text-sm text-gray-600">ID: {selectedQuery._id}</p>
                  </div>
                </div>
                <button
                  onClick={closeQueryModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6 space-y-6">
                  {/* Query Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Query Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Title</label>
                            <p className="text-gray-900 mt-1">{selectedQuery.title}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <p className="text-gray-900 mt-1">{selectedQuery.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Status</label>
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedQuery.status)}`}>
                                  {selectedQuery.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700">Urgency</label>
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(selectedQuery.urgencyScore || 5)}`}>
                                  {getUrgencyLabel(selectedQuery.urgencyScore || 5)} ({selectedQuery.urgencyScore || 5}/10)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Author Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <p className="text-gray-900 mt-1">{selectedQuery.author?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <p className="text-gray-900 mt-1">{selectedQuery.author?.email || 'No email'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <div className="flex items-center mt-1">
                              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900">{selectedQuery.department?.departmentName || 'Unassigned'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900">{formatDate(selectedQuery.createdAt)}</span>
                          </div>
                          {selectedQuery.updatedAt !== selectedQuery.createdAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="text-gray-900">{formatDate(selectedQuery.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                      Conversation History ({selectedQuery.objects ? selectedQuery.objects.length : 0} messages)
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {selectedQuery.objects && selectedQuery.objects.length > 0 ? (
                        selectedQuery.objects.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.authorType === 'User' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.authorType === 'User'
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium capitalize">
                                  {message.authorType === 'User' ? 'Citizen' : 'Department'}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.authorType === 'User' ? 'text-gray-500' : 'text-blue-100'
                              }`}>
                                {formatDate(message.timestamp)}
                              </p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                                  {message.attachments.map((attachment, attIndex) => (
                                    <div key={attIndex} className="flex items-center space-x-2 text-xs">
                                      <Paperclip className="h-3 w-3" />
                                      <span className="truncate">{attachment.originalName}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No messages yet</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Messages will appear here when the conversation starts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  {selectedQuery.documents && selectedQuery.documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Paperclip className="h-5 w-5 mr-2 text-green-500" />
                        Attached Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedQuery.documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Paperclip className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                  Uploaded: {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority Indicator */}
                  <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getUrgencyColor(selectedQuery.urgencyScore || 5)}`}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {getUrgencyLabel(selectedQuery.urgencyScore || 5)} Priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;