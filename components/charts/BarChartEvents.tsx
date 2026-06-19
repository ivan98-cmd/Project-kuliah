'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Jan', events: 2 },
  { month: 'Feb', events: 3 },
  { month: 'Mar', events: 4 },
  { month: 'Apr', events: 3 },
  { month: 'Mei', events: 2 },
  { month: 'Jun', events: 1 },
];

export function BarChartEvents() {
  return (
    <div className="h-[320px] w-full rounded-[32px] bg-[#191338] p-6 shadow-card">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Statistik Event</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Event per Bulan</h2>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#3f3a86" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f1744', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 18 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="events" fill="#6366F1" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
