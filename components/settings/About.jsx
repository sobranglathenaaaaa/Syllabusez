import React from 'react';

export default function About() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg glassmorphism">
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <form className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Help Center</label>
          <textarea className="w-full border rounded p-2" rows="3" placeholder="Enter help center content"></textarea>
        </div>
        <div>
          <label className="block font-medium mb-1">Privacy Policy</label>
          <textarea className="w-full border rounded p-2" rows="3" placeholder="Enter privacy policy"></textarea>
        </div>
        <div>
          <label className="block font-medium mb-1">Terms and Conditions</label>
          <textarea className="w-full border rounded p-2" rows="3" placeholder="Enter terms and conditions"></textarea>
        </div>
        <div>
          <label className="block font-medium mb-1">System Version</label>
          <input type="text" className="w-full border rounded p-2" placeholder="Enter system version" />
        </div>
      </form>
    </div>
  );
}
