import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  UploadCloud, 
  LayoutDashboard, 
  Settings, 
  CheckCircle2, 
  Award,
  BookOpen
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, config, stats }) {
  const institution = config?.institution || {
    name: 'ABES Engineering College',
    shortName: 'ABESEC',
    location: 'Ghaziabad, Uttar Pradesh',
    collegeCode: '032 (AKTU)'
  };

  const exam = config?.examDetails || {
    department: 'Department of Computer Science & Engineering',
    subject: 'Data Structures & Algorithms (BCS-301)',
    examTitle: 'Sessional Examination-II (2025-26)',
    evaluator: 'Dr. Alok Kumar (CSE)'
  };

  const navItems = [
    { id: 'dashboard', label: 'Evaluation Gradebook', icon: LayoutDashboard, badge: stats?.totalEvaluated },
    { id: 'questions', label: 'Question Set & Rubrics', icon: FileText, badge: stats?.totalQuestions },
    { id: 'upload', label: 'Bulk Sheet Upload', icon: UploadCloud, highlight: true },
    { id: 'settings', label: 'College & Exam Config', icon: Settings }
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      {/* Top institution bar with official ABESEC styling */}
      <div className="bg-[#0f2d59] text-white px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-amber-500">
        <div className="flex items-center gap-3">
          {/* ABESEC Emblem */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-xl text-[#0f2d59] shadow-inner">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-wide uppercase">
                {institution.name}
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-mono font-medium border border-amber-400/30">
                AKTU Code: {institution.collegeCode}
              </span>
            </div>
            <p className="text-xs text-blue-200 font-light flex items-center gap-2">
              <span>{exam.department}</span>
              <span className="inline-block w-1 h-1 bg-amber-400 rounded-full"></span>
              <span>{institution.location}</span>
            </p>
          </div>
        </div>

        {/* Exam Session Pill & Evaluator */}
        <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-blue-200 block text-[10px]">CURRENT SUBJECT</span>
              <span className="font-semibold text-white">{exam.subject}</span>
            </div>
          </div>
          <div className="bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 rounded-lg text-amber-200 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{exam.evaluator}</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-4 sm:px-8 flex items-center justify-between overflow-x-auto bg-slate-50/80">
        <nav className="flex space-x-1 sm:space-x-4 py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#0f2d59] text-white shadow-sm' 
                    : item.highlight
                    ? 'text-amber-800 bg-amber-100/70 hover:bg-amber-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.highlight ? 'text-amber-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700">AutoGrade-ABESEC Engine Active</span>
        </div>
      </div>
    </header>
  );
}
