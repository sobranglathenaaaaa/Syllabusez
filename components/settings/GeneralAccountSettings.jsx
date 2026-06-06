"use client";
import React, { useState, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import PasswordChangeModal from '@/components/settings/PasswordChangeModal';

export default function GeneralAccountSettings() {
  const { settings, updateSettings, loading } = useUserSettings();
  const [form, setForm] = useState({ displayName: '', timeZone: '', language: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        displayName: settings.displayName || '',
        timeZone: settings.timeZone || 'UTC',
        language: settings.language || 'en',
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(form);
    // Optionally show a toast
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg glassmorphism">
      <h2 className="text-2xl font-bold mb-4">General / Account Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="displayName">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
            required
          />
        </div>
        {/* Email – read‑only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="p-2 bg-gray-50 rounded-md text-gray-600">{settings?.email || 'unknown@example.com'}</div>
        </div>
        {/* Time Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="timeZone">
            Time Zone
          </label>
          <select
            id="timeZone"
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
          >
            {['UTC', 'Asia/Manila', 'America/New_York', 'Europe/London'].map((tz) => (
              <option key={tz} value={tz}> {tz} </option>
            ))}
          </select>
        </div>
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#800000] focus:ring-[#800000]"
          >
            <option value="en">English</option>
            <option value="tl">Tagalog</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        {/* Change Password */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="text-sm text-[#800000] hover:underline"
          >
            Change Password
          </button>
        </div>
        {/* Save Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#800000] text-white rounded-md hover:bg-[#9b0000] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>

      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
