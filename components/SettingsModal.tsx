import React, { useState, useEffect } from 'react';
import { TelegramSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TelegramSettings;
  onSave: (settings: TelegramSettings) => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => {
    return (
        <label htmlFor="telegram-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
                <input id="telegram-toggle" type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="block bg-gray-200 dark:bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-full bg-blue-500' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                {label}
            </div>
        </label>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<TelegramSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalSettings(prev => ({...prev, [name]: value}));
  }

  const handleToggleChange = (enabled: boolean) => {
      setLocalSettings(prev => ({...prev, enabled }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Pengaturan Notifikasi Telegram</h2>
        <div className="space-y-6">
            <ToggleSwitch 
                label="Aktifkan Notifikasi"
                enabled={localSettings.enabled}
                onChange={handleToggleChange}
            />
            {localSettings.enabled && (
                <>
                    <div>
                        <label htmlFor="botToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telegram Bot Token
                        </label>
                        <input
                            type="text"
                            id="botToken"
                            name="botToken"
                            value={localSettings.botToken}
                            onChange={handleInputChange}
                            placeholder="Contoh: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                            className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="chatId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telegram Chat ID
                        </label>
                        <input
                            type="text"
                            id="chatId"
                            name="chatId"
                            value={localSettings.chatId}
                            onChange={handleInputChange}
                            placeholder="Contoh: -1001234567890 atau 123456789"
                            className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white sm:text-sm"
                        />
                    </div>
                </>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-500 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                  Batal
              </button>
              <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                  Simpan Pengaturan
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
