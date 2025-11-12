import React, { useState, useEffect } from 'react';
// FIX: Added file extension to import statement
import { Transaction, TransactionType, TransactionMethod } from '../types.ts';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  updateTransaction: (transaction: Transaction) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, updateTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [method, setMethod] = useState<TransactionMethod>(TransactionMethod.TRANSFER);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(transaction.date.split('T')[0]); // Set date in YYYY-MM-DD format
      setType(transaction.type);
      setMethod(transaction.method);
      setError('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim() || parseFloat(amount) <= 0 || !date) {
      setError('Deskripsi, jumlah, dan tanggal harus diisi dengan benar.');
      return;
    }

    updateTransaction({
      ...transaction,
      description,
      amount: parseFloat(amount),
      date: new Date(date + 'T00:00:00').toISOString(), // Ensure date is local
      type,
      method,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Transaksi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input
                  type="text"
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
           <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                    type="date"
                    id="edit-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
          <div>
              <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input
                  type="number"
                  id="edit-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <fieldset>
              <legend className="text-sm font-medium text-gray-700">Jenis Transaksi</legend>
              <div className="mt-2 flex items-center space-x-6">
                  <div className="flex items-center">
                      <input
                          id="edit-income"
                          name="edit-transaction-type"
                          type="radio"
                          checked={type === TransactionType.INCOME}
                          onChange={() => setType(TransactionType.INCOME)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="edit-income" className="ml-2 block text-sm text-gray-900">
                          Pemasukan
                      </label>
                  </div>
                  <div className="flex items-center">
                      <input
                          id="edit-expense"
                          name="edit-transaction-type"
                          type="radio"
                          checked={type === TransactionType.EXPENSE}
                          onChange={() => setType(TransactionType.EXPENSE)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="edit-expense" className="ml-2 block text-sm text-gray-900">
                          Pengeluaran
                      </label>
                  </div>
              </div>
          </fieldset>
          <fieldset>
              <legend className="text-sm font-medium text-gray-700">Metode Transaksi</legend>
              <div className="mt-2 flex items-center space-x-6">
                  <div className="flex items-center">
                      <input
                          id="edit-transfer"
                          name="edit-transaction-method"
                          type="radio"
                          checked={method === TransactionMethod.TRANSFER}
                          onChange={() => setMethod(TransactionMethod.TRANSFER)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="edit-transfer" className="ml-2 block text-sm text-gray-900">
                          Transfer
                      </label>
                  </div>
                  <div className="flex items-center">
                      <input
                          id="edit-cash"
                          name="edit-transaction-method"
                          type="radio"
                          checked={method === TransactionMethod.CASH}
                          onChange={() => setMethod(TransactionMethod.CASH)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="edit-cash" className="ml-2 block text-sm text-gray-900">
                          Tunai
                      </label>
                  </div>
              </div>
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Batal
            </button>
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;