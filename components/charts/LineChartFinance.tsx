'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const data = [
  { month: 'Jan', income: 18, expense: 12 },
  { month: 'Feb', income: 22, expense: 16 },
  { month: 'Mar', income: 25, expense: 19 },
  { month: 'Apr', income: 28, expense: 21 },
  { month: 'Mei', income: 30, expense: 23 },
  { month: 'Jun', income: 32, expense: 25 },
];

export function LineChartFinance() {
  return (
    <div className="h-[320px] w-full rounded-[32px] bg-[#191338] p-6 shadow-card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Keuangan Bulanan</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Tren Pendapatan vs Pengeluaran</h2>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#3f3a86" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f1744', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 18 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: 12 }} />
          <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#74b3ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#b084f5" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
