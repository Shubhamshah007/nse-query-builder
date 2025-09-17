import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  RestoreFromTrash as ClearIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  DynamicQuery, 
  QueryExecutionResponse, 
  QueryTemplate,
  LogicalOperator,
} from '../../types/query.types';
import { queryAPI } from '../../services/api';
import ConditionBuilder from './ConditionBuilder';
import FilterPanel from './FilterPanel';
import TemplateSelector from './TemplateSelector';
import ResultsDisplay from '../Results/ResultsDisplay';
import SQLDisplay from './SQLDisplay';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.05)',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: '12px 12px 0 0',
  marginBottom: theme.spacing(2),
}));

const QueryBuilder: React.FC = () => {
  const [query, setQuery] = useState<DynamicQuery>({
    groups: [{
      conditions: [],
      filters: [],
      logicalOperator: LogicalOperator.AND,
    }],
    groupLogicalOperator: LogicalOperator.AND,
    limit: 50,
  });

  const [results, setResults] = useState<QueryExecutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [showSQL, setShowSQL] = useState(false);
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [templatesData, sectorsData] = await Promise.all([
        queryAPI.getTemplates(),
        queryAPI.getSchema().then(schema => schema.availableSectors || []),
      ]);
      setTemplates(templatesData);
      setSectors(sectorsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const executeQuery = async () => {
    if (query.groups[0].conditions.length === 0 && query.groups[0].filters.length === 0) {
      setError('Please add at least one condition or filter');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await queryAPI.execute(query);
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const clearQuery = () => {
    setQuery({
      groups: [{
        conditions: [],
        filters: [],
        logicalOperator: LogicalOperator.AND,
      }],
      groupLogicalOperator: LogicalOperator.AND,
      limit: 50,
    });
    setResults(null);
    setError(null);
  };

  const loadTemplate = (template: QueryTemplate) => {
    setQuery({ ...template.query });
    setResults(null);
    setError(null);
  };

  const saveTemplate = async (name: string, description: string) => {
    try {
      const template: QueryTemplate = {
        id: `custom_${Date.now()}`,
        name,
        description,
        query: { ...query },
        category: 'custom',
        tags: ['custom'],
      };
      
      // Note: Save template functionality would need to be implemented in the backend
      // await queryAPI.saveTemplate(template);
      setTemplates([...templates, template]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    }
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
          {/* Left Panel - Query Builder */}
          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <StyledPaper>
              <HeaderSection>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Build Dynamic Query
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Create sophisticated IV analysis queries with multiple conditions and filters
                </Typography>
              </HeaderSection>

              {/* Template Selector */}
              <TemplateSelector
                templates={templates}
                onLoadTemplate={loadTemplate}
                onSaveTemplate={saveTemplate}
              />

              {/* Condition Builder */}
              <ConditionBuilder
                query={query}
                onChange={setQuery}
              />

              {/* Filter Panel */}
              <FilterPanel
                query={query}
                onChange={setQuery}
                availableSectors={sectors}
              />

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                  onClick={executeQuery}
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a6fd8' },
                    borderRadius: 2,
                    px: 3,
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

                <Tooltip title="View Generated SQL">
                  <IconButton
                    onClick={() => setShowSQL(!showSQL)}
                    color={showSQL ? 'primary' : 'default'}
                    sx={{ ml: 'auto' }}
                  >
                    <CodeIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* SQL Display */}
              {showSQL && results && (
                <SQLDisplay sql={results.generatedSQL} />
              )}
            </StyledPaper>
          </Box>

          {/* Right Panel - Results */}
          <Box sx={{ flex: 1, minWidth: '400px' }}>
            <StyledPaper sx={{ minHeight: 600 }}>
              <HeaderSection>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Query Results
                    </Typography>
                    {results && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Chip 
                          label={`${results.totalCount} results`} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                        <Chip 
                          label={`${results.executionTime}ms`} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </HeaderSection>

              {/* Results Display */}
              <ResultsDisplay results={results} loading={loading} />
            </StyledPaper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default QueryBuilder;