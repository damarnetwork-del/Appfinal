
import React, { useMemo } from 'react';
// FIX: Added file extension to import statement
import { Transaction, TransactionType, TransactionMethod } from '../types.ts';
import Card from './Card';

const SummaryIcon = ({ type }: { type: 'income' | 'expense' | 'balance' }) => {
  const iconMap = {
    income: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
    expense: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
      </svg>
    ),
    balance: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  };
  return <div className={`p-2 rounded-lg bg-${type === 'income' ? 'green' : type === 'expense' ? 'red' : 'blue'}-100`}>{iconMap[type]}</div>;
}


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
    <section>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Keuangan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pemasukan</h3>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{formatCurrency(totalIncome)}</p>
                </div>
                <SummaryIcon type="income" />
            </div>
          <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-100 space-y-1">
            <div className="flex justify-between"><span>Transfer:</span> <span>{formatCurrency(incomeByTransfer)}</span></div>
            <div className="flex justify-between"><span>Tunai:</span> <span>{formatCurrency(incomeByCash)}</span></div>
          </div>
        </Card>
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pengeluaran</h3>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{formatCurrency(totalExpense)}</p>
                </div>
                <SummaryIcon type="expense" />
            </div>
            <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-100 space-y-1">
                <div className="flex justify-between"><span>Transfer:</span> <span>{formatCurrency(expenseByTransfer)}</span></div>
                <div className="flex justify-between"><span>Tunai:</span> <span>{formatCurrency(expenseByCash)}</span></div>
            </div>
        </Card>
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Saldo Saat Ini</h3>
                    <p className={`text-2xl font-semibold mt-1 ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                        {formatCurrency(balance)}
                    </p>
                </div>
                <SummaryIcon type="balance" />
            </div>
        </Card>
      </div>
    </section>
  );
};

export default Summary;
