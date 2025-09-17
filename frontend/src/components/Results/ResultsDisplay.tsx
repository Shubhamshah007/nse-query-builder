import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TableChart as TableIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { QueryExecutionResponse } from '../../types/query.types';
import IVTrendChart from '../Charts/IVTrendChart';
import PercentageChangeChart from '../Charts/PercentageChangeChart';

interface ResultsDisplayProps {
  results: QueryExecutionResponse | null;
  loading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, loading }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Executing query...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          border: '2px dashed #e2e8f0',
          borderRadius: 2,
          bgcolor: '#f8fafc',
        }}
      >
        <Typography color="textSecondary">
          Execute a query to see results here
        </Typography>
      </Box>
    );
  }

  if (results.results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No results found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your query conditions
        </Typography>
      </Box>
    );
  }

  // Render tabbed interface with visualizations
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Table View
        return (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Symbol</strong></TableCell>
                  <TableCell><strong>Sector</strong></TableCell>
                  <TableCell align="right"><strong>Current IV</strong></TableCell>
                  <TableCell align="right"><strong>Comparison</strong></TableCell>
                  <TableCell align="right"><strong>% Change</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.results.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <strong>{row.symbol}</strong>
                        {row.isExpiryWeek && (
                          <Chip label="EXP" size="small" color="warning" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{row.sector}</TableCell>
                    <TableCell align="right">
                      {row.currentCallIv.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {row.comparisonValue.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${row.percentageChange >= 0 ? '+' : ''}${row.percentageChange.toFixed(2)}%`}
                        size="small"
                        color={row.percentageChange >= 0 ? 'success' : 'error'}
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 1: // Line Chart View
        return <IVTrendChart data={results.results} />;
      case 2: // Bar Chart View
        return <PercentageChangeChart data={results.results} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<TableIcon />} 
          label="Data Table" 
          sx={{ minHeight: 48 }}
        />
        <Tab 
          icon={<ChartIcon />} 
          label="IV Trends" 
          sx={{ minHeight: 48 }}
        />
        <Tab 
          icon={<BarChartIcon />} 
          label="% Changes" 
          sx={{ minHeight: 48 }}
        />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default ResultsDisplay;