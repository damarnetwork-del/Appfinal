import React, { useState } from 'react';
import { Customer, TransactionMethod } from '../types';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (customerId: string, amount: number, method: TransactionMethod) => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, customer, onConfirm }) => {
  const [method, setMethod] = useState<TransactionMethod>(TransactionMethod.TRANSFER);
  
  if (!isOpen || !customer) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(customer.id, customer.amount, method);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Konfirmasi Pembayaran</h2>
        <p className="text-slate-600 mb-4">
          Anda akan mencatat pembayaran untuk <span className="font-semibold">{customer.name}</span> sebesar <span className="font-semibold">{formatCurrency(customer.amount)}</span>.
        </p>
        
        <fieldset className="mb-6">
            <legend className="text-sm font-medium text-slate-700">Pilih Metode Pembayaran</legend>
            <div className="mt-2 flex items-center space-x-6">
                <div className="flex items-center">
                    <input
                        id="confirm-transfer"
                        name="confirm-payment-method"
                        type="radio"
                        checked={method === TransactionMethod.TRANSFER}
                        onChange={() => setMethod(TransactionMethod.TRANSFER)}
                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="confirm-transfer" className="ml-2 block text-sm text-slate-900">
                        Transfer
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        id="confirm-cash"
                        name="confirm-payment-method"
                        type="radio"
                        checked={method === TransactionMethod.CASH}
                        onChange={() => setMethod(TransactionMethod.CASH)}
                        className="h-4 w-4 text-green-600 border-slate-300 focus:ring-green-500"
                    />
                    <label htmlFor="confirm-cash" className="ml-2 block text-sm text-slate-900">
                        Tunai
                    </label>
                </div>
            </div>
        </fieldset>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;