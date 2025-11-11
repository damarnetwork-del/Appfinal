import React, { useState, useMemo } from 'react';
// FIX: Added file extension to import statement
import { Transaction, TransactionType } from '../types.ts';
import Card from './Card';

interface TransactionListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, deleteTransaction, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm]);

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan deskripsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label="Cari transaksi"
        />
      </div>
      <Card>
        <div className="overflow-x-auto">
          {filteredAndSortedTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deskripsi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metode</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit/Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAndSortedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{t.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.EXPENSE && '- '}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{t.method === 'CASH' ? 'Tunai' : 'Transfer'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => onEdit(t)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-slate-500 py-8">
              {searchTerm ? 'Tidak ada transaksi yang cocok dengan pencarian.' : 'Belum ada transaksi.'}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
};

export default TransactionList;