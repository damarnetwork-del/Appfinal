import React, { useState } from 'react';
import { Customer, SubscriptionType } from '../types';
import Card from './Card';

interface CustomerSectionProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  deleteCustomer: (id: string) => void;
  onEdit: (customer: Customer) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customers, addCustomer, deleteCustomer, onEdit }) => {
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

    addCustomer({
      name,
      phone,
      subscriptionType,
      amount: parseFloat(amount),
    });

    setName('');
    setPhone('');
    setSubscriptionType(SubscriptionType.PPPOE);
    setAmount('');
    setError('');
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Manajemen Pelanggan</h2>
      <div className="space-y-8">
        <Card>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Tambah Pelanggan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700">Nama Pelanggan</label>
              <input type="text" id="customer-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-slate-700">No. HP</label>
              <input type="tel" id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
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
              <input type="number" id="customer-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150000" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Tambah Pelanggan
            </button>
          </form>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Daftar Pelanggan</h3>
           <div className="overflow-x-auto">
              {customers.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">No. HP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Langganan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nominal</th>
                      <th className="relative px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{c.phone}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{c.subscriptionType}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatCurrency(c.amount)}</td>
                        <td className="px-4 py-4 text-right text-sm font-medium space-x-2">
                           <button onClick={() => onEdit(c)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                           <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-slate-500 py-6">Belum ada pelanggan.</p>
              )}
           </div>
        </Card>
      </div>
    </section>
  );
};

export default CustomerSection;
