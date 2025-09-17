import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AppBar,
  Toolbar,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Autocomplete,
  ListSubheader,
  Divider,
  Collapse,
  IconButton,
  Menu,
  MenuList,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Layers as LayersIcon,
  Tune as TuneIcon,
  TableView as TableViewIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
  AccessTime as AccessTimeIcon,
  ShowChart as ShowChartIcon,
  Functions as FunctionsIcon,
  VolumeUp as VolumeUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Import API service
import { queryAPI, SimpleQueryCondition } from '../services/api';

interface QueryCondition {
  field1: string;
  operator: string;
  field2?: string;
  value?: number;
  percentageThreshold?: number;
}

interface QueryResult {
  symbol: string;
  sector: string;
  instrumentType: string;
  field1Value: number;
  field1Label: string;
  field2Value?: number;
  field2Label?: string;
  comparisonValue: number;
  difference: number;
  percentageChange: number;
  volume?: number;
  openInterest?: number;
  strikePrice?: number;
  expiryDate?: string;
  isExpiryWeek: boolean;
  resultMonth?: string;
}

interface QueryDebugInfo {
  queryObject: any;
  sqlQuery: string;
  executionTime: number;
  appliedFilters: Array<{
    field: string;
    operator: string;
    value: string | number;
  }>;
  queryComplexity: 'Simple' | 'Moderate' | 'Complex';
  tablesUsed: string[];
  indexesUsed: string[];
}

