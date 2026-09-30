import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import QuestionManager from './components/QuestionManager';
import BulkUpload from './components/BulkUpload';
import StudentDetailModal from './components/StudentDetailModal';
import SettingsModal from './components/SettingsModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [configRes, questionsRes, studentsRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/questions'),
        fetch('/api/students')
      ]);

      const configData = await configRes.json();
      const questionsData = await questionsRes.json();
      const studentsData = await studentsRes.json();

      setConfig(configData);
      setQuestions(questionsData);
      setStudents(studentsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Could not connect to evaluation server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger evaluation
  const handleTriggerEvaluation = async (studentIds = []) => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        showToast(`Evaluation completed for ${data.evaluatedCount} student answer sheets!`);
      } else {
        showToast('Evaluation failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast('Network error during evaluation run', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Add Question
  const handleAddQuestion = async (newQ) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.allQuestions);
        showToast('New question with rubrics added successfully!');
      }
    } catch (err) {
      showToast('Failed to add question', 'error');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        showToast('Question removed from paper');
      }
    } catch (err) {
      showToast('Failed to delete question', 'error');
    }
  };

  // Import Questions JSON
  const handleImportQuestions = async (importedList) => {
    try {
      const res = await fetch('/api/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: importedList })
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        showToast(`Imported ${data.count} questions from JSON!`);
      }
    } catch (err) {
      showToast('Import failed', 'error');
    }
  };

  // Save Manual Grade Override
  const handleSaveOverride = async (studentId, payload) => {
    try {
      const res = await fetch(`/api/students/${studentId}/override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.map(s => s.id === studentId ? data.student : s));
        setSelectedStudent(data.student);
        showToast(`Grades & teacher verification saved for ${data.student.studentName}`);
      }
    } catch (err) {
      showToast('Failed to update student grades', 'error');
    }
  };

  // Save Settings Config
  const handleSaveConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        showToast('Institutional configuration updated!');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Reset Data to default benchmark
  const handleResetData = async () => {
    if (confirm('Reset all evaluations to the benchmark ABESEC student submissions?')) {
      await fetchData();
      showToast('Benchmark dataset reloaded');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0f2d59] text-amber-400 font-bold text-2xl flex items-center justify-center mx-auto animate-bounce shadow-md">
            A
          </div>
          <h2 className="font-bold text-[#0f2d59] text-base">ABES Engineering College</h2>
          <p className="text-xs text-slate-500">Loading AutoGrade-ABESEC Handwritten Code Evaluator...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalEvaluated: students.filter(s => s.status.includes('Evaluated')).length,
    totalQuestions: questions.length
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-xl">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-white ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            students={students}
            questions={questions}
            onSelectStudent={(student) => setSelectedStudent(student)}
            onTriggerEvaluation={handleTriggerEvaluation}
            isEvaluating={isEvaluating}
            config={config}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionManager
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onImportQuestions={handleImportQuestions}
            onRefreshData={fetchData}
          />
        )}

        {activeTab === 'upload' && (
          <BulkUpload
            onUploadSuccess={() => {
              fetchData();
              setActiveTab('dashboard');
              showToast('Bulk answer sheets uploaded and evaluated successfully!');
            }}
            onTriggerEvaluation={handleTriggerEvaluation}
            isEvaluating={isEvaluating}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            config={config}
            onSaveConfig={handleSaveConfig}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Detailed Student Split-screen Evaluation Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          questions={questions}
          onClose={() => setSelectedStudent(null)}
          onSaveOverride={handleSaveOverride}
          config={config}
        />
      )}

      {/* Footer with ABESEC affiliation branding */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0f2d59]">{config?.institution?.name || 'ABES Engineering College'}</span>
            <span>•</span>
            <span>AKTU Code: {config?.institution?.collegeCode || '032'}</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{config?.institution?.accreditation || 'NAAC A Grade'}</span>
          </div>

          <div className="text-[11px] text-slate-400">
            AutoGrade-ABESEC Neural Handwritten Verification Platform • Powered by JSON Datasets &amp; AST Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
