import { Component } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export class ErrorBoundary extends Component {
  state = { error: null, info: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 480, width: '100%', p: 5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>Something went wrong</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </Typography>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Reload Application
          </Button>
        </Paper>
      </Box>
    );
  }
}
