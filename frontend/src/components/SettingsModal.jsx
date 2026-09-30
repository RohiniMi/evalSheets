import React, { useState } from 'react';
import { 
  Building2, 
  BookOpen, 
  Award, 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

export default function SettingsModal({ config, onSaveConfig, onResetData }) {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(config || {})));
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (section, key, val) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: val
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#0f2d59]" />
          <span>ABESEC College &amp; Examination Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize institutional details, AKTU affiliation metadata, grading tolerance, and OCR model sensitivity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Institution Details */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#0f2d59] uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Institution Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">College Name</label>
              <input
                type="text"
                value={formData.institution?.name || ''}
                onChange={(e) => handleChange('institution', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Affiliation &amp; AKTU College Code</label>
              <input
                type="text"
                value={formData.institution?.collegeCode || ''}
                onChange={(e) => handleChange('institution', 'collegeCode', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campus Location</label>
              <input
                type="text"
                value={formData.institution?.location || ''}
                onChange={(e) => handleChange('institution', 'location', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Accreditation Details</label>
              <input
                type="text"
                value={formData.institution?.accreditation || ''}
                onChange={(e) => handleChange('institution', 'accreditation', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Exam & Department */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#0f2d59] uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Examination &amp; Evaluator Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                value={formData.examDetails?.department || ''}
                onChange={(e) => handleChange('examDetails', 'department', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Course &amp; Subject Code</label>
              <input
                type="text"
                value={formData.examDetails?.subject || ''}
                onChange={(e) => handleChange('examDetails', 'subject', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Evaluator / Faculty Name</label>
              <input
                type="text"
                value={formData.examDetails?.evaluator || ''}
                onChange={(e) => handleChange('examDetails', 'evaluator', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Passing Mark Threshold</label>
              <input
                type="number"
                value={formData.examDetails?.passingMarks || 12}
                onChange={(e) => handleChange('examDetails', 'passingMarks', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Neural OCR & Engine Tuning */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#0f2d59] uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>AI Transcription &amp; Grading Strictness</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                OCR Confidence Threshold ({Math.round((formData.evaluationSettings?.ocrConfidenceThreshold || 0.82) * 100)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={formData.evaluationSettings?.ocrConfidenceThreshold || 0.82}
                onChange={(e) => handleChange('evaluationSettings', 'ocrConfidenceThreshold', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg accent-[#0f2d59]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Sheets with OCR confidence below threshold will be flagged for "Needs Review".
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evaluationSettings?.allowSyntaxTolerance !== false}
                  onChange={(e) => handleChange('evaluationSettings', 'allowSyntaxTolerance', e.target.checked)}
                  className="rounded text-[#0f2d59] focus:ring-[#0f2d59]"
                />
                <span className="text-slate-800 font-medium">Tolerate minor handwritten punctuation smudges</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evaluationSettings?.stepMarkingEnabled !== false}
                  onChange={(e) => handleChange('evaluationSettings', 'stepMarkingEnabled', e.target.checked)}
                  className="rounded text-[#0f2d59] focus:ring-[#0f2d59]"
                />
                <span className="text-slate-800 font-medium">Enable granular step-wise partial credit</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-2 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Benchmark ABESEC Dataset</span>
          </button>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Configuration Saved!</span>
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
