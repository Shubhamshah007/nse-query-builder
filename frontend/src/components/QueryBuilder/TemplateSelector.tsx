import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { QueryTemplate } from '../../types/query.types';

interface TemplateSelectorProps {
  templates: QueryTemplate[];
  onLoadTemplate: (template: QueryTemplate) => void;
  onSaveTemplate: (name: string, description: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  templates, 
  onLoadTemplate, 
  onSaveTemplate 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
        Query Templates
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {templates.map((template) => (
          <Chip
            key={template.id}
            label={template.name}
            variant="outlined"
            clickable
            onClick={() => onLoadTemplate(template)}
            sx={{ 
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(103, 126, 234, 0.1)' }
            }}
          />
        ))}
        
        {templates.length === 0 && (
          <Typography color="textSecondary" variant="body2">
            Loading templates...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TemplateSelector;