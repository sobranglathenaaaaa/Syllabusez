"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export default function CourseAutosuggest({ 
  courses = [], 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Select or search for a course..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  
  const selectedCourse = courses.find(c => c.id === value);
  const displayValue = selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter courses based on search term
  const filteredCourses = courses.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (c.code && c.code.toLowerCase().includes(searchLower)) ||
      (c.title && c.title.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white flex items-center justify-between cursor-pointer focus-within:border-[#800000] focus-within:ring-2 focus-within:ring-[#800000]/10 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
      >
        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap mr-2">
          {displayValue || <span className="text-gray-400">{placeholder}</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 ml-1" />
            <input
              type="text"
              autoFocus
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-xs font-semibold focus:outline-none py-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between hover:bg-gray-50 ${c.id === value ? 'bg-red-50/50 text-[#800000] font-bold' : 'text-gray-700 font-semibold'}`}
                  onClick={() => {
                    onChange({ target: { value: c.id } });
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate pr-2">{c.code} - {c.title}</span>
                  {c.id === value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-gray-500 text-center italic">
                No courses found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
