import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  Pending: '#1E40AF',
  Completed: '#22C55E',
};

const PRIORITY_COLORS = {
  High: '#DC2626',
  Medium: '#F97316',
  Low: '#22C55E',
};

function countBy(assignments, key, order) {
  const counts = new Map(order.map((v) => [v, 0]));
  for (const a of assignments) {
    const value = a?.[key] || order[0];
    if (!counts.has(value)) counts.set(value, 0);
    counts.set(value, counts.get(value) + 1);
  }
  return order.map((name) => ({ name, value: counts.get(name) || 0 }));
}

export default function DashboardInsights({ assignments }) {
  const hasAny = assignments.length > 0;

  const statusData = useMemo(
    () => countBy(assignments, 'status', ['Pending', 'Completed']),
    [assignments]
  );
  const priorityData = useMemo(
    () => countBy(assignments, 'priority', ['High', 'Medium', 'Low']),
    [assignments]
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-2.5">
      <div className="flex min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-[11px] font-extrabold text-gray-700 dark:text-gray-200">Status</p>
        <div className="mt-1 flex-1 min-h-[96px]">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={22} outerRadius={40} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:text-gray-300">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <p className="text-[11px] font-extrabold text-gray-700 dark:text-gray-200">Priority</p>
        <div className="mt-1 flex-1 min-h-[96px]">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 2, right: 6, bottom: -6, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={18} fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" name="Assignments" barSize={18} radius={[10, 10, 10, 10]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:text-gray-300">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
