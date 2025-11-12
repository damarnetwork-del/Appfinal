import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Transaction, TransactionType, TransactionMethod, Customer, PaymentRecord, TelegramSettings } from './types';
import useLocalStorage from './hooks/useLocalStorage';

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
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [telegramSettings, setTelegramSettings] = useLocalStorage<TelegramSettings>('telegramSettings', {
    enabled: false,
    botToken: '',
    chatId: '',
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmingPaymentCustomer, setConfirmingPaymentCustomer] = useState<Customer | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const logoutTimer = useRef<number | null>(null);

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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const sendTelegramNotification = async (newTransaction: Transaction, allTransactions: Transaction[]) => {
      const { enabled, botToken, chatId } = telegramSettings;
      if (!enabled || !botToken || !chatId) return;

      let totalIncome = 0;
      let totalExpense = 0;

      allTransactions.forEach(t => {
          if (t.type === TransactionType.INCOME) totalIncome += t.amount;
          else totalExpense += t.amount;
      });

      const balance = totalIncome - totalExpense;

      const message = [
          `*Transaksi Baru*`,
          `--------------------------------------`,
          `- *Jenis Transaksi:* ${newTransaction.type === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran'}`,
          `- *Deskripsi:* ${newTransaction.description}`,
          `- *Nominal:* ${formatCurrency(newTransaction.amount)}`,
          `--------------------------------------`,
          `*Ringkasan Keuangan Saat Ini:*`,
          `- *Total Pemasukan:* ${formatCurrency(totalIncome)}`,
          `- *Total Pengeluaran:* ${formatCurrency(totalExpense)}`,
          `- *Saldo Total:* ${formatCurrency(balance)}`
      ].join('\n');

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


  // Transaction handlers
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    sendTelegramNotification(newTransaction, updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    setEditingTransaction(null);
  };

  // Customer handlers
  const addCustomer = (customer: Omit<Customer, 'id' | 'paymentHistory'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      paymentHistory: [],
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
        setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setEditingCustomer(null);
  };

  const confirmPayment = (customerId: string, amount: number) => {
    const paymentRecord: PaymentRecord = {
      date: new Date().toISOString(),
      amount,
    };
    
    // Add payment to customer's history
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, paymentHistory: [...c.paymentHistory, paymentRecord] } : c));
    
    // Add transaction record
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        addTransaction({
            description: `Pembayaran dari ${customer.name}`,
            amount,
            type: TransactionType.INCOME,
            method: TransactionMethod.TRANSFER, // Assuming transfer, could be made selectable
            date: new Date().toISOString(),
        });
    }

    setConfirmingPaymentCustomer(null);
  };


  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
             <MonthlyReport transactions={transactions} />
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
        settings={telegramSettings}
        onSave={setTelegramSettings}
      />

    </div>
  );
}

export default App;
