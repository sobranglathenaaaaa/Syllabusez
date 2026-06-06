"use client";
import React, { useState, useEffect } from 'react';

export default function ProfileInformation() {
  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    contact: '',
    studentNumber: '',
    course: '',
    theme: 'Light',
  });
  const [role, setRole] = useState('');
  // Load user role from cookie
  useEffect(() => {
    const match = document.cookie.match(/session_role=([^;]+)/);
    if (match) setRole(decodeURIComponent(match[1]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeToggle = () => {
    setForm((prev) => ({ ...prev, theme: prev.theme === 'Light' ? 'Dark' : 'Light' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile submitted', form);
    // TODO: send to backend
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow glassmorphism">
      <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Profile Picture</label>
          <input type="file" accept="image/*" className="border rounded p-1" />
        </div>
        {/* Full Name */}
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            className="border rounded p-1 flex-1"
          />
        </div>
        {/* Email */}
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="border rounded p-1 flex-1"
          />
        </div>
        {/* Contact Number */}
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Contact Number</label>
          <input
            type="tel"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Enter contact number"
            className="border rounded p-1 flex-1"
          />
        </div>
        {/* Student specific fields */}
        {role === 'student' && (
          <>
            <div className="flex items-center space-x-4">
              <label className="w-32 font-medium">Student Number</label>
              <input
                type="text"
                name="studentNumber"
                value={form.studentNumber}
                onChange={handleChange}
                placeholder="Enter student number"
                className="border rounded p-1 flex-1"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 font-medium">Course</label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Enter course"
                className="border rounded p-1 flex-1"
              />
            </div>
          </>
        )}
        <hr className="my-4" />
        <h3 className="text-xl font-semibold">Appearance</h3>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Theme</label>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="border rounded p-1 flex-1 text-left"
          >
            {form.theme}
          </button>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000] transition">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
