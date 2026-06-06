"use client";

import React, { useState } from 'react';

/**
 * AppearanceSettings
 *
 * A client‑side settings panel that lets users toggle the UI theme and adjust
 * basic appearance preferences such as font size. It is imported by the
 * settings page via the alias '@/components/settings/AppearanceSettings'.
 */
export default function AppearanceSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const changeFontSize = (size) => setFontSize(size);

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Appearance Settings</h2>
      <div className="space-y-4">
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <span className="text-lg">Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
            className="transform scale-125"
          />
        </div>
        {/* Font size selector */}
        <div className="flex items-center justify-between">
          <span className="text-lg">Font Size</span>
          <select
            value={fontSize}
            onChange={(e) => changeFontSize(e.target.value)}
            className="border rounded p-1"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </section>
  );
}
