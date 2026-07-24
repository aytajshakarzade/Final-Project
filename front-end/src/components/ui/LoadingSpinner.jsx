import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ message = 'Loading…', fullPage = false }) {
  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={40} thickness={3} />
      {message && <Typography color="text.secondary" variant="body2">{message}</Typography>}
    </Box>
  );

  if (fullPage) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        {content}
      </Box>
    );
  }

  return content;
}
