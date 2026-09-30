import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  FileCode, 
  ArrowRight,
  BookOpen,
  Edit2
} from 'lucide-react';

export default function QuestionPaperUploaderModal({ 
  onClose, 
  onApplyQuestionPaper, 
  onRefreshData 
}) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'paste' | 'samples'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [samplePapers, setSamplePapers] = useState([]);
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch available sample papers from server
  useEffect(() => {
    fetch('/api/sample-papers')
      .then(res => res.json())
      .then(data => setSamplePapers(data))
      .catch(err => console.error(err));
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  // Run AI / Heuristic Parser (Preview Mode)
  const handleParsePreview = async (overridePreset = null) => {
    setIsProcessing(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('preview', 'true');

    if (overridePreset) {
      formData.append('preset', overridePreset);
    } else if (activeMode === 'upload' && selectedFile) {
      formData.append('paper', selectedFile);
    } else if (activeMode === 'paste' && pastedText.trim()) {
      formData.append('text', pastedText);
    } else {
      setErrorMsg('Please select a file or paste question paper text.');
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/questions/upload-paper', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setParsedResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to parse question paper');
      }
    } catch (err) {
      setErrorMsg('Network error while parsing question paper');
    } finally {
      setIsProcessing(false);
    }
  };

  // Commit and Apply to Active Examination
  const handleApplyToExam = async () => {
    if (!parsedResult || !parsedResult.questions) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedResult.questions })
      });
      const data = await res.json();
      if (data.success) {
        onApplyQuestionPaper(parsedResult.questions);
        if (onRefreshData) onRefreshData();
        onClose();
      } else {
        setErrorMsg('Failed to apply question set');
      }
    } catch (err) {
      setErrorMsg('Error saving question paper');
    } finally {
      setIsProcessing(false);
    }
  };

  // Allow tweaking parsed question in preview
  const handleUpdateQuestionMarks = (qIndex, newMarks) => {
    const updated = { ...parsedResult };
    updated.questions[qIndex].maxMarks = Number(newMarks) || 0;
    setParsedResult(updated);
  };

  const totalCalculatedMarks = parsedResult?.questions?.reduce(
    (sum, q) => sum + (Number(q.maxMarks) || 0), 0
  ) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#0f2d59] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Upload Examination Question Paper</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  AKTU Format
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Upload question papers in PDF, DOCX, TXT, or JSON format. The system automatically extracts questions, marks allocation, and generates step-wise rubrics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Method Selection Tabs */}
          {!parsedResult && (
            <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
              <button
                onClick={() => setActiveMode('upload')}
                className={`pb-2.5 flex items-center gap-1.5 transition-all ${
                  activeMode === 'upload'
                    ? 'text-[#0f2d59] border-b-2 border-[#0f2d59] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Paper File (PDF/TXT/JSON)</span>
              </button>

              <button
                onClick={() => setActiveMode('paste')}
                className={`pb-2.5 flex items-center gap-1.5 transition-all ${
                  activeMode === 'paste'
                    ? 'text-[#0f2d59] border-b-2 border-[#0f2d59] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Paper Content</span>
              </button>

              <button
                onClick={() => setActiveMode('samples')}
                className={`pb-2.5 flex items-center gap-1.5 transition-all ${
                  activeMode === 'samples'
                    ? 'text-[#0f2d59] border-b-2 border-[#0f2d59] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Preset ABESEC Papers</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: File Uploader */}
          {!parsedResult && activeMode === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver 
                  ? 'border-[#0f2d59] bg-blue-50/50' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-[#0f2d59] flex items-center justify-center mx-auto shadow-xs">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Select or drop your Question Paper file'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts <strong>.pdf, .txt, .docx, .json</strong> question paper files
                  </p>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-all">
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.json,.md"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: Paste Raw Text */}
          {!parsedResult && activeMode === 'paste' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Paste Question Paper Text (with Question Numbers and [Marks]):
              </label>
              <textarea
                rows="9"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Example format:\n\nQ1. [10 Marks]\nWrite a C function to reverse a singly linked list iteratively...\n- Pointer declarations (2 Marks)\n- Traversal loop (3 Marks)\n\nQ2. [10 Marks]\nImplement Binary Search on a sorted array...`}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50/50 leading-relaxed focus:ring-2 focus:ring-[#0f2d59]"
              ></textarea>
            </div>
          )}

          {/* MODE 3: Preset Sample Question Papers */}
          {!parsedResult && activeMode === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Test with pre-configured authentic AKTU / ABESEC sessional question papers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samplePapers.map((paper, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0f2d59]">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span>{paper.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Pre-loaded ABESEC department question set with full rubrics and test marks.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        Preview Source
                      </a>
                      <button
                        type="button"
                        onClick={() => handleParsePreview(paper.fileName)}
                        className="bg-[#0f2d59] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1a3d75] transition-colors"
                      >
                        Load Paper
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action to trigger parse preview */}
          {!parsedResult && activeMode !== 'samples' && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleParsePreview()}
                disabled={isProcessing || (activeMode === 'upload' && !selectedFile) || (activeMode === 'paste' && !pastedText.trim())}
                className="flex items-center gap-2 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isProcessing ? 'Analyzing Document & Extracting Questions...' : 'Parse & Extract Questions'}</span>
              </button>
            </div>
          )}

          {/* PARSED PREVIEW DRAWER */}
          {parsedResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-sm">Successfully Parsed Question Paper!</strong>
                    <span>
                      Detected <strong>{parsedResult.count} Questions</strong> • Subject: <em>{parsedResult.subject}</em>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Paper Marks</span>
                  <div className="text-lg font-black font-mono text-emerald-900">
                    {totalCalculatedMarks} Marks
                  </div>
                </div>
              </div>

              {/* Questions List with inline mark verification */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {parsedResult.questions.map((q, idx) => (
                  <div 
                    key={q.id || idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded bg-[#0f2d59] text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          Q{q.questionNumber || (idx + 1)}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {q.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {q.description}
                          </div>
                        </div>
                      </div>

                      {/* Marks Input */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-300 px-2 py-1 rounded-lg">
                        <span className="text-slate-500 font-medium">Marks:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={q.maxMarks}
                          onChange={(e) => handleUpdateQuestionMarks(idx, e.target.value)}
                          className="w-12 text-center font-bold font-mono text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Extracted Rubric preview */}
                    {q.rubric && q.rubric.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5 border-t border-slate-200">
                        {q.rubric.map((r, rIdx) => (
                          <span key={rIdx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                            {r.criterion}: <strong>{r.maxMarks}m</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setParsedResult(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  ← Re-upload / Choose Different File
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToExam}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{isProcessing ? 'Setting as Active Paper...' : 'Confirm & Set as Active Exam Paper'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
