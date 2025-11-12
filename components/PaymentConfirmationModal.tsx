import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (customerId: string, amount: number) => void;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({ isOpen, onClose, customer, onConfirm }) => {
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (customer) {
      // Default to the due amount, or the standard monthly amount if already paid up.
      const defaultAmount = customer.dueAmount > 0 ? customer.dueAmount : customer.amount;
      setPaymentAmount(String(defaultAmount));
    }
  }, [customer, isOpen]);


  if (!isOpen || !customer) {
    return null;
  }

  const handleConfirm = () => {
    const amountToPay = parseFloat(paymentAmount);
    if (!isNaN(amountToPay) && amountToPay > 0) {
      onConfirm(customer.id, amountToPay);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-gray-800">Konfirmasi Pembayaran</h2>
        <div>
            <p className="text-sm text-gray-600">
              Pelanggan: <span className="font-semibold text-gray-900">{customer.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Tagihan Saat Ini: <span className="font-semibold text-gray-900">{formatCurrency(customer.dueAmount)}</span>
            </p>
        </div>
        <div>
          <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700">Jumlah Pembayaran (Rp)</label>
          <input
              type="number"
              id="payment-amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
          >
            Ya, Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;