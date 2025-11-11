
import React, { useState } from 'react';
import { Customer, SubscriptionType } from '../types';
import Card from './Card';

interface CustomerSectionProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'paymentHistory'>) => void;
  deleteCustomer: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onConfirmPayment: (customer: Customer) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customers, addCustomer, deleteCustomer, onEdit, onConfirmPayment }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(SubscriptionType.PPPOE);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !amount.trim() || parseFloat(amount) <= 0) {
      setError('Semua field harus diisi dengan benar.');
      return;
    }
    addCustomer({ name, phone, subscriptionType, amount: parseFloat(amount) });
    setName('');
    setPhone('');
    setAmount('');
    setError('');
  };

  const getStatus = (customer: Customer) => {
    if (customer.paymentHistory.length === 0) {
      return { text: 'Belum Bayar', color: 'text-red-700', bgColor: 'bg-red-100' };
    }
    const lastPayment = new Date(customer.paymentHistory[customer.paymentHistory.length - 1].date);
    const today = new Date();
    
    // Check if payment was this month
    if (lastPayment.getFullYear() === today.getFullYear() && lastPayment.getMonth() === today.getMonth()) {
        return { text: 'Sudah Bayar', color: 'text-green-700', bgColor: 'bg-green-100' };
    }
    
    return { text: 'Belum Bayar', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Manajemen Pelanggan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Tambah Pelanggan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
                <input type="text" id="customer-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700">No. HP</label>
                <input type="tel" id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label htmlFor="subscription-type" className="block text-sm font-medium text-gray-700">Jenis Langganan</label>
                <select id="subscription-type" value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  {Object.values(SubscriptionType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="customer-amount" className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                <input type="number" id="customer-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"/>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                Tambah Pelanggan
              </button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {customers.length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Langganan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {customers.map((c, index) => {
                      const status = getStatus(c);
                      return (
                      <tr key={c.id} className={index % 2 === 0 ? undefined : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.subscriptionType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                                {status.text}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                          <button onClick={() => onConfirmPayment(c)} className="text-green-600 hover:text-green-800 font-medium">Bayar</button>
                          <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">Belum ada pelanggan.</p>
              )}
            </div>
           </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
