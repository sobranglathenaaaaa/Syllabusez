import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BookOpen, ListOrdered, Calendar, CheckCircle } from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const sections = [
    { id: 'course-info', label: 'Course Info', icon: <Home size={18} /> },
    { id: 'vision-mission', label: 'Vision & Mission', icon: <BookOpen size={18} /> },
    { id: 'outcomes', label: 'Learning Outcomes', icon: <ListOrdered size={18} /> },
    { id: 'weekly-plan', label: 'OBTL Weekly Plan', icon: <Calendar size={18} /> },
    { id: 'grading', label: 'Grading System', icon: <CheckCircle size={18} /> },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-4 hidden md:block w-64 h-screen overflow-y-auto p-4 bg-white/60 backdrop-blur-lg rounded-xl shadow-lg">
      <ul className="space-y-2">
        {sections.map((sec) => (
          <li key={sec.id}>
            <button
              onClick={() => scrollTo(sec.id)}
              className="flex items-center w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {sec.icon}
              <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">{sec.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
