
import React, { useState } from 'react';
// FIX: Added file extension to import statement
import { Transaction, TransactionType, TransactionMethod } from '../types.ts';
import Card from './Card';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [method, setMethod] = useState<TransactionMethod>(TransactionMethod.TRANSFER);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim() || parseFloat(amount) <= 0 || !date) {
      setError('Deskripsi, jumlah, dan tanggal harus diisi dengan benar.');
      return;
    }

    addTransaction({
      description,
      amount: parseFloat(amount),
      date: new Date(date + 'T00:00:00').toISOString(), // Ensure date is local
      type,
      method,
    });

    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  return (
    <section>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Tambah Transaksi</h2>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Gaji bulanan"
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah (Rp)</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 5000000"
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <fieldset>
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Transaksi</legend>
                <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            id="income"
                            name="transaction-type"
                            type="radio"
                            checked={type === TransactionType.INCOME}
                            onChange={() => setType(TransactionType.INCOME)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
                        />
                        <label htmlFor="income" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Pemasukan
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="expense"
                            name="transaction-type"
                            type="radio"
                            checked={type === TransactionType.EXPENSE}
                            onChange={() => setType(TransactionType.EXPENSE)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
                        />
                        <label htmlFor="expense" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Pengeluaran
                        </label>
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Metode Transaksi</legend>
                <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            id="transfer"
                            name="transaction-method"
                            type="radio"
                            checked={method === TransactionMethod.TRANSFER}
                            onChange={() => setMethod(TransactionMethod.TRANSFER)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
                        />
                        <label htmlFor="transfer" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Transfer
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="cash"
                            name="transaction-method"
                            type="radio"
                            checked={method === TransactionMethod.CASH}
                            onChange={() => setMethod(TransactionMethod.CASH)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
                        />
                        <label htmlFor="cash" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Tunai
                        </label>
                    </div>
                </div>
            </fieldset>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Tambah Transaksi
            </button>
          </form>
        </Card>
    </section>
  );
};

export default TransactionForm;