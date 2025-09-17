import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SimpleQueryBuilder from './components/SimpleQueryBuilder';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimpleQueryBuilder />
    </ThemeProvider>
  );
}

export default App;
