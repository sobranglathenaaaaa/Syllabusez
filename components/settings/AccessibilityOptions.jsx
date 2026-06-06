"use client";
import React, { useState } from 'react';

/**
 * AccessibilityOptions
 *
 * A settings panel that allows users to customize accessibility features
 * such as high‑contrast mode, enlarged text, and screen‑reader support.
 *
 * This component is referenced by the settings page via the alias
 * '@/components/settings/AccessibilityOptions'.
 */
export default function AccessibilityOptions() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const toggle = (setter) => () => setter((prev) => !prev);

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Accessibility Options</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-lg">High Contrast Mode</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={toggle(setHighContrast)}
            className="transform scale-125"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">Enlarge Text</span>
          <input
            type="checkbox"
            checked={largeText}
            onChange={toggle(setLargeText)}
            className="transform scale-125"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">Screen Reader Support</span>
          <input
            type="checkbox"
            checked={screenReader}
            onChange={toggle(setScreenReader)}
            className="transform scale-125"
          />
        </label>
      </div>
    </section>
  );
}
