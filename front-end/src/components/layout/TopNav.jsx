import { useState } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Typography, Avatar, Chip,
  Menu, MenuItem, ListItemIcon, Badge, Tooltip, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon              from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LightModeIcon         from '@mui/icons-material/LightMode';
import DarkModeIcon          from '@mui/icons-material/DarkMode';
import LogoutIcon            from '@mui/icons-material/Logout';
import PersonIcon            from '@mui/icons-material/Person';
import SettingsIcon          from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth }           from '../../hooks/useAuth';
import { ROUTES }            from '../../constants/routes';
import { getInitials }       from '../../utils/formatters';

// ─── Exact path → title map ───────────────────────────────────────────────────
const EXACT = {
  [ROUTES.RECRUITER_DASHBOARD]:  'Dashboard',
  [ROUTES.RECRUITER_JOBS]:       'Jobs',
  [ROUTES.RECRUITER_CANDIDATES]: 'Candidates',
  [ROUTES.RECRUITER_COMPANIES]:  'Companies',
  [ROUTES.RECRUITER_INTERVIEWS]: 'All Interviews',
  [ROUTES.RECRUITER_ANALYTICS]:  'Analytics',
  [ROUTES.RECRUITER_SETTINGS]:   'Settings',
  [ROUTES.RECRUITER_PROFILE]:    'My Profile',
  [ROUTES.CANDIDATE_INTERVIEWS]: 'Available Interviews',
  [ROUTES.CANDIDATE_RESULTS]:    'My Results',
  [ROUTES.CANDIDATE_REPORTS]:    'Reports',
  [ROUTES.CANDIDATE_PROFILE]:    'My Profile',
  [ROUTES.CANDIDATE_SETTINGS]:   'Settings',
  [ROUTES.CANDIDATE_DASHBOARD]:  'Dashboard',
};

// ─── Prefix-based matching ────────────────────────────────────────────────────
const PREFIX = [
  ['/candidate/interviews/', 'Live Interview'],
];

function getTitle(pathname) {
  if (EXACT[pathname]) return EXACT[pathname];
  for (const [prefix, title] of PREFIX) {
    if (pathname.startsWith(prefix)) return title;
  }
  return 'SilentInterview';
}

export default function TopNav({ onMenuToggle, colorMode, toggleColorMode }) {
  const { user, logout, isRecruiter } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const muiTheme   = useTheme();
  const isMobile   = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchor, setAnchor] = useState(null);

  const title       = getTitle(location.pathname);
  const profilePath = isRecruiter ? ROUTES.RECRUITER_PROFILE  : ROUTES.CANDIDATE_PROFILE;
  const settingsPath= isRecruiter ? ROUTES.RECRUITER_SETTINGS : ROUTES.CANDIDATE_SETTINGS;

  const handleLogout = async () => {
    setAnchor(null);
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <AppBar position="sticky" elevation={0}
      sx={{ right: 0, left: 0, bgcolor: 'background.paper', borderBottom: '1px solid',
            borderColor: 'divider', color: 'text.primary', zIndex: t => t.zIndex.drawer - 1 }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        {isMobile && <IconButton onClick={onMenuToggle} size="small"><MenuIcon /></IconButton>}
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1, fontSize: '0.95rem' }}>{title}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleColorMode} size="small">
              {colorMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge badgeContent={0} color="error"><NotificationsNoneIcon fontSize="small" /></Badge>
            </IconButton>
          </Tooltip>
          <Chip
            avatar={<Avatar sx={{ bgcolor: '#4f46e5 !important', fontSize: '0.68rem', fontWeight: 700 }}>{getInitials(user?.name)}</Avatar>}
            label={user?.name?.split(' ')[0] ?? 'Account'}
            onClick={e => setAnchor(e.currentTarget)}
            sx={{ ml: 0.5, bgcolor: 'action.hover', cursor: 'pointer', fontWeight: 500, '&:hover': { bgcolor: 'action.selected' } }}
          />
        </Box>
      </Toolbar>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ elevation: 3, sx: { mt: 0.5, minWidth: 210, borderRadius: 2 } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={700} fontSize="0.9rem">{user?.name}</Typography>
          <Typography color="text.secondary" fontSize="0.75rem">{user?.email}</Typography>
          <Chip label={user?.role ?? 'User'} size="small" color="primary" variant="outlined"
            sx={{ mt: 0.75, height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); navigate(profilePath); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>My Profile
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); navigate(settingsPath); }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
