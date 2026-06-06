"use client";
import React, { useState } from 'react';

/**
 * NotificationPreferences
 *
 * Simple settings panel allowing users to enable/disable various notification
 * channels (email, push, SMS). It is imported by the main settings page via
 * '@/components/settings/NotificationPreferences'.
 */
export default function NotificationPreferences() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [sms, setSms] = useState(false);

  const toggle = (setter) => () => setter((prev) => !prev);

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-lg">Email Notifications</span>
          <input
            type="checkbox"
            checked={email}
            onChange={toggle(setEmail)}
            className="transform scale-125"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">Push Notifications</span>
          <input
            type="checkbox"
            checked={push}
            onChange={toggle(setPush)}
            className="transform scale-125"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">SMS Notifications</span>
          <input
            type="checkbox"
            checked={sms}
            onChange={toggle(setSms)}
            className="transform scale-125"
          />
        </label>
      </div>
    </section>
  );
}
