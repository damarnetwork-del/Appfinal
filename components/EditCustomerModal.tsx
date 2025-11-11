
import React, { useState, useEffect } from 'react';
// FIX: Added file extension to import statement
import { Customer, SubscriptionType } from '../types.ts';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  updateCustomer: (customer: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer, updateCustomer }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(SubscriptionType.PPPOE);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setSubscriptionType(customer.subscriptionType);
      setAmount(String(customer.amount));
      setError('');
    }
  }, [customer]);

  if (!isOpen || !customer) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !amount.trim() || parseFloat(amount) <= 0) {
      setError('Semua field harus diisi dengan benar.');
      return;
    }

    updateCustomer({
      ...customer,
      name,
      phone,
      subscriptionType,
      amount: parseFloat(amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Pelanggan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-customer-name" className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
            <input type="text" id="edit-customer-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label htmlFor="edit-customer-phone" className="block text-sm font-medium text-gray-700">No. HP</label>
            <input type="tel" id="edit-customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
          </div>
          <div>
            <label htmlFor="edit-subscription-type" className="block text-sm font-medium text-gray-700">Jenis Langganan</label>
            <select id="edit-subscription-type" value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              {/* FIX: Explicitly cast enum values to an array of SubscriptionType to fix mapping error. */}
              {(Object.values(SubscriptionType) as SubscriptionType[]).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-customer-amount" className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
            <input type="number" id="edit-customer-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
