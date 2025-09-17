import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface SQLDisplayProps {
  sql: string;
}

const SQLDisplay: React.FC<SQLDisplayProps> = ({ sql }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Generated SQL
      </Typography>
      <Paper
        sx={{
          p: 2,
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: 200,
        }}
      >
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {sql}
        </pre>
      </Paper>
    </Box>
  );
};

export default SQLDisplay;