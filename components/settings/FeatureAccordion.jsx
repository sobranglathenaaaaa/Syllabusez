// FeatureAccordion.jsx – vertical accordion for settings module
// Matches existing glassmorphism, maroon accents, and typography.

import React, { useState } from 'react';

// Sample feature data – can be extended or sourced dynamically
const FEATURES = [
  {
    title: 'Student Timetable',
    description: 'View your weekly schedule with course details, professor contacts, and room locations. The timetable updates in real time and supports export to calendar apps.',
    // Image generated to match UI aesthetic
    img: 'C:/Users/julie/.gemini/antigravity-ide/brain/23989c00-92fd-49c2-9caf-ef0d7de234a3/feature_timetable_mockup_1780717831908.png',
  },
  {
    title: 'Course Catalog',
    description: 'Browse all available courses, filter by department, credits, or semester, and view syllabus PDFs directly from the portal.',
    img: null,
  },
  {
    title: 'Notifications Center',
    description: 'Stay up‑to‑date with announcements, upcoming deadlines, and system messages. Mark as read or clear all with one click.',
    img: null,
  },
  {
    title: 'Profile Settings',
    description: 'Edit personal information, change password, and customize theme preferences. Changes are saved instantly.',
    img: null,
  },
];

export default function FeatureAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="mt-8 space-y-4">
      {FEATURES.map((feat, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl glassmorphism overflow-hidden transition-all duration-300"
        >
          {/* Title Row */}
          <button
            onClick={() => toggle(i)}
            className="w-full flex justify-between items-center px-5 py-3 text-left bg-[#800000] bg-opacity-10 hover:bg-opacity-20 transition-colors"
          >
            <span className="text-lg font-semibold text-gray-800">{feat.title}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Expandable Content */}
          {openIndex === i && (
            <div className="p-5 bg-white/80 backdrop-filter backdrop-blur-sm">
              <p className="mb-3 text-gray-700">{feat.description}</p>
              {feat.img && (
                <img
                  src={feat.img}
                  alt={feat.title}
                  className="w-full h-auto rounded-md shadow-md"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
