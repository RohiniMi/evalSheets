import React, { useState } from 'react';
import { 
  Plus, 
  FileCode, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  CheckCircle, 
  ListOrdered, 
  Code,
  Sparkles,
  BookOpen,
  UploadCloud,
  FileText
} from 'lucide-react';
import QuestionPaperUploaderModal from './QuestionPaperUploaderModal';

export default function QuestionManager({ questions, onAddQuestion, onDeleteQuestion, onImportQuestions, onRefreshData }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadPaperModal, setShowUploadPaperModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(10);
  const [newLanguage, setNewLanguage] = useState('C / C++');
  const [newDescription, setNewDescription] = useState('');
  const [newModelCode, setNewModelCode] = useState('');
  const [rubricItems, setRubricItems] = useState([
    { criterion: 'Header files & Function Signature', maxMarks: 2, requiredPatterns: 'include, int, void' },
    { criterion: 'Core algorithmic logic & loop traversal', maxMarks: 5, requiredPatterns: 'while, for, if' },
    { criterion: 'Edge condition check & return value', maxMarks: 3, requiredPatterns: 'return, NULL' }
  ]);

  const [expandedQId, setExpandedQId] = useState(questions[0]?.id || null);

  const handleAddRubricRow = () => {
    setRubricItems([
      ...rubricItems,
      { criterion: 'New Rubric Criterion', maxMarks: 2, requiredPatterns: '' }
    ]);
  };

  const handleRemoveRubricRow = (index) => {
    setRubricItems(rubricItems.filter((_, i) => i !== index));
  };

  const handleRubricChange = (index, field, value) => {
    const updated = [...rubricItems];
    updated[index][field] = field === 'maxMarks' ? Number(value) : value;
    setRubricItems(updated);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedRubrics = rubricItems.map((r, idx) => ({
      id: `r_${Date.now()}_${idx}`,
      criterion: r.criterion,
      maxMarks: Number(r.maxMarks) || 2,
      requiredPatterns: typeof r.requiredPatterns === 'string'
        ? r.requiredPatterns.split(',').map(s => s.trim()).filter(Boolean)
        : r.requiredPatterns
    }));

    onAddQuestion({
      title: newTitle,
      maxMarks: Number(newMaxMarks) || 10,
      language: newLanguage,
      description: newDescription,
      modelCode: newModelCode,
      rubric: formattedRubrics
    });

    // Reset
    setNewTitle('');
    setNewDescription('');
    setNewModelCode('');
    setShowAddModal(false);
  };

  // Import JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportQuestions(parsed);
          alert(`Successfully imported ${parsed.length} questions!`);
        } else {
          alert('JSON must be an array of question objects.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ABESEC_Question_Set_Rubrics.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalExamMarks = questions.reduce((sum, q) => sum + (q.maxMarks || 10), 0);

  return (
    <div className="space-y-6">
      {/* Question Paper Quick Ingestion Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#0f2d59] p-5 rounded-2xl text-white shadow-xs flex flex-wrap items-center justify-between gap-4 border border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>Upload Examination Question Paper (PDF / DOCX / TXT / JSON)</span>
              <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase">New</span>
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Upload your semester question paper file with marks. The AI parser extracts questions, marks allocation, and step-marking rubrics automatically.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadPaperModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <UploadCloud className="w-4 h-4 text-slate-950" />
          <span>Upload Question Paper</span>
        </button>
      </div>

      {/* Header Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              Active Question Paper &amp; Rubric Setup
            </h2>
            <span className="bg-blue-100 text-[#0f2d59] font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              Total: {totalExamMarks} Marks
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Questions, step-marking breakdown, required code patterns, and reference solutions for AI AST grading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowUploadPaperModal(true)}
            className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-800" />
            <span>Upload Paper</span>
          </button>

          <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload JSON Set</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Single Question</span>
          </button>
        </div>
      </div>


      {/* Question Cards List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = expandedQId === q.id;
          const rubricTotal = (q.rubric || []).reduce((sum, r) => sum + (r.maxMarks || 0), 0);

          return (
            <div 
              key={q.id || idx}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0f2d59] text-amber-400 flex items-center justify-center font-bold text-sm">
                    Q{q.questionNumber || (idx + 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {q.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{q.language || 'C / C++'}</span>
                      <span>•</span>
                      <span>{q.rubric?.length || 0} Step-marking criteria</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Max: {q.maxMarks} Marks</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded-md font-mono font-bold">
                    {q.maxMarks} Marks
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete Question ${q.questionNumber}?`)) {
                        onDeleteQuestion(q.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Rubric and Model Code View */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-4">
                  {/* Description */}
                  {q.description && (
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-sm text-slate-700">
                      <strong className="text-slate-900 block mb-1">Problem Statement:</strong>
                      {q.description}
                    </div>
                  )}

                  {/* Rubric Breakdown Matrix */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                      <span>Step-Wise Marking Rubric (Total: {rubricTotal} Marks)</span>
                    </h4>

                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-600">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Evaluation Criterion</th>
                            <th className="py-2 px-3">Required Code Patterns / Keywords</th>
                            <th className="py-2 px-3 text-right">Marks Allocated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(q.rubric || []).map((r, rIdx) => (
                            <tr key={r.id || rIdx} className="hover:bg-slate-50/60">
                              <td className="py-2.5 px-3 font-mono text-slate-400">{rIdx + 1}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-800">{r.criterion}</div>
                                {r.description && <div className="text-[11px] text-slate-500">{r.description}</div>}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {(r.requiredPatterns || []).map((pat, pIdx) => (
                                    <span key={pIdx} className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200">
                                      {pat}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                {r.maxMarks}m
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Reference Model Code */}
                  {q.modelCode && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-blue-600" />
                        <span>Reference / Model Implementation</span>
                      </h4>
                      <pre className="bg-[#0f172a] text-slate-200 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                        <code>{q.modelCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Question with Rubrics</h3>
                <p className="text-xs text-slate-500">Configure question problem statement, marks weightage, and step-marking rubric</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Question Title / Problem Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement Circular Queue with Enqueue & Dequeue"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2d59]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2d59]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Language</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="C / C++">C / C++ (AKTU Standard)</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Problem Description</label>
                <textarea
                  rows="3"
                  placeholder="Specify problem constraints, arguments, and required time/space complexity..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Model Code Solution</label>
                <textarea
                  rows="4"
                  placeholder="// Paste expected reference code here..."
                  value={newModelCode}
                  onChange={(e) => setNewModelCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs bg-slate-50"
                ></textarea>
              </div>

              {/* Rubrics Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Step-marking Rubric Items</label>
                  <button
                    type="button"
                    onClick={handleAddRubricRow}
                    className="text-[#0f2d59] font-semibold text-xs flex items-center gap-1 hover:underline"
                  >
                    + Add Criterion
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rubricItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Criterion description"
                        value={item.criterion}
                        onChange={(e) => handleRubricChange(index, 'criterion', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Required tokens (comma separated)"
                        value={item.requiredPatterns}
                        onChange={(e) => handleRubricChange(index, 'requiredPatterns', e.target.value)}
                        className="w-36 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Marks"
                        value={item.maxMarks}
                        onChange={(e) => handleRubricChange(index, 'maxMarks', e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRubricRow(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2d59] text-white rounded-lg font-bold hover:bg-[#1a3d75]"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Question Paper Modal */}
      {showUploadPaperModal && (
        <QuestionPaperUploaderModal
          onClose={() => setShowUploadPaperModal(false)}
          onApplyQuestionPaper={(newQuestions) => {
            onImportQuestions(newQuestions);
          }}
          onRefreshData={onRefreshData}
        />
      )}
    </div>
  );
}
