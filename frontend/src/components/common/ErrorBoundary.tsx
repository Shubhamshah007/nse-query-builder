import React from 'react';
import { Alert, Box, Typography, Button } from '@mui/material';
import { BugReport as BugReportIcon } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Error UI
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8fafc',
            p: 3
          }}
        >
          <Box sx={{ maxWidth: 600, width: '100%' }}>
            <Alert
              severity="error"
              icon={<BugReportIcon />}
              sx={{
                mb: 3,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Something went wrong!
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The application encountered an unexpected error. This could be due to:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li>Network connectivity issues</li>
                <li>Backend server not responding</li>
                <li>Invalid data format from API</li>
                <li>Frontend rendering error</li>
              </ul>
            </Alert>

            {this.state.error && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Technical Details:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200,
                    fontFamily: 'monospace'
                  }}
                >
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' }
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;