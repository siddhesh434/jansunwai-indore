"use client";
import React, { useState, useEffect } from "react";

const API_BASE = "/api";

// Mock data for development/testing
const mockUsers = [
  {
    _id: "1",
    username: "john_doe",
    name: "John Doe",
    address: "Sector 1, Indore",
    queries: [],
  },
  {
    _id: "2",
    username: "jane_smith",
    name: "Jane Smith",
    address: "Sector 2, Indore",
    queries: [],
  },
];

const mockDepartments = [
  { _id: "1", departmentName: "Municipal Services", members: [], queries: [] },
  { _id: "2", departmentName: "Water Department", members: [], queries: [] },
];

const mockQueries = [
  {
    _id: "1",
    title: "Street light not working",
    status: "open",
    author: { _id: "1", name: "John Doe" },
    department: { _id: "1", departmentName: "Municipal Services" },
  },
];

// Generic CRUD Hook with fallback to mock data
const useCRUD = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get mock data based on endpoint
  const getMockData = () => {
    switch (endpoint) {
      case "/users":
        return mockUsers;
      case "/departments":
        return mockDepartments;
      case "/queries":
        return mockQueries;
      default:
        return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        // Fallback to mock data if API fails
        console.warn(`API failed, using mock data for ${endpoint}`);
        setData(getMockData());
      }
    } catch (error) {
      console.error("Fetch error, using mock data:", error);
      setData(getMockData());
    }
    setLoading(false);
  };

  const create = async (item) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        fetchData();
      } else {
        // Mock create for demo
        const newItem = { ...item, _id: Date.now().toString() };
        setData((prev) => [...prev, newItem]);
      }
    } catch (error) {
      console.error("Create error:", error);
      // Mock create for demo
      const newItem = { ...item, _id: Date.now().toString() };
      setData((prev) => [...prev, newItem]);
    }
  };

  const update = async (id, item) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        fetchData();
      } else {
        // Mock update for demo
        setData((prev) =>
          prev.map((d) => (d._id === id ? { ...d, ...item } : d))
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      // Mock update for demo
      setData((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...item } : d))
      );
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        // Mock delete for demo
        setData((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
      // Mock delete for demo
      setData((prev) => prev.filter((d) => d._id !== id));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, create, update, remove, refresh: fetchData };
};

// User Component
const Users = () => {
  const { data: users, loading, create, update, remove } = useCRUD("/users");
  const [form, setForm] = useState({ username: "", name: "", address: "" });
  const [editId, setEditId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { ...form, hashedPassword: "temp_hash" };

    if (editId) {
      update(editId, userData);
      setEditId(null);
    } else {
      create(userData);
    }
    setForm({ username: "", name: "", address: "" });
  };

  const handleEdit = (user) => {
    setForm({
      username: user.username,
      name: user.name,
      address: user.address || "",
    });
    setEditId(user._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>

      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {editId ? "Update" : "Create"} User
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ username: "", name: "", address: "" });
            }}
            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user._id} className="p-4 border rounded">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-sm">{user.address}</p>
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(user._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Departments Component
const Departments = () => {
  const {
    data: departments,
    loading,
    create,
    update,
    remove,
  } = useCRUD("/departments");
  const [form, setForm] = useState({ departmentName: "" });
  const [editId, setEditId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      update(editId, form);
      setEditId(null);
    } else {
      create(form);
    }
    setForm({ departmentName: "" });
  };

  const handleEdit = (dept) => {
    setForm({ departmentName: dept.departmentName });
    setEditId(dept._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Departments</h2>

      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <input
          type="text"
          placeholder="Department Name"
          value={form.departmentName}
          onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
          className="p-2 border rounded mr-2"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {editId ? "Update" : "Create"} Department
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ departmentName: "" });
            }}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="p-4 border rounded">
              <h3 className="font-semibold">{dept.departmentName}</h3>
              <p className="text-sm text-gray-600">
                Members: {dept.members?.length || 0} | Queries:{" "}
                {dept.queries?.length || 0}
              </p>
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(dept)}
                  className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(dept._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Queries Component
const Queries = () => {
  const {
    data: queries,
    loading,
    create,
    update,
    remove,
  } = useCRUD("/queries");
  const { data: users } = useCRUD("/users");
  const { data: departments } = useCRUD("/departments");
  const [form, setForm] = useState({
    title: "",
    author: "",
    department: "",
    status: "open",
  });
  const [editId, setEditId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryData = {
      ...form,
      objects: [
        {
          message: `Initial query: ${form.title}`,
          authorType: "User",
          authorId: form.author,
        },
      ],
    };

    if (editId) {
      update(editId, form);
      setEditId(null);
    } else {
      create(queryData);
    }
    setForm({ title: "", author: "", department: "", status: "open" });
  };

  const handleEdit = (query) => {
    setForm({
      title: query.title,
      author: query.author._id || query.author,
      department: query.department._id || query.department,
      status: query.status,
    });
    setEditId(query._id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Queries</h2>

      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Query Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Author</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {editId ? "Update" : "Create"} Query
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({
                title: "",
                author: "",
                department: "",
                status: "open",
              });
            }}
            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {queries.map((query) => (
            <div key={query._id} className="p-4 border rounded">
              <h3 className="font-semibold">{query.title}</h3>
              <div className="text-sm text-gray-600 mt-1">
                <p>Author: {query.author?.name || "Unknown"}</p>
                <p>
                  Department: {query.department?.departmentName || "Unknown"}
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      query.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : query.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {query.status}
                  </span>
                </p>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleEdit(query)}
                  className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(query._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function JansunwaiApp() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", label: "Users", component: Users },
    { id: "departments", label: "Departments", component: Departments },
    { id: "queries", label: "Queries", component: Queries },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || Users;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold py-4">
            Jansunwai Indore - Admin Panel
          </h1>
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6">
        <ActiveComponent />
      </main>
    </div>
  );
}
