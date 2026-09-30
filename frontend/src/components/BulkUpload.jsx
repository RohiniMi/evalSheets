import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Trash2, 
  Play, 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck,
  FolderArchive
} from 'lucide-react';

export default function BulkUpload({ onUploadSuccess, onTriggerEvaluation, isEvaluating }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  const handleUploadAndEvaluate = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(20);
    setProcessingStep('Uploading scanned answer sheets to ABESEC Evaluation Server...');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('sheets', file);
    });

    try {
      const response = await fetch('/api/upload-bulk', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      setUploadProgress(60);
      setProcessingStep('Preprocessing handwritten images & running Optical Character Recognition...');

      if (data.success) {
        // Trigger automated evaluation on the newly uploaded batch
        setTimeout(async () => {
          setUploadProgress(85);
          setProcessingStep('Evaluating Abstract Syntax Trees against AKTU Rubrics...');

          await onTriggerEvaluation();

          setUploadProgress(100);
          setProcessingStep('Evaluation completed! Updating Gradebook...');

          setTimeout(() => {
            setIsUploading(false);
            setSelectedFiles([]);
            onUploadSuccess();
          }, 1200);
        }, 1000);
      } else {
        alert(data.error || 'Failed to upload answer sheets');
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while uploading sheets.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#0f2d59]" />
              <span>Bulk Handwritten Answer Sheet Ingestion</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Upload batches of student examination answer sheets (PNG, JPG, PDF scans). Neural OCR transcribes cursive handwritten code into compilable syntax and evaluates against active rubrics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>ABESEC Exam Cell Batch Importer</span>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
          dragOver 
            ? 'border-[#0f2d59] bg-blue-50/50 scale-[1.005]' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-[#0f2d59] flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Drag and drop student answer sheet scans here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports bulk image formats (PNG, JPG, JPEG) and scanned PDF pages.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tip: Naming files like <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">2100320100099_Vikas_CSE-A.jpg</code> automatically extracts student credentials!
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 bg-[#0f2d59] hover:bg-[#1a3d75] text-white px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs">
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>Browse Scanned Files</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Staging Queue List */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                Staged for Processing:
              </span>
              <span className="bg-[#0f2d59] text-white font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                {selectedFiles.length} files
              </span>
            </div>

            <button
              onClick={handleClearAll}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium"
            >
              Clear Queue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload and Evaluate CTA */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUploadAndEvaluate}
              disabled={isUploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 transition-all shadow-md ${
                isUploading
                  ? 'bg-amber-300 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 active:scale-98'
              }`}
            >
              <Cpu className="w-4 h-4 fill-current" />
              <span>{isUploading ? 'Executing Neural Pipeline...' : `Upload & Grade ${selectedFiles.length} Sheets`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Animation Modal / Bar */}
      {isUploading && (
        <div className="bg-white rounded-xl border border-amber-300 bg-amber-50/40 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold animate-spin">
                ⚙️
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Automated Evaluation in Progress</h4>
                <p className="text-xs text-slate-600">{processingStep}</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm text-amber-900">{uploadProgress}%</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Pipeline Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Optical Code Transcription</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Segments handwritten cursive characters, normalizes line slants, and generates syntactically sound code tokens with OCR confidence metrics.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Step-Wise Rubric Scoring</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Evaluates pointer tracking, loop invariants, algorithm partitions, and space/time complexities against customizable marks weightage.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Faculty Verification &amp; Override</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            View the original scanned sheet side-by-side with OCR transcription. Manually modify rubric marks, add teacher notes, and generate official university grade slips.
          </p>
        </div>
      </div>
    </div>
  );
}
