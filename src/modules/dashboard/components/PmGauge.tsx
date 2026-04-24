import React from 'react';

interface PmGaugeProps {
  value: number; // 0-100
  size?: number;
}

export default function PmGauge({ value, size = 72 }: PmGaugeProps) {
  const r = (size / 2) * 0.7;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  const color = value >= 80 ? '#16a34a' : value >= 60 ? '#d97706' : '#dc2626';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth={size * 0.12}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.12}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={cx} y={cy + size * 0.07}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="700"
        fill={color}
        fontFamily="DM Sans, sans-serif"
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}
