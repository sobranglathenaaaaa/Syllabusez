"use client";

import { useEffect, useState } from "react";

export function Greeting({ fullName }) {
  const [greeting, setGreeting] = useState("Good day");
  const [submessage, setSubmessage] = useState("Welcome back to the portal!");

  // List of welcome messages
  const welcomeMessages = [
    "Ready to shape the future of learning today?",
    "Hope you are having an outstanding and productive day!",
    "Welcome back to your academic management dashboard.",
    "Let's build a stronger curriculum together.",
    "Your central portal for academic alignment, quality, and excellence."
  ];

  useEffect(() => {
    // Determine time-based greeting
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good morning");
    } else if (hours >= 12 && hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    // Set a random welcome message
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setSubmessage(welcomeMessages[randomIndex]);
  }, []);

  // Extract first name (ignore titles like Dr. or Prof.)
  const getFirstName = (name) => {
    if (!name) return "PUPian";
    const cleanName = name.replace(/^(Dr\.|Prof\.)\s+/i, "");
    const parts = cleanName.split(/\s+/).filter(Boolean);
    // In case of Filipino name format: Last Name, First Name...
    if (name.includes(",")) {
      const firstNamePart = name.split(",")[1]?.trim();
      return firstNamePart ? firstNamePart.split(" ")[0] : "PUPian";
    }
    return parts[0] || "PUPian";
  };

  const firstName = getFirstName(fullName);

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm relative overflow-hidden bg-gradient-to-r from-white via-white to-red-50/10">
      {/* Background design elements */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-red-900/5 rounded-full blur-2xl -mr-6 -mt-6" />
      <div className="absolute right-12 bottom-0 w-16 h-16 bg-red-900/5 rounded-full blur-xl -mb-4" />

      <div className="relative z-10">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {greeting}, <span className="text-[#800000]">{firstName}</span>!
        </h2>
        <p className="mt-2 text-sm lg:text-base text-gray-500 font-medium leading-relaxed">
          {submessage}
        </p>
      </div>
    </div>
  );
}
