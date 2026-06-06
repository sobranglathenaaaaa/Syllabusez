"use client";
import React from 'react';

export default function ProfileInformation() {
  const [role, setRole] = React.useState('');
  React.useEffect(() => {
    const match = document.cookie.match(/session_role=([^;]+)/);
    if (match) setRole(decodeURIComponent(match[1]));
  }, []);
  const isStudent = role === 'student';
  return (
    <div className="p-4 bg-white rounded-lg shadow glassmorphism">
      <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
      <form className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Profile Picture</label>
          <input type="file" accept="image/*" className="border rounded p-1" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Full Name</label>
          <input type="text" placeholder="Enter full name" className="border rounded p-1 flex-1" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Email</label>
          <input type="email" placeholder="Enter email" className="border rounded p-1 flex-1" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Contact Number</label>
          <input type="tel" placeholder="Enter contact number" className="border rounded p-1 flex-1" />
        </div>
{isStudent && (
  <>
    <div className="flex items-center space-x-4">
      <label className="w-32 font-medium">Student Number</label>
      <input type="text" placeholder="Enter student number" className="border rounded p-1 flex-1" />
    </div>
    <div className="flex items-center space-x-4">
      <label className="w-32 font-medium">Course</label>
      <input type="text" placeholder="Enter course" className="border rounded p-1 flex-1" />
    </div>
  </>
)}
<hr className="my-4" />
        <h3 className="text-xl font-semibold">Appearance</h3>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Theme</label>
          <select className="border rounded p-1 flex-1">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Theme Color</label>
          <input type="color" className="border rounded p-1 flex-1" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 font-medium">Font Size</label>
          <input type="number" min="12" max="24" defaultValue="16" className="border rounded p-1 flex-1" />
        </div>
      </form>
    </div>
  );
}
