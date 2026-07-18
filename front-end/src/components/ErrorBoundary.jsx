import { Component } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>SilentInterview could not load</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>{this.state.error.message}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>Reload</Button>
      </Box>
    );
  }
}
