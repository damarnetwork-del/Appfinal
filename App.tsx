import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Transaction, TransactionType, TransactionMethod, Customer, PaymentRecord, TelegramSettings, CompanyProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { getAppData, saveAppData } from './services/storage';

import LoginPage from './components/LoginPage';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyReport from './components/MonthlyReport';
import CustomerSection from './components/CustomerSection';
import EditTransactionModal from './components/EditTransactionModal';
import EditCustomerModal from './components/EditCustomerModal';
import PaymentConfirmationModal from './components/PaymentConfirmationModal';
import SettingsModal from './components/SettingsModal';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);

  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    enabled: false,
    botToken: '',
    chatId: '',
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'Damar Global Network',
    address: 'Jl. Kemajuan No. 123, Jakarta Pusat, Indonesia',
    contactPerson: 'Mardi Jayadi',
    email: 'kontak@damarglobal.net',
    logo: '',
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmingPaymentCustomer, setConfirmingPaymentCustomer] = useState<Customer | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const logoutTimer = useRef<number | null>(null);
  const isInitialDataLoaded = useRef(false);

  // Effect to load data from storage when the app is opened and user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      isInitialDataLoaded.current = false;
      getAppData().then(data => {
        setTransactions(data.transactions || []);
        setCustomers(data.customers || []);
        setTelegramSettings(data.telegramSettings || { enabled: false, botToken: '', chatId: '' });
        setCompanyProfile(data.companyProfile || { name: 'Damar Global Network', address: '', contactPerson: '', email: '', logo: ''});
        setIsLoading(false);
        isInitialDataLoaded.current = true; // Mark initial data as loaded
      });
    } else {
        isInitialDataLoaded.current = false; // Reset on logout
    }
  }, [isLoggedIn]);

  // Effect to save all data to storage on any change
  useEffect(() => {
    // Don't save if data hasn't been loaded yet or user is logged out
    if (!isInitialDataLoaded.current || !isLoggedIn) {
      return; 
    }

    const appData = {
      transactions,
      customers,
      telegramSettings,
      companyProfile,
    };
    saveAppData(appData);
  }, [transactions, customers, telegramSettings, companyProfile, isLoggedIn]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const sendTelegramNotification = async (notificationType: string, details: string, allTransactions: Transaction[]) => {
      const { enabled, botToken, chatId } = telegramSettings;
      if (!enabled || !botToken || !chatId) return;

      let totalIncome = 0;
      let totalExpense = 0;

      allTransactions.forEach(t => {
          if (t.type === TransactionType.INCOME) totalIncome += t.amount;
          else totalExpense += t.amount;
      });

      const balance = totalIncome - totalExpense;
      const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      const message = [
          `*🔔 Notifikasi Aplikasi*`,
          `--------------------------------------`,
          `*Jenis Notifikasi:* ${notificationType}`,
          `*User Login:* admin`,
          `*Waktu:* ${timestamp}`,
          details ? `\n${details}\n` : '',
          `--------------------------------------`,
          `*Ringkasan Keuangan:*`,
          `- *Pemasukan:* ${formatCurrency(totalIncome)}`,
          `- *Pengeluaran:* ${formatCurrency(totalExpense)}`,
          `- *Saldo:* ${formatCurrency(balance)}`
      ].join('\n').replace(/\n\n/g, '\n');

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      try {
          await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  chat_id: chatId,
                  text: message,
                  parse_mode: 'Markdown',
              }),
          });
      } catch (error) {
          console.error("Failed to send Telegram notification:", error);
      }
  };

  const handleLogout = () => {
    if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
    }
    setIsLoggedIn(false);
  };

  // Auto-logout logic
  useEffect(() => {
    const resetTimer = () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
      logoutTimer.current = window.setTimeout(() => {
        handleLogout();
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    };

    if (isLoggedIn) {
      const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
      
      const eventHandler = () => resetTimer();

      events.forEach(event => {
        window.addEventListener(event, eventHandler, true);
      });

      resetTimer(); // Start the timer on login/page load

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, eventHandler, true);
        });
        if (logoutTimer.current) {
          clearTimeout(logoutTimer.current);
        }
      };
    }
  }, [isLoggedIn]);

  // Monthly billing logic
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkAndBill = () => {
        setCustomers(currentCustomers => {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth(); // 0-11
            const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

            const updatedCustomers = currentCustomers.map(customer => {
                if (!customer.lastBilledMonth) {
                    return {
                        ...customer,
                        dueAmount: customer.dueAmount ?? customer.amount,
                        lastBilledMonth: currentMonthStr,
                    };
                }

                const [lastBilledYear, lastBilledMonthNum] = customer.lastBilledMonth.split('-').map(Number);
                const lastBilledDate = new Date(lastBilledYear, lastBilledMonthNum - 1);

                const monthsToBill = (currentYear - lastBilledDate.getFullYear()) * 12 + (currentMonth - lastBilledDate.getMonth());
                
                if (monthsToBill > 0) {
                    const newDueAmount = (customer.dueAmount || 0) + (customer.amount * monthsToBill);
                    return { ...customer, dueAmount: newDueAmount, lastBilledMonth: currentMonthStr };
                }
                return customer;
            });
            
            if (JSON.stringify(updatedCustomers) !== JSON.stringify(currentCustomers)) {
                return updatedCustomers;
            }
            return currentCustomers;
        });
    };
    
    checkAndBill(); // Initial check on login
    const intervalId = setInterval(checkAndBill, 10 * 60 * 1000); // Periodic check every 10 minutes

    return () => clearInterval(intervalId); // Cleanup interval on logout/unmount

  }, [isLoggedIn]);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Notification will be sent after data is loaded via useEffect
  };

  // Transaction handlers
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    sendTelegramNotification(
        `Transaksi Baru (${newTransaction.type === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran'})`,
        `*Deskripsi:* ${newTransaction.description}\n*Jumlah:* ${formatCurrency(newTransaction.amount)}`,
        updatedTransactions
    );
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        const transactionToDelete = transactions.find(t => t.id === id);
        if (transactionToDelete) {
            const updatedTransactions = transactions.filter(t => t.id !== id);
            setTransactions(updatedTransactions);
            sendTelegramNotification(
                "Transaksi Dihapus",
                `*Deskripsi:* ${transactionToDelete.description}\n*Jumlah:* ${formatCurrency(transactionToDelete.amount)}`,
                updatedTransactions
            );
        }
    }
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    setTransactions(updatedTransactions);
    sendTelegramNotification(
        "Transaksi Diperbarui",
        `*Deskripsi:* ${updatedTransaction.description}\n*Jumlah:* ${formatCurrency(updatedTransaction.amount)}`,
        updatedTransactions
    );
    setEditingTransaction(null);
  };

  // Customer handlers
  const addCustomer = (customer: Omit<Customer, 'id' | 'paymentHistory' | 'dueAmount' | 'lastBilledMonth'>) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      paymentHistory: [],
      dueAmount: customer.amount, // First bill
      lastBilledMonth: `${currentYear}-${currentMonth}`,
    };
    setCustomers(prev => [...prev, newCustomer]);
    sendTelegramNotification(
        "Pelanggan Baru Ditambahkan",
        `*Nama:* ${newCustomer.name}\n*Jenis Langganan:* ${newCustomer.subscriptionType}\n*Tagihan Bulanan:* ${formatCurrency(newCustomer.amount)}`,
        transactions
    );
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
        const customerToDelete = customers.find(c => c.id === id);
        if (customerToDelete) {
            setCustomers(prev => prev.filter(c => c.id !== id));
            sendTelegramNotification(
                "Pelanggan Dihapus",
                `*Nama:* ${customerToDelete.name}`,
                transactions
            );
        }
    }
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    sendTelegramNotification(
        "Data Pelanggan Diperbarui",
        `*Nama:* ${updatedCustomer.name}`,
        transactions
    );
    setEditingCustomer(null);
  };

  const confirmPayment = (customerId: string, paymentAmount: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        setConfirmingPaymentCustomer(null);
        return;
    }

    const paymentRecord: PaymentRecord = {
      date: new Date().toISOString(),
      amount: paymentAmount,
    };
    
    const newTransaction: Transaction = {
        id: uuidv4(),
        description: `Pembayaran tagihan dari ${customer.name}`,
        amount: paymentAmount,
        type: TransactionType.INCOME,
        method: TransactionMethod.TRANSFER, // Assuming transfer
        date: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    
    setCustomers(prev => prev.map(c => 
        c.id === customerId 
        ? { 
            ...c, 
            paymentHistory: [...c.paymentHistory, paymentRecord],
            dueAmount: c.dueAmount - paymentAmount
          } 
        : c
    ));
    
    sendTelegramNotification(
        "Pembayaran Tagihan Diterima",
        `*Pelanggan:* ${customer.name}\n*Jumlah Dibayar:* ${formatCurrency(paymentAmount)}`,
        updatedTransactions
    );

    setConfirmingPaymentCustomer(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-600">Memuat data Anda...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
                 <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
                    aria-label="Pengaturan Aplikasi"
                 >
                    <SettingsIcon />
                </button>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 rounded-md px-3 py-1"
                >
                    Logout
                </button>
            </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Summary transactions={transactions} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1 space-y-6">
             <TransactionForm addTransaction={addTransaction} />
             <MonthlyReport transactions={transactions} companyProfile={companyProfile} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList 
                transactions={transactions} 
                deleteTransaction={deleteTransaction} 
                onEdit={(t) => setEditingTransaction(t)}
            />
          </div>
        </div>
        <CustomerSection
            customers={customers}
            addCustomer={addCustomer}
            deleteCustomer={deleteCustomer}
            onEdit={(c) => setEditingCustomer(c)}
            onConfirmPayment={(c) => setConfirmingPaymentCustomer(c)}
            companyProfile={companyProfile}
        />
      </main>
      
      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          updateTransaction={updateTransaction}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          isOpen={!!editingCustomer}
          onClose={() => setEditingCustomer(null)}
          customer={editingCustomer}
          updateCustomer={updateCustomer}
        />
      )}

      {confirmingPaymentCustomer && (
        <PaymentConfirmationModal
          isOpen={!!confirmingPaymentCustomer}
          onClose={() => setConfirmingPaymentCustomer(null)}
          customer={confirmingPaymentCustomer}
          onConfirm={confirmPayment}
        />
      )}
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        telegramSettings={telegramSettings}
        onSaveTelegram={setTelegramSettings}
        companyProfile={companyProfile}
        onSaveProfile={setCompanyProfile}
        transactions={transactions}
        customers={customers}
        setTransactions={setTransactions}
        setCustomers={setCustomers}
      />

    </div>
  );
}

export default App;