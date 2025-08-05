"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [threads, setThreads] = useState([]);
  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    department: "",
  });
  const [newThread, setNewThread] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }
    fetchUserData(userId);
    fetchDepartments();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const userData = await res.json();
      setUser(userData);
      setQueries(userData.queries || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchQueryThreads = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`);
      const queryData = await res.json();
      setSelectedQuery(queryData);
      setThreads(queryData.threads || []);
    } catch (error) {
      console.error("Error fetching query threads:", error);
    }
  };

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newQuery, author: user._id }),
      });

      if (res.ok) {
        const createdQuery = await res.json();
        setQueries([...queries, createdQuery]);
        setNewQuery({ title: "", description: "", department: "" });
      }
    } catch (error) {
      console.error("Error creating query:", error);
    }
  };

  const handleAddThread = async (e) => {
    e.preventDefault();
    if (!selectedQuery || !newThread.trim()) return;

    try {
      const updatedThreads = [
        ...threads,
        { message: newThread, author: user._id, timestamp: new Date() },
      ];

      const res = await fetch(`/api/queries/${selectedQuery._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threads: updatedThreads }),
      });

      if (res.ok) {
        setThreads(updatedThreads);
        setNewThread("");
      }
    } catch (error) {
      console.error("Error adding thread:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <span className="ml-3">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Welcome, <b>{user?.name}</b>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - My Queries */}
        <div className="w-1/3 border-r bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">My Queries</h2>

          <div className="space-y-3">
            {queries.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No queries yet. Create one below.
              </p>
            ) : (
              queries.map((query) => (
                <div
                  key={query._id}
                  onClick={() => fetchQueryThreads(query._id)}
                  className={`p-4 border rounded-lg cursor-pointer transition hover:shadow-sm ${
                    selectedQuery?._id === query._id
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white"
                  }`}
                >
                  <h3 className="font-medium text-gray-800">{query.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {query.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    Status: {query.status || "Open"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Query Creation */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-md font-medium mb-3">Create New Query</h3>
            <form onSubmit={handleCreateQuery} className="space-y-3">
              <input
                type="text"
                placeholder="Query Title"
                value={newQuery.title}
                onChange={(e) =>
                  setNewQuery({ ...newQuery, title: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
              <textarea
                placeholder="Description"
                value={newQuery.description}
                onChange={(e) =>
                  setNewQuery({ ...newQuery, description: e.target.value })
                }
                className="w-full p-2 border rounded-lg h-20 focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={newQuery.department}
                onChange={(e) =>
                  setNewQuery({ ...newQuery, department: e.target.value })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Query
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Query Threads */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {selectedQuery ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedQuery.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedQuery.description}
                </p>
                <span className="text-sm text-gray-500">
                  Status: {selectedQuery.status || "Open"}
                </span>
              </div>

              <div className="bg-white rounded-lg shadow p-4 h-96 overflow-y-auto mb-4">
                <h3 className="font-medium mb-3">Threads</h3>
                {threads.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No threads yet. Start the conversation!
                  </p>
                ) : (
                  threads.map((thread, index) => (
                    <div
                      key={index}
                      className="mb-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      <p className="text-gray-800">{thread.message}</p>
                      <span className="text-xs text-gray-500 block mt-1">
                        {new Date(thread.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Thread */}
              <form onSubmit={handleAddThread} className="flex gap-2">
                <textarea
                  placeholder="Add a thread..."
                  value={newThread}
                  onChange={(e) => setNewThread(e.target.value)}
                  className="flex-1 p-2 border rounded-lg h-20 focus:ring-2 focus:ring-green-400"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition h-fit"
                >
                  Add
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a query to view threads
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