const SimpleQueryBuilder: React.FC = () => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<QueryDebugInfo | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Helper function to get category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Current':
        return <ShowChartIcon sx={{ fontSize: 16, color: '#667eea' }} />;
      case 'Historical':
        return <AccessTimeIcon sx={{ fontSize: 16, color: '#38b2ac' }} />;
      case 'Intraday':
        return <TimerIcon sx={{ fontSize: 16, color: '#ed8936' }} />;
      case 'Greeks':
        return <FunctionsIcon sx={{ fontSize: 16, color: '#9f7aea' }} />;
      case 'Volume':
        return <VolumeUpIcon sx={{ fontSize: 16, color: '#48bb78' }} />;
      case 'Price':
        return <MonetizationOnIcon sx={{ fontSize: 16, color: '#f56565' }} />;
      case 'Statistical':
        return <AnalyticsIcon sx={{ fontSize: 16, color: '#4299e1' }} />;
      default:
        return <ShowChartIcon sx={{ fontSize: 16, color: '#a0aec0' }} />;
    }
  };

  // Custom Menu Field Selector Component
  const MenuFieldSelector = ({ 
    label, 
    value, 
    options, 
    onChange, 
    width = 240,
    showCustomOption = false 
  }: {
    label: string;
    value: string;
    options: Array<{value: string, label: string, category?: string}>;
    onChange: (value: string) => void;
    width?: number;
    showCustomOption?: boolean;
  }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    
    // Group options by category
    const groupedOptions = React.useMemo(() => {
      if (!options[0]?.category) {
        return { 'Options': options };
      }
      
      const groups: { [key: string]: typeof options } = {};
      
      if (showCustomOption) {
        groups['Custom'] = [{ value: '', label: 'Enter custom value below', category: 'Custom' }];
      }
      
      options.forEach(option => {
        const category = option.category || 'Other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(option);
      });
      
      return groups;
    }, [options, showCustomOption]);
    
    const selectedOption = options.find(opt => opt.value === value) || 
                          (value === '' && showCustomOption ? { value: '', label: 'Enter custom value below', category: 'Custom' } : null);
    
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
      setAnchorEl(null);
    };
    
    const handleOptionSelect = (optionValue: string) => {
      onChange(optionValue);
      handleClose();
    };
    
    return (
      <Box sx={{ minWidth: width }}>
        <Box
          sx={{
            border: open ? '1.5px solid #667eea' : '1px solid #d1d5db',
            borderRadius: 2,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            bgcolor: open ? '#f8fafc' : '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: open ? '0 4px 12px -2px rgba(102, 126, 234, 0.15)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '&:hover': {
              borderColor: '#667eea',
              boxShadow: '0 4px 12px -2px rgba(102, 126, 234, 0.15)',
              bgcolor: '#f8fafc'
            }
          }}
          onClick={handleClick}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {selectedOption ? (
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: selectedOption.category === 'Custom' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(102, 126, 234, 0.1)'
                }}>
                  {selectedOption.category === 'Custom' ? (
                    <EditIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  ) : (
                    getCategoryIcon(selectedOption.category || '')
                  )}
                </Box>
              ) : (
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f1f5f9'
                }}>
                  <SearchIcon sx={{ fontSize: 16, color: '#64748b' }} />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontSize: '0.75rem', 
                  display: 'block',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase'
                }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: selectedOption ? 600 : 500,
                  color: selectedOption ? '#1a202c' : '#64748b',
                  fontSize: '0.875rem',
                  lineHeight: 1.3,
                  mt: 0.25
                }}>
                  {selectedOption ? selectedOption.label : `Choose ${label.toLowerCase()}...`}
                </Typography>
                {selectedOption?.category && (
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontSize: '0.7rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                    display: 'block',
                    mt: 0.25
                  }}>
                    {selectedOption.category} • {selectedOption.value}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: open ? 'rgba(102, 126, 234, 0.1)' : '#f8fafc',
              transition: 'all 0.2s ease'
            }}>
              <ExpandMoreIcon 
                sx={{ 
                  fontSize: 18, 
                  color: open ? '#667eea' : '#64748b',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </Box>
          </Box>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: '75vw',
              maxWidth: '1000px',
              minWidth: '800px',
              height: 'auto',
              maxHeight: '500px',
              mt: 1,
              borderRadius: 2.5,
              boxShadow: '0 20px 60px -8px rgba(0, 0, 0, 0.15), 0 8px 30px -4px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              bgcolor: '#ffffff',
              overflow: 'hidden'
            }
          }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          MenuListProps={{
            sx: {
              p: 0,
              bgcolor: '#ffffff',
              overflow: 'hidden'
            }
          }}
        >
          {/* Compact Header */}
          <Box sx={{ 
            px: 3, 
            py: 2, 
            borderBottom: '1px solid #e5e7eb',
            bgcolor: '#f9fafb'
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              color: '#374151',
              fontSize: '1rem'
            }}>
              {label === 'Operator' ? 'Select Operator' : `Select ${label}`}
            </Typography>
          </Box>

          {/* Multi-Column Horizontal Layout - NO SCROLLING */}
          <Box sx={{ 
            p: 2.5,
            height: 'calc(100% - 65px)', // Reserve space for compact header
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            overflow: 'hidden'
          }}>
            {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
              <Box key={category} sx={{ 
                flex: '1 1 0',
                minWidth: 0, // Allow shrinking
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Category Header */}
                <Box sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: category === 'Custom' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(102, 126, 234, 0.08)',
                  border: category === 'Custom' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(102, 126, 234, 0.15)',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: category === 'Custom' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(102, 126, 234, 0.2)',
                    margin: '0 auto 8px auto'
                  }}>
                    {category === 'Custom' ? (
                      <EditIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    ) : (
                      React.cloneElement(getCategoryIcon(category), { sx: { fontSize: 16 } })
                    )}
                  </Box>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 700, 
                    color: '#1a202c',
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                    mb: 0.25
                  }}>
                    {category}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b',
                    fontSize: '0.7rem',
                    fontWeight: 500
                  }}>
                    {categoryOptions.length}
                  </Typography>
                </Box>
                
                {/* Category Options - Compact Vertical List */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0.75,
                  flex: 1,
                  overflow: 'hidden'
                }}>
                  {categoryOptions.map((option) => (
                    <Box
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: option.value === value ? 'rgba(102, 126, 234, 0.12)' : 'transparent',
                        border: option.value === value ? '1.5px solid #667eea' : '1.5px solid transparent',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: option.value === value ? 'rgba(102, 126, 234, 0.18)' : 'rgba(102, 126, 234, 0.06)',
                          borderColor: option.value === value ? '#667eea' : 'rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: option.value === value ? 700 : 600,
                              color: option.value === value ? '#667eea' : '#1a202c',
                              fontSize: '0.8rem',
                              lineHeight: 1.3,
                              fontStyle: option.category === 'Custom' ? 'italic' : 'normal',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {option.label}
                          </Typography>
                          {option.category !== 'Custom' && option.value && (
                            <Typography variant="caption" sx={{ 
                              color: '#64748b', 
                              fontSize: '0.65rem',
                              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
                              display: 'block',
                              mt: 0.25,
                              opacity: 0.7,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {option.value}
                            </Typography>
                          )}
                        </Box>
                        {option.value === value && (
                          <CheckCircleIcon sx={{ 
                            fontSize: 16, 
                            color: '#667eea',
                            flexShrink: 0
                          }} />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Menu>
      </Box>
    );
  };

  const ivFields = [
    // Current IV Fields
    { value: 'current_call_iv', label: 'Current Call IV', category: 'Current' },
    { value: 'current_put_iv', label: 'Current Put IV', category: 'Current' },
    
    // Historical Average IV Fields  
    { value: 'avg_7day_call_iv', label: '7-Day Avg Call IV', category: 'Historical' },
    { value: 'avg_14day_call_iv', label: '14-Day Avg Call IV', category: 'Historical' },
    { value: 'avg_21day_call_iv', label: '21-Day Avg Call IV', category: 'Historical' },
    { value: 'avg_30day_call_iv', label: '30-Day Avg Call IV', category: 'Historical' },
    { value: 'avg_60day_call_iv', label: '60-Day Avg Call IV', category: 'Historical' },
    { value: 'avg_90day_call_iv', label: '90-Day Avg Call IV', category: 'Historical' },
    
    { value: 'avg_7day_put_iv', label: '7-Day Avg Put IV', category: 'Historical' },
    { value: 'avg_14day_put_iv', label: '14-Day Avg Put IV', category: 'Historical' },
    { value: 'avg_21day_put_iv', label: '21-Day Avg Put IV', category: 'Historical' },
    { value: 'avg_30day_put_iv', label: '30-Day Avg Put IV', category: 'Historical' },
    { value: 'avg_60day_put_iv', label: '60-Day Avg Put IV', category: 'Historical' },
    { value: 'avg_90day_put_iv', label: '90-Day Avg Put IV', category: 'Historical' },
    
    // Intraday IV Fields
    { value: 'yesterday_close_call_iv', label: 'Yesterday Close Call IV', category: 'Intraday' },
    { value: 'today_930_call_iv', label: 'Today 9:30 Call IV', category: 'Intraday' },
    { value: 'yesterday_close_put_iv', label: 'Yesterday Close Put IV', category: 'Intraday' },
    { value: 'today_930_put_iv', label: 'Today 9:30 Put IV', category: 'Intraday' },
    
    // Greeks Fields
    { value: 'call_delta', label: 'Call Delta', category: 'Greeks' },
    { value: 'put_delta', label: 'Put Delta', category: 'Greeks' },
    { value: 'call_gamma', label: 'Call Gamma', category: 'Greeks' },
    { value: 'put_gamma', label: 'Put Gamma', category: 'Greeks' },
    { value: 'call_theta', label: 'Call Theta', category: 'Greeks' },
    { value: 'put_theta', label: 'Put Theta', category: 'Greeks' },
    { value: 'call_vega', label: 'Call Vega', category: 'Greeks' },
    { value: 'put_vega', label: 'Put Vega', category: 'Greeks' },
    
    // Volume & OI Fields
    { value: 'call_volume', label: 'Call Volume', category: 'Volume' },
    { value: 'put_volume', label: 'Put Volume', category: 'Volume' },
    { value: 'total_volume', label: 'Total Volume', category: 'Volume' },
    { value: 'call_oi', label: 'Call Open Interest', category: 'Volume' },
    { value: 'put_oi', label: 'Put Open Interest', category: 'Volume' },
    { value: 'total_oi', label: 'Total Open Interest', category: 'Volume' },
    
    // Price & Strike Fields
    { value: 'strike_price', label: 'Strike Price', category: 'Price' },
    { value: 'call_ltp', label: 'Call LTP', category: 'Price' },
    { value: 'put_ltp', label: 'Put LTP', category: 'Price' },
    { value: 'underlying_price', label: 'Underlying Price', category: 'Price' },
    
    // Statistical Fields
    { value: 'similar_results_avg_iv', label: 'Similar Results Avg IV', category: 'Statistical' },
    { value: 'iv_percentile', label: 'IV Percentile', category: 'Statistical' },
    { value: 'iv_rank', label: 'IV Rank', category: 'Statistical' }
  ];

  const operators = [
    { value: 'gt', label: '> Greater Than', category: 'Comparison' },
    { value: 'lt', label: '< Less Than', category: 'Comparison' },
    { value: 'gte', label: '>= Greater Than or Equal', category: 'Comparison' },
    { value: 'lte', label: '<= Less Than or Equal', category: 'Comparison' },
    { value: 'eq', label: '= Equals', category: 'Equality' },
    { value: 'ne', label: '≠ Not Equals', category: 'Equality' },
    { value: 'pct_gt', label: '% Change Greater Than', category: 'Percentage' },
    { value: 'pct_lt', label: '% Change Less Than', category: 'Percentage' }
  ];

  const addCondition = () => {
    setConditions([...conditions, {
      field1: 'current_call_iv',
      operator: 'gt',
      field2: 'avg_21day_call_iv',
      value: undefined
    }]);
  };

  const updateCondition = (index: number, updates: Partial<QueryCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const executeQuery = async () => {
    if (conditions.length === 0) {
      setError('Please add at least one condition');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Executing query with conditions:', conditions);
      
      // Convert conditions to SimpleQueryCondition format for API
      const apiConditions: SimpleQueryCondition[] = conditions.map(condition => ({
        field1: condition.field1,
        operator: condition.operator,
        field2: condition.field2,
        value: condition.value,
        percentageThreshold: condition.percentageThreshold
      }));
      
      // Call the real backend API
      const response = await queryAPI.executeSimpleQuery(apiConditions);
      
      console.log('✅ Query executed successfully:', response);
      
      // Set the results and debug info from backend response
      setResults(response.results);
      setDebugInfo(response.debugInfo);
      
    } catch (err: any) {
      console.error('❌ Query execution failed:', err);
      
      // Show user-friendly error message
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Network Error')) {
        setError('❌ Backend server is not running. Please start the backend server first.');
      } else if (errorMessage.includes('CORS')) {
        setError('❌ CORS error. Backend CORS configuration may need updating.');
      } else {
        setError(`❌ Query failed: ${errorMessage}`);
      }
      
      // Clear previous results on error
      setResults([]);
      setDebugInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const clearQuery = () => {
    setConditions([]);
    setResults([]);
    setError(null);
    setDebugInfo(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <TrendingUpIcon sx={{ mr: 2, color: '#667eea' }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: '#2d3748' }}>
            NSE Options Query Builder
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Professional IV Analysis Platform
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, pb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2d3748' }}>
                Query Builder
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                    Query Conditions
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={addCondition}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Condition
                  </Button>
                </Box>

                {conditions.length === 0 ? (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    border: '2px dashed #e2e8f0', 
                    borderRadius: 2, 
                    bgcolor: '#f8fafc' 
                  }}>
                    <Typography color="textSecondary">
                      Click "Add Condition" to start building your query
                    </Typography>
                  </Box>
                ) : (
                  conditions.map((condition, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2, bgcolor: '#fafbfc' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
                          <MenuFieldSelector
                            label="Field 1"
                            value={condition.field1}
                            options={ivFields}
                            onChange={(value) => updateCondition(index, { field1: value })}
                            width={280}
                          />

                          <MenuFieldSelector
                            label="Operator"
                            value={condition.operator}
                            options={operators}
                            onChange={(value) => updateCondition(index, { operator: value })}
                            width={200}
                          />

                          {['pct_gt', 'pct_lt'].includes(condition.operator) ? (
                            <TextField
                              size="small"
                              label="% Threshold"
                              type="number"
                              value={condition.percentageThreshold || ''}
                              onChange={(e) => updateCondition(index, { percentageThreshold: parseFloat(e.target.value) })}
                              sx={{ minWidth: 120 }}
                              InputProps={{ endAdornment: '%' }}
                              placeholder="15"
                            />
                          ) : (
                            <MenuFieldSelector
                              label="Field 2 / Value"
                              value={condition.field2 || ''}
                              options={ivFields}
                              onChange={(value) => updateCondition(index, { field2: value })}
                              width={280}
                              showCustomOption={true}
                            />
                          )}

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => removeCondition(index)}
                            sx={{ 
                              borderRadius: 2,
                              minHeight: 48,
                              alignSelf: 'flex-start',
                              mt: 0.5
                            }}
                          >
                            Remove
                          </Button>
                        </Box>

                        {/* Second Row - Custom Value (if Field 2 not selected) */}
                        {!condition.field2 && !['pct_gt', 'pct_lt'].includes(condition.operator) && (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              size="small"
                              label="Custom Value"
                              type="number"
                              value={condition.value || ''}
                              onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) })}
                              sx={{ minWidth: 150 }}
                              placeholder="e.g., 0.25 for 25% IV"
                            />
                          </Box>
                        )}

                        {/* Condition Preview */}
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(103, 126, 234, 0.1)', borderRadius: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Query Preview: {ivFields.find(f => f.value === condition.field1)?.label} {operators.find(o => o.value === condition.operator)?.label} {
                              ['pct_gt', 'pct_lt'].includes(condition.operator) 
                                ? `${condition.percentageThreshold || 0}%`
                                : condition.field2 
                                  ? ivFields.find(f => f.value === condition.field2)?.label
                                  : condition.value || 'custom value'
                            }
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={executeQuery}
                  disabled={loading || conditions.length === 0}
                  sx={{ 
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a6fd8' },
                    borderRadius: 2,
                  }}
                >
                  {loading ? 'Executing...' : 'Execute Query'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearQuery}
                  sx={{ borderRadius: 2 }}
                >
                  Clear
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', minHeight: 600 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Query Results & Debug Info
              </Typography>

              {results.length === 0 && !debugInfo ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: 300, 
                  border: '2px dashed #e2e8f0', 
                  borderRadius: 2, 
                  bgcolor: '#f8fafc' 
                }}>
                  <Typography color="textSecondary">
                    Execute a query to see results and debug information
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                  >
                    <Tab 
                      icon={<VisibilityIcon />} 
                      label="Results" 
                      sx={{ minHeight: 48 }}
                    />
                    <Tab 
                      icon={<Badge badgeContent={debugInfo?.appliedFilters.length || 0} color="primary"><BugReportIcon /></Badge>} 
                      label="Debug Info" 
                      sx={{ minHeight: 48 }}
                    />
                  </Tabs>
                  
                  {activeTab === 0 && (
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#667eea', color: 'white' }}>Symbol</TableCell>
                            <TableCell sx={{ bgcolor: '#667eea', color: 'white' }}>Sector</TableCell>
                            <TableCell align="right" sx={{ bgcolor: '#667eea', color: 'white' }}>Field 1 Value</TableCell>
                            <TableCell align="right" sx={{ bgcolor: '#667eea', color: 'white' }}>Field 2 Value</TableCell>
                            <TableCell align="right" sx={{ bgcolor: '#667eea', color: 'white' }}>% Change</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.map((row, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.symbol}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={row.sector} 
                                  size="small" 
                                  color={row.sector === 'NIFTY' ? 'primary' : 'secondary'} 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.field1Value?.toFixed(4) || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.field1Label || 'Field 1'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.field2Value?.toFixed(4) || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.field2Label || 'Field 2'}
                                </Typography>
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
                  )}
                  
                  {activeTab === 1 && debugInfo && (
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: '300px' }}>
                          <Card variant="outlined">
                            <CardHeader
                              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><CodeIcon /></Avatar>}
                              title="Query Structure"
                              titleTypographyProps={{ variant: 'h6' }}
                            />
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Backend Query Object
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto', maxHeight: 200 }}>
                                <Typography component="pre" variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                  {JSON.stringify(debugInfo.queryObject, null, 2)}
                                </Typography>
                              </Paper>
                            </CardContent>
                          </Card>
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: '300px' }}>
                          <Card variant="outlined">
                            <CardHeader
                              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><StorageIcon /></Avatar>}
                              title="Generated SQL"
                              titleTypographyProps={{ variant: 'h6' }}
                            />
                            <CardContent>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Database Query
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto', maxHeight: 200 }}>
                                <Typography component="pre" variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                  {debugInfo.sqlQuery}
                                </Typography>
                              </Paper>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SimpleQueryBuilder;