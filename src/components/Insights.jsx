import React, { useMemo, useState } from 'react';
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

export default function Insights({ assignments, fullHeight = false }) {
  const statusData = useMemo(
    () => countBy(assignments, 'status', ['Pending', 'Completed']),
    [assignments]
  );
  const priorityData = useMemo(
    () => countBy(assignments, 'priority', ['High', 'Medium', 'Low']),
    [assignments]
  );

  const hasAny = assignments.length > 0;

  const [mobileTab, setMobileTab] = useState('status');

  return (
    <div className={`${fullHeight ? 'h-full' : ''}`}>
      <div className={`grid grid-cols-1 gap-4 ${fullHeight ? 'h-full' : ''} lg:grid-cols-2`}>
        {fullHeight ? (
          <div className="lg:hidden">
            <div className="inline-flex w-full rounded-2xl border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <button
                type="button"
                onClick={() => setMobileTab('status')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  mobileTab === 'status'
                    ? 'bg-blue-800 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                }`}
              >
                Status
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('priority')}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  mobileTab === 'priority'
                    ? 'bg-blue-800 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                }`}
              >
                Priority
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950 ${
            fullHeight ? 'min-h-0 lg:h-full' : ''
          } ${fullHeight ? (mobileTab === 'status' ? '' : 'hidden lg:block') : ''}`}
        >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Status</h2>
          <p className="text-xs font-semibold text-gray-600">Distribution</p>
        </div>
        <div className={`mt-3 ${fullHeight ? 'h-[calc(100%-24px)] min-h-0' : 'h-72'}`}>
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
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950 ${
          fullHeight ? 'min-h-0 lg:h-full' : ''
        } ${fullHeight ? (mobileTab === 'priority' ? '' : 'hidden lg:block') : ''}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Priority</h2>
          <p className="text-xs font-semibold text-gray-600">Counts</p>
        </div>
        <div className={`mt-3 ${fullHeight ? 'h-[calc(100%-24px)] min-h-0' : 'h-72'}`}>
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
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
              Add assignments to see insights.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
