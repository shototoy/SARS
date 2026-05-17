import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../ThemeContext';

function countBy(assignments, key, order) {
  const counts = new Map(order.map((v) => [v, 0]));
  for (const a of assignments) {
    const value = a?.[key] || order[0];
    if (counts.has(value)) counts.set(value, counts.get(value) + 1);
  }
  return order.map((name) => ({ name, value: counts.get(name) || 0 }));
}

export default function DashboardInsights({ assignments }) {
  const colors = useTheme();
  const hasAny = assignments.length > 0;

  const statusData = useMemo(() => countBy(assignments, 'status', ['Pending', 'Completed']), [assignments]);
  const priorityData = useMemo(() => countBy(assignments, 'priority', ['High', 'Medium', 'Low']), [assignments]);

  const STATUS_COLORS = { Pending: colors.main, Completed: '#22C55E' };
  const PRIORITY_COLORS = { High: '#DC2626', Medium: '#F97316', Low: '#22C55E' };

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-3">
      <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Status Distribution</p>
        <div className="mt-1 flex-1 min-h-0">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={2}>
                  {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-[10px] font-bold text-gray-400">No data</div>
          )}
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Priority Level</p>
        <div className="mt-1 flex-1 min-h-0">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} fontWeight={700} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} fontSize={10} fontWeight={700} />
                <Tooltip />
                <Bar dataKey="value" name="Tasks" radius={[6, 6, 6, 6]}>
                  {priorityData.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || colors.main} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-[10px] font-bold text-gray-400">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
