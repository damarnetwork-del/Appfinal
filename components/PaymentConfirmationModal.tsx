import React from 'react';
import { Customer } from '../types';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (customerId: string, amount: number) => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, customer, onConfirm }) => {
  if (!isOpen || !customer) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(customer.id, customer.amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Konfirmasi Pembayaran</h2>
        <p className="text-slate-600 mb-6">
          Anda akan mencatat pembayaran untuk <span className="font-semibold">{customer.name}</span> sebesar <span className="font-semibold">{formatCurrency(customer.amount)}</span>. Lanjutkan?
        </p>
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
            Ya, Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
