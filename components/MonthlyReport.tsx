
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

  const formatCurrency = (amount: number, compact = false) => {
    if (compact) {
        if (amount >= 1e6) {
            return `${(amount / 1e6).toFixed(1)} Jt`;
        }
        if (amount >= 1e3) {
            return `${(amount / 1e3).toFixed(0)} Rb`;
        }
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: 0,
      expense: 0,
    }));

    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });

    currentMonthTransactions.forEach(t => {
      const dayOfMonth = new Date(t.date).getDate();
      const dayIndex = dayOfMonth - 1;
      if (t.type === TransactionType.INCOME) {
        dailyData[dayIndex].income += t.amount;
      } else {
        dailyData[dayIndex].expense += t.amount;
      }
    });

    const maxAmount = Math.max(1, ...dailyData.map(d => d.income), ...dailyData.map(d => d.expense));
    
    return { dailyData, maxAmount, daysInMonth };
  }, [transactions]);


  const members = ['Mardi', 'Daden', 'Hamdan', 'Umi'];
  const profitShare = balance > 0 ? balance / members.length : 0;

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
  
  // SVG Chart constants
  const width = 500;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getCoords = (day: number, amount: number) => {
    const x = padding.left + ((day - 1) / (chartData.daysInMonth - 1)) * chartWidth;
    const y = padding.top + chartHeight - (amount / chartData.maxAmount) * chartHeight;
    return { x, y };
  };

  const incomePath = chartData.dailyData
    .map((d) => {
      const { x, y } = getCoords(d.day, d.income);
      return `${d.day === 1 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const expensePath = chartData.dailyData
    .map((d) => {
      const { x, y } = getCoords(d.day, d.expense);
      return `${d.day === 1 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const yAxisLabels = [0, chartData.maxAmount / 2, chartData.maxAmount].map(val => ({
    value: val,
    y: getCoords(1, val).y,
  }));

  const xAxisLabels = chartData.dailyData
    .filter(d => d.day === 1 || d.day % 5 === 0)
    .map(d => ({
        value: d.day,
        x: getCoords(d.day, 0).x,
    }));


  return (
    <section>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Laporan & Bagi Hasil</h2>
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Grafik Tren Bulanan</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 relative">
                {transactions.length > 0 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                        {/* Y-Axis Gridlines and Labels */}
                        {yAxisLabels.map(({ value, y }) => (
                            <g key={`y-axis-${value}`} className="text-gray-400">
                                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" strokeDasharray="2,3" strokeWidth="0.5" />
                                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-xs fill-current">{formatCurrency(value, true)}</text>
                            </g>
                        ))}
                        {/* X-Axis Labels */}
                        {xAxisLabels.map(({ value, x }) => (
                             <g key={`x-axis-${value}`} className="text-gray-400">
                                <text x={x} y={height - padding.bottom + 15} textAnchor="middle" className="text-xs fill-current">{value}</text>
                            </g>
                        ))}
                         <text x={width/2} y={height - 5} textAnchor="middle" className="text-xs font-semibold fill-gray-600">Hari dalam Bulan Ini</text>

                        {/* Data Lines */}
                        <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="2" />
                        <path d={expensePath} fill="none" stroke="#ef4444" strokeWidth="2" />
                        
                        {/* Data Points and Tooltips */}
                        {chartData.dailyData.map((d) => {
                            const incomeCoords = getCoords(d.day, d.income);
                            const expenseCoords = getCoords(d.day, d.expense);
                            return (
                                <g key={`day-${d.day}-points`}>
                                    {d.income > 0 && <circle cx={incomeCoords.x} cy={incomeCoords.y} r="3" fill="#10b981" stroke="white" strokeWidth="1">
                                        <title>{`Hari ${d.day} (Pemasukan): ${formatCurrency(d.income)}`}</title>
                                    </circle>}
                                    {d.expense > 0 && <circle cx={expenseCoords.x} cy={expenseCoords.y} r="3" fill="#ef4444" stroke="white" strokeWidth="1">
                                        <title>{`Hari ${d.day} (Pengeluaran): ${formatCurrency(d.expense)}`}</title>
                                    </circle>}
                                </g>
                            )
                        })}
                    </svg>
                ) : (
                    <p className="text-center text-gray-500 h-48 flex items-center justify-center">Data transaksi tidak cukup untuk menampilkan grafik.</p>
                )}
                 <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-gray-600">
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-1.5"></span>
                        <span>Pemasukan</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-1.5"></span>
                        <span>Pengeluaran</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-700">Perhitungan Bagi Hasil</h3>
            <p className="text-sm text-gray-500">Berdasarkan total saldo saat ini: <span className="font-bold">{formatCurrency(balance)}</span></p>
          </div>
          {balance > 0 ? (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-gray-800 font-medium">{member}</span>
                  <span className="text-green-600 font-semibold">{formatCurrency(profitShare)}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-gray-500 text-center py-4">Saldo tidak mencukupi untuk bagi hasil.</p>
          )}

          <button
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Ekspor Laporan PDF
          </button>
        </div>
      </Card>
    </section>
  );
};

export default MonthlyReport;
