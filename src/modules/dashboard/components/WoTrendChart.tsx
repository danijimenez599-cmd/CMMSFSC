import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface WoTrendChartProps {
  data: { label: string; created: number; completed: number }[];
}

export default function WoTrendChart({ data }: WoTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-tx-4">
        Sin datos históricos aún.
      </div>
    );
  }

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#991b1b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#991b1b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#8a6456' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8a6456' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e7e5e4',
              fontSize: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ fontWeight: 700, color: '#1a0f0a', marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Creadas"
            stroke="#991b1b"
            strokeWidth={2}
            fill="url(#gradCreated)"
            dot={{ r: 3, fill: '#991b1b', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completadas"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#gradCompleted)"
            dot={{ r: 3, fill: '#16a34a', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
