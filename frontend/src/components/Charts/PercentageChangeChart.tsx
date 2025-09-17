import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { QueryResult } from '../../types/query.types';

interface PercentageChangeChartProps {
  data: QueryResult[];
  title?: string;
}

const PercentageChangeChart: React.FC<PercentageChangeChartProps> = ({ 
  data, 
  title = "IV Percentage Change Analysis" 
}) => {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    symbol: item.symbol,
    percentageChange: item.percentageChange,
    sector: item.sector,
    currentCallIV: item.currentCallIv,
  })).sort((a, b) => b.percentageChange - a.percentageChange);

  // Color function based on percentage change
  const getBarColor = (value: number) => {
    if (value > 10) return '#48bb78'; // Green for high positive
    if (value > 0) return '#68d391'; // Light green for positive
    if (value > -10) return '#fc8181'; // Light red for small negative
    return '#e53e3e'; // Red for large negative
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'percentageChange') {
      return [
        `${Number(value).toFixed(2)}%`, 
        'Percentage Change',
        `Sector: ${props.payload.sector}`,
        `Current Call IV: ${props.payload.currentCallIV.toFixed(4)}`
      ];
    }
    return [Number(value).toFixed(2), name];
  };

  const formatYAxis = (value: number) => {
    return `${value}%`;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2d3748' }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="symbol" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#2d3748' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="percentageChange" 
              name="Percentage Change (%)"
              radius={[2, 2, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.percentageChange)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Legend for colors */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#48bb78', borderRadius: 1 }} />
          <Typography variant="caption">High Positive (&gt;10%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#68d391', borderRadius: 1 }} />
          <Typography variant="caption">Positive (0-10%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#fc8181', borderRadius: 1 }} />
          <Typography variant="caption">Small Negative (0 to -10%)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#e53e3e', borderRadius: 1 }} />
          <Typography variant="caption">Large Negative (&lt;-10%)</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PercentageChangeChart;