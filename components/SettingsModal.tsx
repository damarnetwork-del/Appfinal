import React, { useState, useEffect } from 'react';
import { TelegramSettings, Transaction, Customer, CompanyProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramSettings: TelegramSettings;
  onSaveTelegram: (settings: TelegramSettings) => void;
  companyProfile: CompanyProfile;
  onSaveProfile: (profile: CompanyProfile) => void;
  transactions: Transaction[];
  customers: Customer[];
  setTransactions: (transactions: Transaction[]) => void;
  setCustomers: (customers: Customer[]) => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => {
    return (
        <label htmlFor="telegram-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
                <input id="telegram-toggle" type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-full bg-blue-500' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
                {label}
            </div>
        </label>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    telegramSettings, 
    onSaveTelegram,
    companyProfile,
    onSaveProfile,
    transactions, 
    customers, 
    setTransactions, 
    setCustomers 
}) => {
  const [localTelegramSettings, setLocalTelegramSettings] = useState<TelegramSettings>(telegramSettings);
  const [localProfile, setLocalProfile] = useState<CompanyProfile>(companyProfile);

  useEffect(() => {
    if (isOpen) {
        setLocalTelegramSettings(telegramSettings);
        setLocalProfile(companyProfile);
    }
  }, [telegramSettings, companyProfile, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSaveTelegram(localTelegramSettings);
    onSaveProfile(localProfile);
    onClose();
  };

  const handleTelegramInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocalTelegramSettings(prev => ({...prev, [name]: value}));
  }

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({...prev, [name]: value}));
  }

  const handleToggleChange = (enabled: boolean) => {
      setLocalTelegramSettings(prev => ({...prev, enabled }));
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLocalProfile(prev => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };


  const handleBackup = () => {
    const backupData = {
        transactions,
        customers,
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `damar_global_network_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result !== 'string') {
                throw new Error("File could not be read properly.");
            }
            const data = JSON.parse(result);
            if (data && Array.isArray(data.transactions) && Array.isArray(data.customers)) {
                if (window.confirm("Apakah Anda yakin ingin me-restore data? Semua data saat ini akan ditimpa.")) {
                    setTransactions(data.transactions);
                    setCustomers(data.customers);
                    alert("Data berhasil di-restore!");
                    onClose();
                }
            } else {
                alert("File backup tidak valid.");
            }
        } catch (error) {
            alert("Gagal membaca atau parsing file backup. Pastikan file dalam format JSON yang benar.");
            console.error("Restore error:", error);
        } finally {
            event.target.value = '';
        }
    };
    reader.onerror = () => {
        alert("Gagal membaca file.");
    }
    reader.readAsText(file);
  };
  
  const FormInput: React.FC<{label: string; id: keyof CompanyProfile; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; }> = 
  ({label, id, value, onChange, placeholder}) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type="text" id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 sm:text-sm" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <div className="space-y-8">
            {/* Company Profile Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Profil Perusahaan</h2>
                <div className="space-y-4">
                    <FormInput label="Nama Perusahaan" id="name" value={localProfile.name} onChange={handleProfileInputChange} />
                    <FormInput label="Alamat" id="address" value={localProfile.address} onChange={handleProfileInputChange} />
                    <FormInput label="Nama Kontak (Penanggung Jawab)" id="contactPerson" value={localProfile.contactPerson} onChange={handleProfileInputChange} />
                    <FormInput label="Email" id="email" value={localProfile.email} onChange={handleProfileInputChange} placeholder="contoh@email.com" />
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Logo Perusahaan</label>
                         <div className="flex items-center space-x-4">
                            {localProfile.logo ? (
                                <img src={localProfile.logo} alt="Logo Preview" className="h-16 w-16 rounded-md object-contain bg-gray-100 p-1 border" />
                            ) : (
                                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400 border">No Logo</div>
                            )}
                            <label className="cursor-pointer inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                Unggah Logo
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                         </div>
                    </div>
                </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* Telegram Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pengaturan Notifikasi Telegram</h2>
                <div className="space-y-4">
                    <ToggleSwitch 
                        label="Aktifkan Notifikasi"
                        enabled={localTelegramSettings.enabled}
                        onChange={handleToggleChange}
                    />
                    {localTelegramSettings.enabled && (
                        <>
                            <div>
                                <label htmlFor="botToken" className="block text-sm font-medium text-gray-700 mb-1">Telegram Bot Token</label>
                                <input type="text" id="botToken" name="botToken" value={localTelegramSettings.botToken} onChange={handleTelegramInputChange} placeholder="Contoh: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="chatId" className="block text-sm font-medium text-gray-700 mb-1">Telegram Chat ID</label>
                                <input type="text" id="chatId" name="chatId" value={localTelegramSettings.chatId} onChange={handleTelegramInputChange} placeholder="Contoh: -1001234567890 atau 123456789" className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 sm:text-sm" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <hr className="border-gray-200" />
            
            {/* Data Management Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Manajemen Data</h2>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-600 mb-2 sm:mb-0">Simpan semua data Anda ke sebuah file.</p>
                        <button onClick={handleBackup} className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                           Backup Data
                        </button>
                    </div>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-600 mb-2 sm:mb-0">Pulihkan data dari file backup.</p>
                         <label className="w-full sm:w-auto cursor-pointer inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                            Restore Data
                            <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6 sticky bottom-0 bg-white py-4 -mx-6 px-6">
              <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                  Tutup
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
