import React, { useMemo } from 'react';
// FIX: Added file extension to import statement
import { Transaction, TransactionType } from '../types.ts';
import Card from './Card';

// Declare jspdf global from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const MonthlyReport: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const members = ['Mardi', 'Daden', 'Hamdan', 'Umi'];
  const profitShare = balance > 0 ? balance / members.length : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    // 1. Kop Perusahaan (Letterhead)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Damar Global Network', 105, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Kemajuan No. 123, Jakarta Pusat, Indonesia', 105, y, { align: 'center' });
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;

    // 2. Judul Laporan
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const reportMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    doc.text(`Laporan Keuangan Bulanan - ${reportMonth}`, 105, y, { align: 'center' });
    y += 15;

    // 3. Laporan Bagi Hasil
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Bagi Hasil', 20, y);
    y += 7;
    const shareBody = members.map(member => [member, formatCurrency(profitShare)]);
    (doc as any).autoTable({
      startY: y,
      head: [['Nama Anggota', 'Jumlah Bagian']],
      body: shareBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    
    // 4. Riwayat Transaksi
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Riwayat Transaksi', 20, y);
    y += 7;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const tableBody = sortedTransactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.description,
      t.method === 'CASH' ? 'Tunai' : 'Transfer',
      t.type === TransactionType.INCOME ? formatCurrency(t.amount) : '',
      t.type === TransactionType.EXPENSE ? formatCurrency(t.amount) : '',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Tanggal', 'Deskripsi', 'Metode', 'Pemasukan', 'Pengeluaran']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      didDrawPage: (data: any) => {
        y = data.cursor.y;
      }
    });
    
    y = (doc as any).lastAutoTable.finalY + 20;

    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    // 5. Tanda Tangan
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Jakarta, ${today}`, 190, y, { align: 'right' });
    y += 7;
    doc.text('Hormat kami,', 190, y, { align: 'right' });
    y += 30; // Space for signature
    doc.setFont('helvetica', 'bold');
    doc.text('Mardi Jayadi', 190, y, { align: 'right' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('Direktur', 190, y, { align: 'right' });

    doc.save(`Laporan_Keuangan_${reportMonth.replace(' ', '_')}.pdf`);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Laporan Bulanan & Bagi Hasil</h2>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Perhitungan Bagi Hasil</h3>
            <p className="text-sm text-slate-500">Berdasarkan total saldo saat ini: <span className="font-bold">{formatCurrency(balance)}</span></p>
          </div>
          {balance > 0 ? (
            <ul className="divide-y divide-slate-200">
              {members.map(member => (
                <li key={member} className="py-3 flex justify-between items-center">
                  <span className="text-slate-800 font-medium">{member}</span>
                  <span className="text-green-600 font-semibold">{formatCurrency(profitShare)}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-slate-500 text-center py-4">Saldo tidak mencukupi untuk bagi hasil.</p>
          )}

          <button
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Ekspor Laporan PDF
          </button>
        </div>
      </Card>
    </section>
  );
};

export default MonthlyReport;