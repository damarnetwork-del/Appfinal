import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Transaction, TransactionType, TransactionMethod, Customer, PaymentRecord, SubscriptionType } from './types';
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

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmingPaymentCustomer, setConfirmingPaymentCustomer] = useState<Customer | null>(null);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Transaction handlers
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: new Date().toISOString(),
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

  const confirmPayment = (customerId: string, amount: number, method: TransactionMethod) => {
    const paymentRecord: PaymentRecord = {
      date: new Date().toISOString(),
      amount,
      method,
    };
    
    // Add payment to customer's history
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, paymentHistory: [...c.paymentHistory, paymentRecord] } : c));
    
    // Add transaction record
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        addTransaction({
            description: `Pembayaran Langganan - ${customer.name}`,
            amount,
            type: TransactionType.INCOME,
            method: method,
        });
    }

    setConfirmingPaymentCustomer(null);
  };


  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Damar Global Network</h1>
            <button
                onClick={handleLogout}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Logout
            </button>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Summary transactions={transactions} />
        <div className="space-y-8">
          <TransactionForm addTransaction={addTransaction} />
          <MonthlyReport transactions={transactions} />
          <CustomerSection
              customers={customers}
              transactions={transactions}
              addCustomer={addCustomer}
              deleteCustomer={deleteCustomer}
              onEdit={(c) => setEditingCustomer(c)}
              onConfirmPayment={(c) => setConfirmingPaymentCustomer(c)}
          />
          <TransactionList 
              transactions={transactions} 
              deleteTransaction={deleteTransaction} 
              onEdit={(t) => setEditingTransaction(t)}
          />
        </div>
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