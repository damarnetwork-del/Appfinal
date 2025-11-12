import React, { useState, useMemo } from 'react';
import { Customer, SubscriptionType, CompanyProfile } from '../types';
import Card from './Card';

interface CustomerSectionProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'paymentHistory' | 'dueAmount' | 'lastBilledMonth'>) => void;
  deleteCustomer: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onConfirmPayment: (customer: Customer) => void;
  companyProfile: CompanyProfile;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customers, addCustomer, deleteCustomer, onEdit, onConfirmPayment, companyProfile }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(SubscriptionType.PPPOE);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');


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
    if (customer.dueAmount <= 0) {
      return { text: 'Lunas', color: 'text-green-700', bgColor: 'bg-green-100' };
    }
    return { text: 'Belum Bayar', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  const handleRemind = (customer: Customer) => {
    if (customer.dueAmount <= 0) return;

    // Format phone number for WhatsApp link (e.g., from 08... to 628...)
    const formattedPhone = customer.phone.startsWith('0') ? '62' + customer.phone.substring(1) : customer.phone;
    
    const message = `Yth. Bapak/Ibu ${customer.name},

Kami dari ${companyProfile.name} ingin mengingatkan mengenai tagihan bulanan Anda yang telah jatuh tempo.

Total Tagihan: *${formatCurrency(customer.dueAmount)}*

Mohon untuk segera melakukan pembayaran. Jika Anda sudah membayar, mohon abaikan pesan ini.

Terima kasih.`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const shouldFilter = term !== '' || selectedType !== 'ALL';

    if (!shouldFilter) {
      return []; // Don't show results if no search/filter is active
    }

    return customers.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(term);
      const typeMatch = selectedType === 'ALL' || c.subscriptionType === selectedType;
      return nameMatch && typeMatch;
    });
  }, [customers, searchTerm, selectedType]);

  const isSearching = searchTerm.trim() !== '' || selectedType !== 'ALL';

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
                <input type="text" id="customer-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"/>
              </div>
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700">No. HP</label>
                <input type="tel" id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"/>
              </div>
              <div>
                <label htmlFor="subscription-type" className="block text-sm font-medium text-gray-700">Jenis Langganan</label>
                <select id="subscription-type" value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                  {Object.values(SubscriptionType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="customer-amount" className="block text-sm font-medium text-gray-700">Nominal Tagihan (Rp)</label>
                <input type="number" id="customer-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"/>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                Tambah Pelanggan
              </button>
            </form>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Cari nama pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow w-full px-3 py-2 bg-white border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    aria-label="Cari Pelanggan"
                />
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    aria-label="Filter Jenis Langganan"
                >
                    <option value="ALL">Semua Jenis</option>
                    {Object.values(SubscriptionType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto">
              {isSearching && filteredCustomers.length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagihan Bulanan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tagihan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredCustomers.map((c, index) => {
                      const status = getStatus(c);
                      return (
                      <tr key={c.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(c.amount)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${c.dueAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(c.dueAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                                {status.text}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                          <button onClick={() => handleRemind(c)} className="text-yellow-600 hover:text-yellow-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed" disabled={c.dueAmount <= 0}>Ingatkan</button>
                          <button onClick={() => onConfirmPayment(c)} className="text-green-600 hover:text-green-800 font-medium" disabled={c.dueAmount <= 0}>Bayar</button>
                          <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <button onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {isSearching ? 'Tidak ada pelanggan yang cocok.' : 'Silakan cari nama atau filter berdasarkan jenis langganan untuk melihat data.'}
                </p>
              )}
            </div>
           </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
