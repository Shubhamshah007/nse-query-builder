import React from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import {
  DynamicQuery,
  QueryCondition,
  IVField,
  ComparisonOperator,
  LogicalOperator,
  IV_FIELD_LABELS,
  OPERATOR_LABELS,
} from '../../types/query.types';

interface ConditionBuilderProps {
  query: DynamicQuery;
  onChange: (query: DynamicQuery) => void;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ query, onChange }) => {
  const addCondition = () => {
    const newCondition: QueryCondition = {
      field1: IVField.CURRENT_CALL_IV,
      operator: ComparisonOperator.GREATER_THAN,
      field2: IVField.SIMILAR_RESULTS_AVG_IV,
    };

    const updatedQuery = { ...query };
    updatedQuery.groups[0].conditions.push(newCondition);
    onChange(updatedQuery);
  };

  const removeCondition = (index: number) => {
    const updatedQuery = { ...query };
    updatedQuery.groups[0].conditions.splice(index, 1);
    onChange(updatedQuery);
  };

  const updateCondition = (index: number, updates: Partial<QueryCondition>) => {
    const updatedQuery = { ...query };
    updatedQuery.groups[0].conditions[index] = {
      ...updatedQuery.groups[0].conditions[index],
      ...updates,
    };
    onChange(updatedQuery);
  };

  const renderCondition = (condition: QueryCondition, index: number) => {
    const isPercentageOperator = 
      condition.operator === ComparisonOperator.PERCENTAGE_CHANGE_GT ||
      condition.operator === ComparisonOperator.PERCENTAGE_CHANGE_LT;

    return (
      <Card key={index} variant="outlined" sx={{ mb: 2, bgcolor: '#fafbfc' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CompareIcon color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Condition {index + 1}
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small" onClick={() => removeCondition(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {/* Field 1 */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Field 1</InputLabel>
              <Select
                value={condition.field1}
                label="Field 1"
                onChange={(e) => updateCondition(index, { field1: e.target.value as IVField })}
              >
                {Object.entries(IV_FIELD_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Operator */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Operator</InputLabel>
              <Select
                value={condition.operator}
                label="Operator"
                onChange={(e) => updateCondition(index, { operator: e.target.value as ComparisonOperator })}
              >
                {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Field 2 or Value */}
            {condition.operator !== ComparisonOperator.EQUALS && 
             condition.operator !== ComparisonOperator.NOT_EQUALS ? (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Field 2</InputLabel>
                <Select
                  value={condition.field2 || ''}
                  label="Field 2"
                  onChange={(e) => updateCondition(index, { field2: e.target.value as IVField })}
                >
                  {Object.entries(IV_FIELD_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                label="Value"
                type="number"
                value={condition.value || ''}
                onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) })}
                sx={{ minWidth: 120 }}
              />
            )}

            {/* Percentage Threshold */}
            {isPercentageOperator && (
              <TextField
                size="small"
                label="% Threshold"
                type="number"
                value={condition.percentageThreshold || ''}
                onChange={(e) => updateCondition(index, { percentageThreshold: parseFloat(e.target.value) })}
                sx={{ minWidth: 120 }}
                InputProps={{ endAdornment: '%' }}
              />
            )}
          </Box>

          {/* Condition Description */}
          <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(103, 126, 234, 0.1)', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {getConditionDescription(condition)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const getConditionDescription = (condition: QueryCondition): string => {
    const field1Label = IV_FIELD_LABELS[condition.field1];
    const operatorLabel = OPERATOR_LABELS[condition.operator];
    
    if (condition.field2) {
      const field2Label = IV_FIELD_LABELS[condition.field2];
      if (condition.percentageThreshold) {
        return `${field1Label} is ${condition.percentageThreshold}% ${operatorLabel.toLowerCase()} ${field2Label}`;
      }
      return `${field1Label} ${operatorLabel.toLowerCase()} ${field2Label}`;
    } else if (condition.value !== undefined) {
      return `${field1Label} ${operatorLabel.toLowerCase()} ${condition.value}`;
    }
    return `${field1Label} ${operatorLabel.toLowerCase()}`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
          IV Conditions
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          onClick={addCondition}
          sx={{ borderRadius: 2 }}
        >
          Add Condition
        </Button>
      </Box>

      {query.groups[0].conditions.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '2px dashed #e2e8f0',
            borderRadius: 2,
            bgcolor: '#f8fafc',
          }}
        >
          <Typography color="textSecondary">
            No conditions added yet. Click "Add Condition" to start building your query.
          </Typography>
        </Box>
      ) : (
        <>
          {query.groups[0].conditions.map((condition, index) => renderCondition(condition, index))}
          
          {query.groups[0].conditions.length > 1 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f9ff', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Logical Operator:</strong> All conditions will be joined with <strong>AND</strong>
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ConditionBuilder;