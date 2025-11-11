import React, { useMemo } from 'react';
import { Transaction, TransactionType, TransactionMethod } from '../types';
import Card from './Card';

interface SummaryProps {
  transactions: Transaction[];
}

const Summary: React.FC<SummaryProps> = ({ transactions }) => {
  const { 
    totalIncome, 
    totalExpense, 
    balance,
    incomeByTransfer,
    incomeByCash,
    expenseByTransfer,
    expenseByCash 
  } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incTransfer = 0;
    let incCash = 0;
    let expTransfer = 0;
    let expCash = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
        if (t.method === TransactionMethod.TRANSFER) {
          incTransfer += t.amount;
        } else {
          incCash += t.amount;
        }
      } else {
        expense += t.amount;
        if (t.method === TransactionMethod.TRANSFER) {
          expTransfer += t.amount;
        } else {
          expCash += t.amount;
        }
      }
    });

    return { 
      totalIncome: income, 
      totalExpense: expense, 
      balance: income - expense,
      incomeByTransfer: incTransfer,
      incomeByCash: incCash,
      expenseByTransfer: expTransfer,
      expenseByCash: expCash
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Ringkasan Keuangan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-green-700 uppercase">Pemasukan</h3>
          <p className="text-2xl font-semibold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-green-200 space-y-1">
            <div className="flex justify-between"><span>Transfer:</span> <span>{formatCurrency(incomeByTransfer)}</span></div>
            <div className="flex justify-between"><span>Tunai:</span> <span>{formatCurrency(incomeByCash)}</span></div>
          </div>
        </Card>
        <Card className="bg-red-50 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-red-700 uppercase">Pengeluaran</h3>
          <p className="text-2xl font-semibold text-red-600 mt-1">{formatCurrency(totalExpense)}</p>
          <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-red-200 space-y-1">
            <div className="flex justify-between"><span>Transfer:</span> <span>{formatCurrency(expenseByTransfer)}</span></div>
            <div className="flex justify-between"><span>Tunai:</span> <span>{formatCurrency(expenseByCash)}</span></div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-blue-700 uppercase">Saldo Saat Ini</h3>
          <p className={`text-2xl font-semibold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </Card>
      </div>
    </section>
  );
};

export default Summary;