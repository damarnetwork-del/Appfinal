
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Transaction, TransactionType, TransactionMethod, Customer, PaymentRecord } from './types';
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

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM3.05 4.536a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM16.95 15.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z" clipRule="evenodd" />
    </svg>
);


function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmingPaymentCustomer, setConfirmingPaymentCustomer] = useState<Customer | null>(null);
  
  const logoutTimer = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

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


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Transaction handlers
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    };
    setTransactions(prev => [...prev, newTransaction]);
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
                 <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    aria-label="Toggle theme"
                 >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 rounded-md px-3 py-1"
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

    </div>
  );
}

export default App;
