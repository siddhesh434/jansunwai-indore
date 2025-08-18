"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Filter, MapPin, Building2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function IndoreMap() {
  const [queries, setQueries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch queries and departments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [queriesRes, departmentsRes] = await Promise.all([
          fetch('/api/populatedqueries'),
          fetch('/api/departments')
        ]);

        if (queriesRes.ok) {
          const queriesData = await queriesRes.json();
          setQueries(Array.isArray(queriesData) ? queriesData : []);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
                 // Fallback to mock data
         setQueries([
           {
             _id: '1',
             title: 'Water shortage in Rajwada area',
             description: 'No water supply for 3 days',
             status: 'open',
             address: 'Rajwada, Indore',
             latitude: 22.7196,
             longitude: 75.8577,
             department: { departmentName: 'Water Supply' },
             createdAt: new Date().toISOString()
           },
           {
             _id: '2',
             title: 'Street light not working',
             description: 'Street light broken near temple',
             status: 'in_progress',
             address: 'Khajrana Ganesh Temple, Indore',
             latitude: 22.7339,
             longitude: 75.8499,
             department: { departmentName: 'Electricity' },
             createdAt: new Date().toISOString()
           },
           {
             _id: '3',
             title: 'Garbage collection issue',
             description: 'Garbage not collected for a week',
             status: 'resolved',
             address: 'Crystal IT Park, Indore',
             latitude: 22.6945,
             longitude: 75.8800,
             department: { departmentName: 'Miscellaneous Complaints' },
             createdAt: new Date().toISOString()
           },
           {
             _id: '4',
             title: 'Road repair needed',
             description: 'Potholes on main road',
             status: 'open',
             address: 'Pipliyapala Lake, Indore',
             latitude: 22.7525,
             longitude: 75.8936,
             department: { departmentName: 'Engineering' },
             createdAt: new Date().toISOString()
           },
           {
             _id: '5',
             title: 'Sewage overflow',
             description: 'Sewage water flowing on street',
             status: 'in_progress',
             address: 'Sarafa Bazaar, Indore',
             latitude: 22.7170,
             longitude: 75.8330,
             department: { departmentName: 'Sewage' },
             createdAt: new Date().toISOString()
           }
         ]);
        setDepartments([
          { _id: '1', departmentName: 'Water Supply' },
          { _id: '2', departmentName: 'Electricity' },
          { _id: '3', departmentName: 'Sewage' },
          { _id: '4', departmentName: 'Engineering' },
          { _id: '5', departmentName: 'Miscellaneous Complaints' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter queries based on selected department and status
  const filteredQueries = queries.filter(query => {
    const matchesDepartment = selectedDepartment === 'all' || 
      query.department?.departmentName === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || query.status === selectedStatus;
    return matchesDepartment && matchesStatus && query.latitude && query.longitude;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444'; // red
      case 'in_progress': return '#f59e0b'; // amber
      case 'resolved': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return '🔴';
      case 'in_progress': return '🟡';
      case 'resolved': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Queries</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.departmentName}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredQueries.length} of {queries.length} queries
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <MapContainer
          center={[22.7196, 75.8577]}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
        >
          {/* Base map tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Plot query coordinates */}
          {filteredQueries.map((query) => (
            <CircleMarker
              key={query._id}
              center={[query.latitude, query.longitude]}
              pathOptions={{
                color: getStatusColor(query.status),
                fillColor: getStatusColor(query.status),
                fillOpacity: 0.7,
                weight: 2
              }}
              radius={10}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{getStatusIcon(query.status)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {query.title}
                      </h3>
                      <p className="text-gray-600 text-xs mb-2">
                        {query.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{query.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building2 className="h-3 w-3" />
                      <span>{query.department?.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        query.status === 'open' ? 'bg-red-100 text-red-800' :
                        query.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {query.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Query Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredQueries.filter(q => q.status === 'open').length}
          </div>
          <div className="text-sm text-gray-600">Open Queries</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {filteredQueries.filter(q => q.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredQueries.filter(q => q.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredQueries.length}
          </div>
          <div className="text-sm text-gray-600">Total Shown</div>
        </div>
      </div>
    </div>
  );
}
