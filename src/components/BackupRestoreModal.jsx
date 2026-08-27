import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { X, Database, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export function BackupRestoreModal({ isOpen, onClose }) {
  const { exportBackup, importBackup } = useLedger();
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setJsonText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRestore = () => {
    if (!jsonText.trim()) {
      setMessage({ type: 'error', text: 'Please paste JSON data or select a backup file.' });
      return;
    }
    const success = importBackup(jsonText);
    if (success) {
      setMessage({ type: 'success', text: 'Backup restored successfully!' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1200);
    } else {
      setMessage({ type: 'error', text: 'Invalid JSON backup format.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Data Backup & Restore
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Export Section */}
          <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/40">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Export Local Data Backup</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Download your complete customer ledgers and transaction history as a standard JSON backup file.
            </p>
            <button
              onClick={exportBackup}
              className="mt-3 w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Restore Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Restore from Backup File</span>
            </h4>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Upload Backup File (.json):
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
              />
            </div>

            <textarea
              placeholder="Or paste JSON backup content here..."
              rows={3}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <button
              onClick={handleRestore}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 transition-all shadow-sm"
            >
              Restore Database
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
