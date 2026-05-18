"use client";

import { useState, useEffect, useCallback } from "react";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // list | add | batch

  // Add user form state
  const [addForm, setAddForm] = useState({ email: "", full_name: "", role: "instructor" });
  const [addStatus, setAddStatus] = useState(null);

  // Batch upload state
  const [batchFile, setBatchFile] = useState(null);
  const [batchPreview, setBatchPreview] = useState([]);
  const [batchStatus, setBatchStatus] = useState(null);
  const [batchUploading, setBatchUploading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add single user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddStatus(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAddStatus({ type: "success", message: "User added successfully!" });
        setAddForm({ email: "", full_name: "", role: "instructor" });
        fetchUsers();
      } else {
        setAddStatus({ type: "error", message: data.error });
      }
    } catch (err) {
      setAddStatus({ type: "error", message: "Failed to add user" });
    }
  };

  // Parse CSV / Excel file
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBatchFile(file);
    setBatchStatus(null);
    setBatchPreview([]);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    // skip header row if it looks like one
    const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

    const parsed = [];
    for (let i = startIndex; i < lines.length; i++) {
      // Support both comma and tab delimited
      const cols = lines[i].includes("\t") ? lines[i].split("\t") : lines[i].split(",");
      const email = cols[0]?.trim();
      const lastname = cols[1]?.trim() || "";
      const firstname = cols[2]?.trim() || "";
      const middlename = cols[3]?.trim() || "";
      if (email) {
        parsed.push({ email, lastname, firstname, middlename });
      }
    }
    setBatchPreview(parsed);
  };

  // Upload batch
  const handleBatchUpload = async () => {
    if (batchPreview.length === 0) return;
    setBatchUploading(true);
    setBatchStatus(null);
    try {
      const res = await fetch("/api/users/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: batchPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setBatchStatus({
          type: "success",
          message: `${data.success} student(s) added successfully. ${data.failed} failed.`,
          errors: data.errors,
        });
        setBatchPreview([]);
        setBatchFile(null);
        fetchUsers();
      } else {
        setBatchStatus({ type: "error", message: data.error });
      }
    } catch {
      setBatchStatus({ type: "error", message: "Upload failed" });
    }
    setBatchUploading(false);
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: "list", label: "All Users" },
          { key: "add", label: "Add User" },
          { key: "batch", label: "Batch Upload Students" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#800000] text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === TAB: User List === */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">Loading users...</div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.full_name || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "instructor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* === TAB: Add Individual User (Instructors or any role) === */}
      {activeTab === "add" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Individual User</h3>
          <p className="text-sm text-gray-500 mb-6">
            Use this form to add instructors or individual users with a specific role.
          </p>

          {addStatus && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              addStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {addStatus.message}
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20"
                placeholder="Last Name, First Name M.I."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 bg-white"
              >
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#800000] text-white rounded-xl font-semibold text-sm hover:bg-red-900 transition-colors shadow-md active:scale-[0.98]"
            >
              Add User
            </button>
          </form>
        </div>
      )}

      {/* === TAB: Batch Upload Students === */}
      {activeTab === "batch" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Batch Upload Students</h3>
          <p className="text-sm text-gray-500 mb-2">
            Upload a CSV or Excel (.csv) file to add multiple students at once.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            File format: <strong>email, lastname, firstname, middlename</strong> — one student per row. Header row is optional.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors mb-6">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="batch-file-input"
            />
            <label htmlFor="batch-file-input" className="cursor-pointer">
              <div className="text-gray-400 mb-2">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {batchFile ? batchFile.name : "Click to select a file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">CSV or Excel files accepted</p>
            </label>
          </div>

          {/* Preview */}
          {batchPreview.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Preview ({batchPreview.length} student{batchPreview.length !== 1 ? "s" : ""})
              </h4>
              <div className="max-h-60 overflow-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Last Name</th>
                      <th className="px-4 py-2">First Name</th>
                      <th className="px-4 py-2">Middle Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchPreview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{row.email}</td>
                        <td className="px-4 py-2 text-gray-600">{row.lastname}</td>
                        <td className="px-4 py-2 text-gray-600">{row.firstname}</td>
                        <td className="px-4 py-2 text-gray-600">{row.middlename}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchPreview.length > 20 && (
                  <div className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">
                    ...and {batchPreview.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          {batchStatus && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              batchStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <p>{batchStatus.message}</p>
              {batchStatus.errors?.length > 0 && (
                <ul className="mt-2 text-xs space-y-1">
                  {batchStatus.errors.map((err, i) => (
                    <li key={i}>• {err.email}: {err.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={handleBatchUpload}
            disabled={batchPreview.length === 0 || batchUploading}
            className="w-full py-3 bg-[#800000] text-white rounded-xl font-semibold text-sm hover:bg-red-900 transition-colors shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchUploading ? "Uploading..." : `Upload ${batchPreview.length} Student${batchPreview.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
