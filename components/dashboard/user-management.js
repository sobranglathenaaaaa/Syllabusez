"use client";

import { useState, useEffect, useCallback } from "react";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // list | add | batch

  // Add user form state
  const [addForm, setAddForm] = useState({ email: "", full_name: "", role: "instructor", password: "" });
  const [addStatus, setAddStatus] = useState(null);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editStatus, setEditStatus] = useState(null);

  // Batch upload state
  const [batchFile, setBatchFile] = useState(null);
  const [batchPreview, setBatchPreview] = useState([]);
  const [batchStatus, setBatchStatus] = useState(null);
  const [batchUploading, setBatchUploading] = useState(false);
  const [importedUsers, setImportedUsers] = useState([]);

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
        setAddForm({ email: "", full_name: "", role: "instructor", password: "" });
        fetchUsers();
      } else {
        setAddStatus({ type: "error", message: data.error });
      }
    } catch (err) {
      setAddStatus({ type: "error", message: "Failed to add user" });
    }
  };

  // Edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditStatus(null);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingUser.email,
          full_name: editingUser.full_name,
          role: editingUser.role,
          password: editingUser.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditStatus({ type: "success", message: "User profile updated successfully!" });
        setTimeout(() => {
          setEditingUser(null);
          setEditStatus(null);
        }, 1500);
        fetchUsers();
      } else {
        setEditStatus({ type: "error", message: data.error });
      }
    } catch (err) {
      setEditStatus({ type: "error", message: "Failed to update user profile" });
    }
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = "email,lastname,firstname,middlename,password\n" +
      "student.juan@pup.edu.ph,Gomez,Juan,Dela Cruz,pup_student.juan\n" +
      "student.maria@pup.edu.ph,Santos,Maria,Clara,\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pup_students_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download registry export
  const downloadRegistryCSV = () => {
    if (importedUsers.length === 0) return;
    const headers = ["Email", "Full Name", "Active Password"];
    const rows = importedUsers.map(user => [
      user.email,
      user.fullName || "",
      user.password
    ]);
    const csvContent = "\uFEFF" + [ // Added byte order mark for seamless Excel UTF-8 display!
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `imported_students_credentials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV / Excel file
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBatchFile(file);
    setBatchStatus(null);
    setBatchPreview([]);
    setImportedUsers([]);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    // skip header row if it looks like one
    const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

    const parsed = [];
    for (let i = startIndex; i < lines.length; i++) {
      // Support both comma and tab delimited
      const delimiter = lines[i].includes("\t") ? "\t" : ",";
      const cols = lines[i].split(delimiter);
      const email = cols[0]?.trim().replace(/^"|"$/g, "");
      const lastname = cols[1]?.trim().replace(/^"|"$/g, "") || "";
      const firstname = cols[2]?.trim().replace(/^"|"$/g, "") || "";
      const middlename = cols[3]?.trim().replace(/^"|"$/g, "") || "";
      const password = cols[4]?.trim().replace(/^"|"$/g, "") || "";
      if (email) {
        parsed.push({ email, lastname, firstname, middlename, password });
      }
    }
    setBatchPreview(parsed);
  };

  // Upload batch
  const handleBatchUpload = async () => {
    if (batchPreview.length === 0) return;
    setBatchUploading(true);
    setBatchStatus(null);
    setImportedUsers([]);
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
        setImportedUsers(data.imported || []);
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
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditingUser({ ...user, password: "" })}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20"
                placeholder="Enter password (optional)"
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
          <p className="text-sm text-gray-500 mb-3">
            Upload a CSV or Excel (.csv) file to add multiple students at once.
          </p>

          <div className="mb-6">
            <button
              onClick={downloadCSVTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-dashed border-[#800000]/30 hover:border-[#800000] hover:bg-red-50 text-[#800000] text-xs font-bold rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download CSV Template</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            File format: <strong>email, lastname, firstname, middlename, password</strong> — one student per row. Header row is optional. <br />
            <span className="text-[#800000] font-semibold">💡 Password Handling</span>: If a student's password field is blank or omitted in the template, a secure default password will be auto-generated based on the formula: <code className="bg-red-50 px-1 py-0.5 rounded text-[11px] font-mono">pup_ + email_username_prefix</code>.
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
                      <th className="px-4 py-2">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchPreview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{row.email}</td>
                        <td className="px-4 py-2 text-gray-600">{row.lastname}</td>
                        <td className="px-4 py-2 text-gray-600">{row.firstname}</td>
                        <td className="px-4 py-2 text-gray-600">{row.middlename}</td>
                        <td className="px-4 py-2 text-gray-500 italic font-mono">{row.password || "(Auto-generate)"}</td>
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

          {/* Successfully Imported Students Passwords reference */}
          {importedUsers.length > 0 && (
            <div className="mt-8 p-5 border border-green-200 bg-green-50/20 rounded-2xl">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                <span>Imported Students Credentials Registry</span>
              </h4>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                  The students below have been successfully created. Copy or print their temporary password details to share with them:
                </p>
                <button
                  onClick={downloadRegistryCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export Registry to Excel (CSV)</span>
                </button>
              </div>
              <div className="max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Full Name</th>
                      <th className="px-4 py-2.5">Active Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importedUsers.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-gray-800">{row.email}</td>
                        <td className="px-4 py-2.5 text-gray-600 font-medium">{row.fullName || "—"}</td>
                        <td className="px-4 py-2.5 text-[#800000] font-mono font-extrabold bg-red-50/10 border-l-2 border-[#800000] pl-3">{row.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === MODAL: Edit User Profile === */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-gray-900 text-base">Edit User Profile</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                ×
              </button>
            </div>

            {editStatus && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold ${
                editStatus.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {editStatus.message}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                  placeholder="Last Name, First Name M.I."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Role</label>
                <select
                  value={editingUser.role || "student"}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={editingUser.password || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                  placeholder="Leave blank to keep existing password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
