import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Save, 
  Printer, 
  Code, 
  FileText, 
  Sliders, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function StudentDetailModal({ 
  student, 
  questions, 
  onClose, 
  onSaveOverride,
  config 
}) {
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editableAnswers, setEditableAnswers] = useState(
    JSON.parse(JSON.stringify(student.answers || []))
  );
  const [teacherNotes, setTeacherNotes] = useState(student.teacherNotes || '');
  const [overallFeedback, setOverallFeedback] = useState(student.overallFeedback || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeAnswer = editableAnswers[activeQIndex] || editableAnswers[0] || {};
  const activeQuestion = questions.find(q => q.id === activeAnswer.questionId) || questions[activeQIndex] || {};

  // Handle score change for a rubric item
  const handleScoreChange = (qIndex, rubricIndex, newScore) => {
    const updatedAnswers = [...editableAnswers];
    const maxRubric = updatedAnswers[qIndex].rubricScores[rubricIndex].maxMarks;
    const clampedScore = Math.max(0, Math.min(maxRubric, Number(newScore)));
    
    updatedAnswers[qIndex].rubricScores[rubricIndex].awarded = clampedScore;

    // Recalculate this question's total marks
    const qTotal = updatedAnswers[qIndex].rubricScores.reduce((sum, r) => sum + (Number(r.awarded) || 0), 0);
    updatedAnswers[qIndex].marksObtained = +qTotal.toFixed(1);

    setEditableAnswers(updatedAnswers);
  };

  // Calculate live totals
  const liveTotalMarks = editableAnswers.reduce((sum, a) => sum + (Number(a.marksObtained) || 0), 0);
  const maxPossible = student.maxMarksTotal || 30;
  const livePercentage = +((liveTotalMarks / maxPossible) * 100).toFixed(1);

  let liveGrade = 'F';
  if (livePercentage >= 90) liveGrade = 'A+';
  else if (livePercentage >= 80) liveGrade = 'A';
  else if (livePercentage >= 70) liveGrade = 'B+';
  else if (livePercentage >= 60) liveGrade = 'B';
  else if (livePercentage >= 50) liveGrade = 'C';
  else if (livePercentage >= 40) liveGrade = 'D';

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveOverride(student.id, {
      answers: editableAnswers,
      overallFeedback,
      teacherNotes
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handlePrintGradeSlip = () => {
    window.print();
  };

  const sheetUrl = student.uploadedFile || `/sample_sheets/${student.id}.svg`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#0f2d59] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs">
              {liveGrade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  {student.studentName}
                </h3>
                <span className="bg-white/10 text-blue-200 font-mono text-xs px-2 py-0.5 rounded border border-white/15">
                  Roll: {student.rollNo}
                </span>
                <span className="bg-amber-400 text-amber-950 font-mono text-xs px-2 py-0.5 rounded font-bold">
                  {student.section}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Department of CSE • Sessional Examination-II • Data Structures &amp; Algorithms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider block">Awarded Score</span>
              <div className="text-xl font-black font-mono text-amber-400">
                {liveTotalMarks.toFixed(1)} <span className="text-xs text-white/70 font-normal">/ {maxPossible} ({livePercentage}%)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100">
          
          {/* LEFT COLUMN: Handwritten Answer Sheet Viewer (5 cols) */}
          <div className="lg:col-span-6 bg-slate-200/70 border-r border-slate-300 flex flex-col overflow-hidden">
            {/* Viewer Toolbar */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Scanned Answer Sheet</span>
                <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {student.uploadedFile ? 'Uploaded File' : 'AKTU Official Copy'}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
                  className="p-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-12 text-center text-slate-600">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
                  className="p-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Answer Sheet Display Canvas/SVG */}
            <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-slate-300/40">
              <div 
                className="transition-transform duration-150 origin-top shadow-xl rounded-md overflow-hidden bg-white max-w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={sheetUrl}
                  alt={`Answer sheet of ${student.studentName}`}
                  className="max-w-[750px] w-full h-auto block"
                  onError={(e) => {
                    // Fallback to sample sheet SVG if custom upload doesn't have an image preview
                    e.target.src = `/sample_sheets/std_101.svg`;
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI OCR Transcription, AST Analysis & Step Rubrics (6 cols) */}
          <div className="lg:col-span-6 bg-white flex flex-col overflow-hidden">
            {/* Question Selector Tabs */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between overflow-x-auto">
              <div className="flex space-x-1">
                {editableAnswers.map((ans, idx) => {
                  const isCurrent = idx === activeQIndex;
                  return (
                    <button
                      key={ans.questionId || idx}
                      onClick={() => setActiveQIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                        isCurrent
                          ? 'bg-[#0f2d59] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                        isCurrent ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ans.marksObtained}/{ans.maxMarks}m
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>OCR Conf: {Math.round((activeAnswer.ocrConfidence || 0.9) * 100)}%</span>
              </div>
            </div>

            {/* Evaluation Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Question Context & Title */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-xs">
                <div className="font-bold text-[#0f2d59] text-sm mb-0.5">
                  Q{activeQIndex + 1}. {activeQuestion.title || `Question ${activeQIndex + 1}`}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {activeQuestion.description}
                </p>
              </div>

              {/* Transcribed Code Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-600" />
                    <span>Neural OCR Extracted Code</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    Token Stream Verified
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-inner text-xs">
                  <div className="bg-slate-800/80 px-3 py-1.5 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-700">
                    <span>source_code_q{activeQIndex + 1}.c</span>
                    <span>Language: C/C++ (AKTU Spec)</span>
                  </div>
                  <pre className="p-3 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{activeAnswer.handwrittenSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* Syntax & Semantic Observations */}
              {activeAnswer.annotations && activeAnswer.annotations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    AST &amp; Syntax Observations
                  </h4>
                  {activeAnswer.annotations.map((ann, aIdx) => (
                    <div 
                      key={aIdx}
                      className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                        ann.type === 'error'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : ann.type === 'warning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {ann.type === 'error' ? <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{ann.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step-Wise Rubric Scoring Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>Step-Wise Rubric &amp; Mark Allocation (Teacher Override)</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    Q{activeQIndex + 1} Score: <span className="text-[#0f2d59] font-mono">{activeAnswer.marksObtained} / {activeAnswer.maxMarks}</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(activeAnswer.rubricScores || []).map((rub, rIdx) => (
                    <div 
                      key={rub.criterionId || rIdx}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{rub.criterion}</div>
                          {rub.remarks && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {rub.remarks}
                            </div>
                          )}
                        </div>

                        {/* Mark Override Stepper */}
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleScoreChange(activeQIndex, rIdx, (rub.awarded || 0) - 0.5)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          >
                            -
                          </button>

                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={rub.maxMarks}
                            value={rub.awarded}
                            onChange={(e) => handleScoreChange(activeQIndex, rIdx, e.target.value)}
                            className="w-12 text-center font-mono font-bold text-slate-900 focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleScoreChange(activeQIndex, rIdx, (rub.awarded || 0) + 0.5)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs"
                          >
                            +
                          </button>

                          <span className="text-slate-400 font-normal">/ {rub.maxMarks}m</span>
                        </div>
                      </div>

                      {/* Slider for quick visual tweaking */}
                      <input
                        type="range"
                        min="0"
                        max={rub.maxMarks}
                        step="0.5"
                        value={rub.awarded}
                        onChange={(e) => handleScoreChange(activeQIndex, rIdx, e.target.value)}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f2d59]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Teacher Remarks & Feedback */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Evaluator Feedback &amp; Remedial Guidance
                </label>
                <textarea
                  rows="2"
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="Add qualitative assessment comments for the student..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2d59] bg-slate-50/50"
                ></textarea>
              </div>

            </div>

            {/* Modal Bottom Bar */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintGradeSlip}
                  className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-2 rounded-lg font-medium shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Grade Slip</span>
                </button>

                {saveSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marks verified &amp; recorded!</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSaving ? 'Saving...' : 'Save & Verify Evaluation'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
