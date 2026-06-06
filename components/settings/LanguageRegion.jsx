"use client";
import React, { useState } from 'react';

/**
 * LanguageRegion
 *
 * Simple settings panel that lets users select their preferred language
 * and region. This component is referenced from the main settings page
 * via '@/components/settings/LanguageRegion'.
 */
export default function LanguageRegion() {
  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('US');

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
  ];

  const regions = [
    { code: 'US', label: 'United States' },
    { code: 'EU', label: 'Europe' },
    { code: 'AS', label: 'Asia' },
  ];

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Language & Region</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-lg">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">Region</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
