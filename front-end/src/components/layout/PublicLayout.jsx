import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

/** Minimal layout for public pages — no sidebar or top nav. */
export default function PublicLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Outlet />
    </Box>
  );
}
