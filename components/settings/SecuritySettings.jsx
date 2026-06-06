"use client";

import React from 'react';

/**
 * SecuritySettings
 *
 * Placeholder component for user security preferences such as password changes,
 * two‑factor authentication, and login alerts.
 */
export default function SecuritySettings() {
  const [form, setForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Password change submitted', form);
    // TODO: send to backend for password change
    alert('Password changed (mock)');
  };

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="border rounded p-1 flex-1"
            required
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="border rounded p-1 flex-1"
            required
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="border rounded p-1 flex-1"
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000] transition">
            Change Password
          </button>
        </div>
      </form>
    </section>
  );

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Security Settings</h2>
      <p className="text-gray-600">Configure password, two‑factor authentication, and other security options here.</p>
    </section>
  );
}
