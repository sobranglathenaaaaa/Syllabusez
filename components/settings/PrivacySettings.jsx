"use client";
import React, { useState } from 'react';

/**
 * PrivacySettings
 *
 * Simple UI allowing users to toggle privacy related options such as data sharing
 * and activity tracking. This is a client‑side component because it uses React state.
 */
export default function PrivacySettings() {
  const [shareData, setShareData] = useState(true);
  const [trackActivity, setTrackActivity] = useState(false);

  const toggle = (setter) => () => setter(prev => !prev);

  return (
    <section className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Privacy Settings</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-lg">Share usage data with us</span>
          <input
            type="checkbox"
            checked={shareData}
            onChange={toggle(setShareData)}
            className="transform scale-125"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-lg">Allow activity tracking</span>
          <input
            type="checkbox"
            checked={trackActivity}
            onChange={toggle(setTrackActivity)}
            className="transform scale-125"
          />
        </label>
      </div>
    </section>
  );
}
