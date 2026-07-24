import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav  from './TopNav';

export default function AppLayout({ colorMode, toggleColorMode }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Permanent sidebar (desktop) */}
      {!isMobile && <Sidebar variant="permanent" />}

      {/* Temporary drawer (mobile) */}
      {isMobile && (
        <Sidebar variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopNav
          onMenuToggle={() => setMobileOpen(o => !o)}
          colorMode={colorMode}
          toggleColorMode={toggleColorMode}
        />
        <Box sx={{ flex: 1, overflow: 'auto', pt: '64px', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          <Box className="fade-in" sx={{ maxWidth: 1320, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
