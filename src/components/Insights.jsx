import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  Pending: '#4F46E5',
  Ongoing: '#F59E0B',
  Completed: '#16A34A',
};

const PRIORITY_COLORS = {
  High: '#DC2626',
  Medium: '#F59E0B',
  Low: '#16A34A',
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

export default function Insights({ assignments }) {
  const statusData = useMemo(
    () => countBy(assignments, 'status', ['Pending', 'Ongoing', 'Completed']),
    [assignments]
  );
  const priorityData = useMemo(
    () => countBy(assignments, 'priority', ['High', 'Medium', 'Low']),
    [assignments]
  );

  const hasAny = assignments.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Status</h2>
          <p className="text-xs font-semibold text-gray-600">Distribution</p>
        </div>
        <div className="mt-3 h-72">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-600">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Priority</h2>
          <p className="text-xs font-semibold text-gray-600">Counts</p>
        </div>
        <div className="mt-3 h-72">
          {hasAny ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Assignments">
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-600">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

