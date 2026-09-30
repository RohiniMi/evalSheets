import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Play, 
  Eye, 
  FileSpreadsheet,
  Printer,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ 
  students, 
  questions, 
  onSelectStudent, 
  onTriggerEvaluation, 
  isEvaluating,
  config 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Compute metrics
  const totalSubmissions = students.length;
  const evaluatedCount = students.filter(s => s.status.includes('Evaluated')).length;
  const maxPossible = questions.reduce((sum, q) => sum + (q.maxMarks || 10), 0) || 30;

  const validScores = students
    .filter(s => s.status.includes('Evaluated'))
    .map(s => s.totalMarksObtained || 0);

  const avgScore = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : 0;

  const avgPercentage = ((avgScore / maxPossible) * 100).toFixed(1);

  const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const topStudent = students.find(s => s.totalMarksObtained === highestScore && s.status.includes('Evaluated'));

  const passThreshold = config?.examDetails?.passingMarks || 12;
  const passedCount = students.filter(s => s.status.includes('Evaluated') && s.totalMarksObtained >= passThreshold).length;
  const passRate = evaluatedCount > 0 ? ((passedCount / evaluatedCount) * 100).toFixed(1) : 0;

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSection = selectedSection === 'ALL' || student.section === selectedSection;
      const matchesStatus = selectedStatus === 'ALL' || student.status.includes(selectedStatus);

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [students, searchTerm, selectedSection, selectedStatus]);

  // Handle Export
  const handleExport = (format) => {
    window.open(`/api/export/${format}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#0f2d59] via-[#1a3d75] to-[#0f2d59] rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ABESEC Neural Handwritten Verification Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Handwritten Code Evaluation &amp; Gradebook
          </h2>
          <p className="text-slate-200 text-sm mt-1">
            Real-time optical character transcription, rubric-based AST grading, and faculty verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onTriggerEvaluation()}
            disabled={isEvaluating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isEvaluating
                ? 'bg-amber-400 text-amber-950 cursor-not-allowed animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 active:scale-95'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'Evaluating Answer Sheets...' : 'Evaluate All Pending Sheets'}</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            title="Download CSV for University ERP"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            title="Print Official ABESEC Tabulation Sheet"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Submissions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0f2d59] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Submissions</span>
            <div className="text-2xl font-black text-slate-800">{totalSubmissions}</div>
            <span className="text-xs text-blue-600 font-medium">{evaluatedCount} Evaluated</span>
          </div>
        </div>

        {/* Card 2: Class Average */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Class Average</span>
            <div className="text-2xl font-black text-slate-800">
              {avgScore} <span className="text-xs font-normal text-slate-400">/ {maxPossible}</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium">{avgPercentage}% performance</span>
          </div>
        </div>

        {/* Card 3: Highest Marks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Highest Marks</span>
            <div className="text-2xl font-black text-amber-600">
              {highestScore} <span className="text-xs font-normal text-slate-400">/ {maxPossible}</span>
            </div>
            <span className="text-xs text-slate-600 truncate block max-w-[120px]">
              {topStudent?.studentName || 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 4: Pass Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pass Rate</span>
            <div className="text-2xl font-black text-slate-800">{passRate}%</div>
            <span className="text-xs text-indigo-600 font-medium">{passedCount} passed &ge; {passThreshold}m</span>
          </div>
        </div>

        {/* Card 5: Remedial / Review Needed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Needs Review</span>
            <div className="text-2xl font-black text-rose-600">
              {students.filter(s => s.status.includes('Review') || s.percentage < 50).length}
            </div>
            <span className="text-xs text-rose-600 font-medium">Faculty review required</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name, AKTU roll no, section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d59] focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Section dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sections</option>
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
              <option value="CSE-C">CSE-C</option>
              <option value="CSE-AI">CSE-AI</option>
              <option value="CSE-DS">CSE-DS</option>
            </select>
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Evaluated">Evaluated</option>
              <option value="Review">Needs Review</option>
              <option value="Uploaded">Pending</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filteredStudents.length}</span> of {students.length} students
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Student &amp; Roll No</th>
                <th className="py-3 px-4">Section</th>
                {questions.map((q, idx) => (
                  <th key={q.id || idx} className="py-3 px-3 text-center">
                    Q{q.questionNumber || (idx + 1)} ({q.maxMarks}m)
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Total Marks</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7 + questions.length} className="text-center py-10 text-slate-400">
                    No answer sheets found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isEvaluated = student.status.includes('Evaluated');
                  const isNeedsReview = student.status.includes('Review');

                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectStudent(student)}
                    >
                      {/* Name & Roll */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-[#0f2d59] flex items-center gap-2">
                          <span>{student.studentName}</span>
                          {student.percentage >= 90 && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Top</span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {student.rollNo}
                        </div>
                      </td>

                      {/* Section */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs font-medium">
                          {student.section}
                        </span>
                      </td>

                      {/* Question wise scores */}
                      {questions.map((q, idx) => {
                        const ans = student.answers?.find(a => a.questionId === q.id || a.questionNumber === (idx + 1));
                        const score = ans ? ans.marksObtained : '-';
                        return (
                          <td key={q.id || idx} className="py-3 px-3 text-center font-mono text-xs">
                            <span className={score !== '-' && score < (q.maxMarks * 0.5) ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                              {score}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total Marks */}
                      <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                        <span className="text-base text-[#0f2d59]">
                          {student.totalMarksObtained}
                        </span>
                        <span className="text-xs text-slate-400 font-normal"> / {student.maxMarksTotal}</span>
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold text-slate-800">{student.percentage}%</span>
                        </div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.percentage >= 80 ? 'bg-emerald-500' :
                              student.percentage >= 60 ? 'bg-blue-500' :
                              student.percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.percentage}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-extrabold font-mono ${
                          student.grade === 'A+' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          student.grade === 'A' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                          student.grade === 'B+' || student.grade === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          student.grade === 'C' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          student.grade === 'D' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {student.grade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isEvaluated 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isNeedsReview 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isEvaluated ? 'bg-emerald-500' : isNeedsReview ? 'bg-rose-500' : 'bg-amber-500'
                          }`}></span>
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(student);
                          }}
                          className="inline-flex items-center gap-1 bg-[#0f2d59]/10 hover:bg-[#0f2d59] text-[#0f2d59] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Sheet</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span>ABES Engineering College • Evaluator: <strong>{config?.examDetails?.evaluator}</strong></span>
          </div>
          <div>
            <span>Standard AKTU 10-Point Grading Scale Applied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
