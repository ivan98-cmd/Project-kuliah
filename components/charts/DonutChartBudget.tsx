'use client';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Venue', value: 35, color: '#4F46E5' },
  { name: 'Konsumsi', value: 25, color: '#8B5CF6' },
  { name: 'Narasumber', value: 20, color: '#22C55E' },
  { name: 'Perlengkapan', value: 12, color: '#F59E0B' },
  { name: 'Promosi', value: 8, color: '#EC4899' },
];

export function DonutChartBudget() {
  return (
    <div className="h-[320px] w-full rounded-[32px] bg-[#191338] p-6 shadow-card">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Distribusi Anggaran</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Alokasi Pengeluaran</h2>
      </div>
      <div className="flex h-[220px] flex-col items-center justify-center gap-4 md:flex-row md:items-start md:justify-between">
        <ResponsiveContainer width="240" height="220">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={68} outerRadius={96} paddingAngle={4}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1f1744', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 18 }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid w-full gap-3 sm:w-auto">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-3xl bg-slate-950/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm text-slate-300">{item.name}</p>
                  <p className="text-sm font-semibold text-white">{item.value}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
