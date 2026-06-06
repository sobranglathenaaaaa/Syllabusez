"use client";
import React, { useState, useEffect } from 'react';

export default function About() {
  const [role, setRole] = useState('');
  const [content, setContent] = useState({
    helpCenter: '',
    privacyPolicy: '',
    terms: '',
    version: ''
  });

  useEffect(() => {
    const match = document.cookie.match(/session_role=([^;]+)/);
    if (match) setRole(decodeURIComponent(match[1]));
    // Mock load existing content
    setContent({
      helpCenter: 'Help center content goes here.',
      privacyPolicy: 'Privacy policy content goes here.',
      terms: 'Terms and conditions content goes here.',
      version: '1.0.0'
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('About content saved', content);
    // TODO: send to backend
    alert('Saved (mock)');
  };

  const isAdmin = role === 'admin';

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg glassmorphism">
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Help Center */}
        <div>
          <label className="block font-medium mb-1">Help Center</label>
          {isAdmin ? (
            <textarea
              name="helpCenter"
              value={content.helpCenter}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows={3}
            />
          ) : (
            <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{content.helpCenter}</p>
          )}
        </div>
        {/* Privacy Policy */}
        <div>
          <label className="block font-medium mb-1">Privacy Policy</label>
          {isAdmin ? (
            <textarea
              name="privacyPolicy"
              value={content.privacyPolicy}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows={3}
            />
          ) : (
            <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{content.privacyPolicy}</p>
          )}
        </div>
        {/* Terms and Conditions */}
        <div>
          <label className="block font-medium mb-1">Terms and Conditions</label>
          {isAdmin ? (
            <textarea
              name="terms"
              value={content.terms}
              onChange={handleChange}
              className="w-full border rounded p-2"
              rows={3}
            />
          ) : (
            <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{content.terms}</p>
          )}
        </div>
        {/* System Version */}
        <div>
          <label className="block font-medium mb-1">System Version</label>
          {isAdmin ? (
            <input
              type="text"
              name="version"
              value={content.version}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          ) : (
            <p className="bg-gray-50 p-2 rounded">{content.version}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000] transition">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}


