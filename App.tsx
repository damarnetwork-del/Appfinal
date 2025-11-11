import React from 'react';
import { Transaction } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyReport from './components/MonthlyReport';
import LoginPage from './components/LoginPage'; // Import the new LoginPage

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('isLoggedIn', false);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Damar Global Network</h1>
            <p className="text-slate-500 mt-1">Catat pemasukan dan pengeluaran Anda dengan mudah.</p>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Summary transactions={transactions} />
          <div className="mt-8 space-y-8">
             <TransactionForm addTransaction={addTransaction} />
             <MonthlyReport transactions={transactions} />
             <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} />
          </div>
        </div>
      </main>
      
      <footer className="text-center py-4 mt-8">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Damar Global Network. Dibuat dengan ❤️.</p>
      </footer>
    </div>
  );
};

export default App;
