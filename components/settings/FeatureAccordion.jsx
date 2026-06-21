"use client";

import { useState } from 'react';
import {
  IconChevronDown,
  IconSparkles,
  IconFileText,
  IconShieldCheck,
  IconUsers,
  IconBolt,
  IconLayoutDashboard,
  IconDatabase
} from '@tabler/icons-react';

const FEATURES = [
  {
    id: 'syllabus-builder',
    title: 'Outcomes-Based Syllabus Builder',
    description: 'Design comprehensive syllabi with automated mapping between Institutional Learning Outcomes (ILO), Program Learning Outcomes (PLO), and Course Learning Outcomes (CLO). Our dynamic builder ensures academic alignment with polytechnic standards.',
    icon: IconLayoutDashboard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    visual: (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="flex gap-2 mb-3">
          <div className="w-8 h-3 bg-amber-200 rounded-full" />
          <div className="w-12 h-3 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-white border border-gray-100 rounded shadow-sm" />
          <div className="h-2 w-3/4 bg-white border border-gray-100 rounded shadow-sm" />
          <div className="h-2 w-1/2 bg-white border border-gray-100 rounded shadow-sm" />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-amber-500 rounded-sm" />
            <div className="w-4 h-4 bg-amber-300 rounded-sm" />
          </div>
          <div className="text-[10px] font-bold text-amber-700 uppercase">Alignment: 100%</div>
        </div>
      </div>
    )
  },
  {
    id: 'ocr-scanner',
    title: 'Intelligent OCR Integration',
    description: 'Digitize your legacy syllabi in seconds. Using advanced Tesseract-powered character recognition, the portal extracts weekly plans and grading parameters directly from printed documents or screenshots.',
    icon: IconSparkles,
    color: 'text-[#800000]',
    bgColor: 'bg-red-50',
    visual: (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#800000]/5 to-transparent" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shadow-sm">
            <IconBolt size={20} className="text-[#800000]" />
          </div>
          <div>
            <div className="h-2 w-20 bg-gray-300 rounded-full mb-1" />
            <div className="h-2 w-12 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="space-y-1.5 opacity-60">
          <div className="h-1.5 w-full bg-white rounded" />
          <div className="h-1.5 w-full bg-white rounded" />
          <div className="h-1.5 w-2/3 bg-white rounded" />
        </div>
      </div>
    )
  },
  {
    id: 'secure-materials',
    title: 'Encrypted Material Hosting',
    description: 'Securely upload and manage course materials. Our system uses signed URL technology to ensure that resources are only accessible to authorized students and faculty within specific time windows.',
    icon: IconShieldCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    visual: (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2 shadow-sm">
            <IconFileText size={14} className="text-indigo-500" />
            <div className="h-1.5 w-12 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'approval-workflow',
    title: 'Dynamic Approval Pipeline',
    description: 'Streamline the syllabus review process. Admins and Department Heads can comment, request revisions, and approve syllabi through a centralized dashboard with version history tracking.',
    icon: IconUsers,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    visual: (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-[#800000]/20 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white" />
          </div>
          <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full">APPROVED</div>
        </div>
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 w-full" />
        </div>
      </div>
    )
  }
];

export default function FeatureAccordion() {
  const [openId, setOpenId] = useState('syllabus-builder');

  return (
    <div className="w-full space-y-3">
      <div className="pb-2">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Portal Features</h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Explore the core capabilities of Syllabusez.</p>
      </div>

      <div className="space-y-2">
        {FEATURES.map((feature) => {
          const isOpen = openId === feature.id;
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className={`group overflow-hidden transition-all duration-300 border ${
                isOpen
                  ? 'bg-white border-gray-200 rounded-2xl shadow-sm'
                  : 'bg-gray-50/50 border-gray-100 rounded-xl hover:bg-white hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : feature.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-4 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon size={20} className={feature.color} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold transition-colors ${
                      isOpen ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {feature.title}
                    </h4>
                    {!isOpen && (
                      <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
                <IconChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`text-gray-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-[#800000]' : ''
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-5 pt-1 ml-14">
                  <p className="text-xs text-gray-600 leading-relaxed font-medium max-w-lg">
                    {feature.description}
                  </p>
                  {feature.visual}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
