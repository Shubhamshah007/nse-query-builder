import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { DynamicQuery, QueryFilter, FilterType } from '../../types/query.types';

interface FilterPanelProps {
  query: DynamicQuery;
  onChange: (query: DynamicQuery) => void;
  availableSectors: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ query, onChange, availableSectors }) => {
  const [newFilter, setNewFilter] = useState<Partial<QueryFilter>>({
    type: FilterType.SECTOR,
  });

  const filterTypeOptions = [
    { value: FilterType.SECTOR, label: 'Sector' },
    { value: FilterType.EXPIRY_RANGE, label: 'Expiry Range' },
    { value: FilterType.STRIKE_RANGE, label: 'Strike Range' },
    { value: FilterType.VOLUME_RANGE, label: 'Volume Range' },
    { value: FilterType.OI_RANGE, label: 'Open Interest Range' },
  ];


  const handleRemoveFilter = (index: number) => {
    const updatedQuery = {
      ...query,
      groups: query.groups.map((group, groupIndex) => 
        groupIndex === 0 
          ? { ...group, filters: group.filters.filter((_, i) => i !== index) }
          : group
      )
    };
    onChange(updatedQuery);
  };

  const handleAddFilter = () => {
    if (newFilter.type && (newFilter.values?.length || newFilter.min !== undefined || newFilter.max !== undefined)) {
      const filter: QueryFilter = {
        type: newFilter.type,
        values: newFilter.values || [],
        min: newFilter.min,
        max: newFilter.max,
      };
      const updatedQuery = {
        ...query,
        groups: query.groups.map((group, index) => 
          index === 0 
            ? { ...group, filters: [...group.filters, filter] }
            : group
        )
      };
      onChange(updatedQuery);
      setNewFilter({ type: FilterType.SECTOR });
    }
  };
  const handleNewFilterChange = (field: keyof QueryFilter, value: any) => {
    setNewFilter({ ...newFilter, [field]: value });
  };

  const renderFilterValueInput = () => {
    switch (newFilter.type) {
      case FilterType.SECTOR:
        return (
          <Autocomplete
            multiple
            options={availableSectors}
            value={newFilter.values || []}
            onChange={(_, newValue) => handleNewFilterChange('values', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Sectors"
                placeholder="Choose sectors..."
              />
            )}
            sx={{ mt: 1 }}
          />
        );
      case FilterType.EXPIRY_RANGE:
      case FilterType.STRIKE_RANGE:
      case FilterType.VOLUME_RANGE:
      case FilterType.OI_RANGE:
        return (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              label="Min"
              type="number"
              value={newFilter.min || ''}
              onChange={(e) => handleNewFilterChange('min', parseFloat(e.target.value) || undefined)}
            />
            <TextField
              label="Max"
              type="number"
              value={newFilter.max || ''}
              onChange={(e) => handleNewFilterChange('max', parseFloat(e.target.value) || undefined)}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const renderFilterChip = (filter: QueryFilter, index: number) => {
    let label = '';
    switch (filter.type) {
      case FilterType.SECTOR:
        label = `Sectors: ${filter.values?.join(', ')}`;
        break;
      case FilterType.EXPIRY_RANGE:
        label = `Expiry: ${filter.min || '∞'} - ${filter.max || '∞'} days`;
        break;
      case FilterType.STRIKE_RANGE:
        label = `Strike: ${filter.min || '∞'} - ${filter.max || '∞'}`;
        break;
      case FilterType.VOLUME_RANGE:
        label = `Volume: ${filter.min || '∞'} - ${filter.max || '∞'}`;
        break;
      case FilterType.OI_RANGE:
        label = `OI: ${filter.min || '∞'} - ${filter.max || '∞'}`;
        break;
    }

    return (
      <Chip
        key={index}
        label={label}
        onDelete={() => handleRemoveFilter(index)}
        variant="outlined"
        color="primary"
        sx={{ mr: 1, mb: 1 }}
      />
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
        Filters
      </Typography>
      
      {/* Active Filters */}
      {query.groups[0]?.filters && query.groups[0].filters.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Active Filters
          </Typography>
          <Box>
            {query.groups[0].filters.map((filter, index) => renderFilterChip(filter, index))}
          </Box>
        </Box>
      )}

      {/* Add New Filter */}
      <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Add Filter
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 1 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={newFilter.type || ''}
            label="Filter Type"
            onChange={(e) => handleNewFilterChange('type', e.target.value as FilterType)}
          >
            {filterTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderFilterValueInput()}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddFilter}
          disabled={!newFilter.type || (!newFilter.values?.length && newFilter.min === undefined && newFilter.max === undefined)}
          sx={{ mt: 2 }}
        >
          Add Filter
        </Button>
      </Box>
    </Box>
  );
};

export default FilterPanel;
