import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  height?: number;
  className?: string;
  showLegend?: boolean;
  centerLabel?: string;
  showLabels?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-50">
        <p className="text-xs font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name}: ${value}%`}
    </text>
  );
};

export default function DonutChart({
  data,
  height = 250,
  className,
  showLegend = true,
  centerLabel,
  showLabels = true,
}: DonutChartProps) {
  // Calculate responsive radius based on height
  const outerRadius = Math.min(60, (height - 60) / 2);
  const innerRadius = outerRadius * 0.6;

  return (
    <div className={cn('w-full relative', className)}>
      <div style={{ height: height - (showLegend ? 60 : 0) }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              label={showLabels ? renderCustomLabel : false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              {centerLabel && (
                <Label
                  value={centerLabel}
                  position="center"
                  fill="#374151"
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom Legend Below Chart */}
      {showLegend && (
        <div className="px-2 space-y-0.5">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px] sm:text-xs">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <div 
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
              <span className="text-gray-800 font-medium ml-1 shrink-0">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}