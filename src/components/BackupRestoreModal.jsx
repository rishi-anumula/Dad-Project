import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Database, Download, Upload, AlertCircle, CheckCircle, KeyRound, Fingerprint, User, LogOut } from 'lucide-react';

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

          {/* Security & Store PIN Settings Section */}
          <SecuritySettingsSection />

        </div>

      </div>
    </div>
  );
}

function SecuritySettingsSection() {
  const { 
    user,
    logout,
    shopProfile, 
    requireBiometricOnResume,
    toggleRequireBiometricOnResume,
    setupBackupPin
  } = useAuth();
  const { t } = useLanguage();
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState(null);

  const handlePinUpdate = async (e) => {
    e.preventDefault();
    setPinFeedback(null);
    const res = await setupBackupPin(newPin);
    if (res.success) {
      setPinFeedback({ type: 'success', text: t('auth.pinChangedSuccess') || 'Security PIN updated successfully!' });
      setCurrentPin('');
      setNewPin('');
      setTimeout(() => {
        setIsChangingPin(false);
        setPinFeedback(null);
      }, 1500);
    } else {
      setPinFeedback({ type: 'error', text: res.error || 'Failed to update PIN.' });
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
        <KeyRound className="w-4 h-4 text-amber-500" />
        <span>{t('auth.storeSecuritySettings') || 'Store Security & PIN Protection'}</span>
      </h4>

      {/* Connected Google Account */}
      {user && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || 'Google Account'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/30 transition-all flex items-center space-x-1 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Require Biometric / PIN on App Resume Toggle */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('auth.biometricSettingsTitle') || 'Biometric / Fingerprint Unlock'}</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t('auth.biometricSettingsDesc') || 'Lock with fingerprint or PIN whenever app resumes from background'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={requireBiometricOnResume}
            onChange={(e) => toggleRequireBiometricOnResume(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Change PIN toggle button */}
      {!isChangingPin ? (
        <button
          type="button"
          onClick={() => setIsChangingPin(true)}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('auth.changePin') || 'Change Master PIN'}</span>
        </button>
      ) : (
        <form onSubmit={handlePinUpdate} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('auth.changeCounterPin') || 'Change Counter PIN'}</span>
            <button
              type="button"
              onClick={() => setIsChangingPin(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              {t('auth.cancel') || 'Cancel'}
            </button>
          </div>

          {pinFeedback && (
            <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 ${
              pinFeedback.type === 'success' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {pinFeedback.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{pinFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{t('auth.currentPinLabel') || 'Current PIN'}</label>
              <input
                type="password"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold text-center bg-white dark:bg-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">{t('auth.newPinLabel') || 'New 4-Digit PIN'}</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold text-center bg-white dark:bg-slate-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            {t('auth.updatePin') || 'Update PIN'}
          </button>
        </form>
      )}
    </div>
  );
}
