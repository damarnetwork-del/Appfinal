import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyReport from './components/MonthlyReport';
import LoginPage from './components/LoginPage';
import EditTransactionModal from './components/EditTransactionModal';
import { Transaction } from './types';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  }

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t)));
    setEditingTransaction(null); // Close modal after update
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">Damar Global Network</h1>
            <button 
                onClick={handleLogout}
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Logout
            </button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <Summary transactions={transactions} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1 space-y-8">
            <TransactionForm addTransaction={addTransaction} />
            <MonthlyReport transactions={transactions} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList 
              transactions={transactions} 
              deleteTransaction={deleteTransaction} 
              onEdit={handleEdit}
            />
          </div>
        </div>
      </main>
      
      <EditTransactionModal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        updateTransaction={updateTransaction}
      />
    </div>
  );
}

export default App;
