import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'alert' | 'box';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  variant = 'alert' 
}) => {
  if (variant === 'alert') {
    return (
      <Alert 
        severity="error" 
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        {message}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color="error.main" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;