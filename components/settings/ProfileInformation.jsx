"use client";
import React, { useState, useEffect } from "react";

export default function ProfileInformation() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    studentNumber: "",
    course: "",
    theme: "Light"
  });
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const match = document.cookie.match(/session_role=([^;]+)/);
    if (match) setRole(decodeURIComponent(match[1]));

    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/user");
        if (!userRes.ok) return;
        const { user } = await userRes.json();
        setUserId(user?.id || null);
        setForm(f => ({ ...f, fullName: user?.full_name || "", email: user?.email || "" }));

        const settingsRes = await fetch("/api/user/settings");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setForm(f => ({ ...f, theme: settings?.theme || settings?.preferences?.theme || f.theme }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userId) {
        await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: form.fullName, email: form.email })
        });
      }
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.fullName,
          timeZone: "UTC",
          language: "en",
          preferences: { theme: form.theme }
        })
      });
      alert("Profile saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow glassmorphism">
      <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} className="border rounded p-1 flex-1" />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="border rounded p-1 flex-1" />
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Contact Number</label>
          <input name="contact" value={form.contact} onChange={handleChange} className="border rounded p-1 flex-1" />
        </div>

        {role === "student" && (
          <>
            <div className="flex items-center space-x-4">
              <label className="w-32 font-medium">Student Number</label>
              <input name="studentNumber" value={form.studentNumber} onChange={handleChange} className="border rounded p-1 flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 font-medium">Course</label>
              <input name="course" value={form.course} onChange={handleChange} className="border rounded p-1 flex-1" />
            </div>
          </>
        )}

        <hr className="my-4" />
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Theme</label>
          <select name="theme" value={form.theme} onChange={handleChange} className="border rounded p-1">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
