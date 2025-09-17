import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { QueryResult } from '../../types/query.types';

interface IVTrendChartProps {
  data: QueryResult[];
  title?: string;
}

const IVTrendChart: React.FC<IVTrendChartProps> = ({ data, title = "IV Trend Analysis" }) => {
  // Transform data for the chart
  const chartData = data.map((item, index) => ({
    symbol: item.symbol,
    currentCallIV: item.currentCallIv,
    currentPutIV: item.currentPutIv,
    comparisonValue: item.comparisonValue,
    difference: item.difference,
    percentageChange: item.percentageChange,
    index: index + 1,
  }));

  const formatTooltip = (value: any, name: string) => {
    if (name === 'percentageChange') {
      return [`${Number(value).toFixed(2)}%`, 'Percentage Change'];
    }
    return [Number(value).toFixed(4), name];
  };

  const formatYAxis = (value: number) => {
    return value.toFixed(3);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2d3748' }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            <Line 
              type="monotone" 
              dataKey="currentCallIV" 
              stroke="#667eea" 
              strokeWidth={2}
              name="Current Call IV"
              dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="currentPutIV" 
              stroke="#764ba2" 
              strokeWidth={2}
              name="Current Put IV"
              dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="comparisonValue" 
              stroke="#48bb78" 
              strokeWidth={2}
              name="Comparison Value"
              dot={{ fill: '#48bb78', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default IVTrendChart;