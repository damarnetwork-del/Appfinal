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
      return { text: 'Belum Bayar', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    const lastPayment = new Date(customer.paymentHistory[customer.paymentHistory.length - 1].date);
    const today = new Date();
    
    // Check if payment was this month
    if (lastPayment.getFullYear() === today.getFullYear() && lastPayment.getMonth() === today.getMonth()) {
        return { text: 'Sudah Bayar', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    
    return { text: 'Belum Bayar', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Manajemen Pelanggan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Tambah Pelanggan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700">Nama Pelanggan</label>
                <input type="text" id="customer-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700">No. HP</label>
                <input type="tel" id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="subscription-type" className="block text-sm font-medium text-slate-700">Jenis Langganan</label>
                <select id="subscription-type" value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  {Object.values(SubscriptionType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="customer-amount" className="block text-sm font-medium text-slate-700">Nominal (Rp)</label>
                <input type="number" id="customer-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Tambah Pelanggan
              </button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card>
            <div className="overflow-x-auto">
              {customers.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">No. HP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Langganan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nominal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {customers.map(c => {
                      const status = getStatus(c);
                      return (
                      <tr key={c.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{c.subscriptionType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatCurrency(c.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                                {status.text}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => onConfirmPayment(c)} className="text-green-600 hover:text-green-900">Bayar</button>
                          <button onClick={() => onEdit(c)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-slate-500 py-8">Belum ada pelanggan.</p>
              )}
            </div>
           </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
