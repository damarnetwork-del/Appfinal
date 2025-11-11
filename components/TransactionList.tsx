
import React from 'react';
import { Transaction, TransactionType, TransactionMethod } from '../types';
import Card from './Card';

interface TransactionListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
}

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const TransactionList: React.FC<TransactionListProps> = ({ transactions, deleteTransaction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getMethodLabel = (method: TransactionMethod) => {
    return method === TransactionMethod.CASH ? 'Tunai' : 'Transfer';
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h2>
      <Card>
        {sortedTransactions.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Belum ada transaksi.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {sortedTransactions.map((t) => (
              <li key={t.id} className="py-4 flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-slate-900">{t.description}</p>
                     <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                       {getMethodLabel(t.method)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(t.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                    <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-slate-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full p-1 transition-colors"
                        aria-label={`Hapus transaksi ${t.description}`}
                    >
                        <DeleteIcon />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
};

export default TransactionList;
