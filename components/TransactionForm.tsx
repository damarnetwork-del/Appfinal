
import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionMethod } from '../types';
import Card from './Card';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [method, setMethod] = useState<TransactionMethod>(TransactionMethod.TRANSFER);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim() || parseFloat(amount) <= 0) {
      setError('Deskripsi dan jumlah harus diisi dengan benar.');
      return;
    }

    addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      method,
    });

    setDescription('');
    setAmount('');
    setError('');
  };

  return (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Tambah Transaksi Baru</h2>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi</label>
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Gaji bulanan"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 5000000"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <fieldset>
                <legend className="text-sm font-medium text-slate-700">Jenis Transaksi</legend>
                <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            id="income"
                            name="transaction-type"
                            type="radio"
                            checked={type === TransactionType.INCOME}
                            onChange={() => setType(TransactionType.INCOME)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="income" className="ml-2 block text-sm text-slate-900">
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
                            className="h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500"
                        />
                        <label htmlFor="expense" className="ml-2 block text-sm text-slate-900">
                            Pengeluaran
                        </label>
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend className="text-sm font-medium text-slate-700">Metode Transaksi</legend>
                <div className="mt-2 flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            id="transfer"
                            name="transaction-method"
                            type="radio"
                            checked={method === TransactionMethod.TRANSFER}
                            onChange={() => setMethod(TransactionMethod.TRANSFER)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="transfer" className="ml-2 block text-sm text-slate-900">
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
                            className="h-4 w-4 text-green-600 border-slate-300 focus:ring-green-500"
                        />
                        <label htmlFor="cash" className="ml-2 block text-sm text-slate-900">
                            Tunai
                        </label>
                    </div>
                </div>
            </fieldset>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Tambah Transaksi
            </button>
          </form>
        </Card>
    </section>
  );
};

export default TransactionForm;
