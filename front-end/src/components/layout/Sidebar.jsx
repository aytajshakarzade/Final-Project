import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Typography, Divider, IconButton, Avatar,
} from '@mui/material';
import DashboardIcon        from '@mui/icons-material/Dashboard';
import WorkIcon             from '@mui/icons-material/Work';
import PeopleIcon           from '@mui/icons-material/People';
import BusinessIcon         from '@mui/icons-material/Business';
import BarChartIcon         from '@mui/icons-material/BarChart';
import SettingsIcon         from '@mui/icons-material/Settings';
import VideoCallIcon        from '@mui/icons-material/VideoCall';
import AssignmentIcon       from '@mui/icons-material/Assignment';
import SummarizeIcon        from '@mui/icons-material/Summarize';
import PersonIcon           from '@mui/icons-material/Person';
import ListAltIcon          from '@mui/icons-material/ListAlt';
import ChevronLeftIcon      from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon     from '@mui/icons-material/ChevronRight';
import LogoutIcon           from '@mui/icons-material/Logout';
import { useAuth }          from '../../hooks/useAuth';
import { ROUTES }           from '../../constants/routes';
import { getInitials }      from '../../utils/formatters';
import { STORAGE_KEYS }     from '../../constants/storageKeys';

const SIDEBAR_W   = 256;
const COLLAPSED_W = 68;

const RECRUITER_NAV = [
  { label: 'Dashboard',   icon: DashboardIcon, path: ROUTES.RECRUITER_DASHBOARD },
  { label: 'Jobs',        icon: WorkIcon,       path: ROUTES.RECRUITER_JOBS },
  { label: 'Candidates',  icon: PeopleIcon,     path: ROUTES.RECRUITER_CANDIDATES },
  { label: 'Companies',   icon: BusinessIcon,   path: ROUTES.RECRUITER_COMPANIES },
  { label: 'Interviews',  icon: ListAltIcon,    path: ROUTES.RECRUITER_INTERVIEWS },
  { label: 'Analytics',   icon: BarChartIcon,   path: ROUTES.RECRUITER_ANALYTICS },
  { label: 'Settings',    icon: SettingsIcon,   path: ROUTES.RECRUITER_SETTINGS },
];

const CANDIDATE_NAV = [
  { label: 'Interviews',  icon: VideoCallIcon,  path: ROUTES.CANDIDATE_INTERVIEWS },
  { label: 'My Results',  icon: AssignmentIcon, path: ROUTES.CANDIDATE_RESULTS },
  { label: 'Reports',     icon: SummarizeIcon,  path: ROUTES.CANDIDATE_REPORTS },
  { label: 'Profile',     icon: PersonIcon,     path: ROUTES.CANDIDATE_PROFILE },
  { label: 'Settings',    icon: SettingsIcon,   path: ROUTES.CANDIDATE_SETTINGS },
];

function WaveDecor() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, height: 18 }}>
      {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8].map((h, i) => (
        <Box
          key={i}
          sx={{
            width: 3, height: `${h * 100}%`,
            bgcolor: 'rgba(167,139,250,0.8)',
            borderRadius: 1,
            animation: `waveBar ${0.55 + i * 0.08}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </Box>
  );
}

function NavItem({ item, collapsed, active }) {
  const navigate = useNavigate();
  const Icon = item.icon;

  const btn = (
    <ListItemButton
      onClick={() => navigate(item.path)}
      sx={{
        borderRadius: 2, mx: 1, px: 1.5, py: 1, minHeight: 44,
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        bgcolor: active ? 'rgba(99,102,241,0.45)' : 'transparent',
        '&:hover': {
          bgcolor: active ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)',
          color: '#fff',
        },
        transition: 'all 150ms ease',
      }}
    >
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
        />
      )}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      {collapsed ? <Tooltip title={item.label} placement="right">{btn}</Tooltip> : btn}
    </ListItem>
  );
}

export default function Sidebar({ open, onClose, variant = 'permanent' }) {
  const { user, logout, isRecruiter } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(collapsed)); }
    catch {}
  }, [collapsed]);

  const navItems = isRecruiter ? RECRUITER_NAV : CANDIDATE_NAV;
  const width    = collapsed ? COLLAPSED_W : SIDEBAR_W;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const inner = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1e1b4b', width, transition: 'width 240ms ease', overflow: 'hidden' }}>

      {/* Brand */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Box>
            <Typography sx={{ color: '#fff', fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
              Silent<Box component="span" sx={{ color: '#a78bfa' }}>Interview</Box>
            </Typography>
            <WaveDecor />
          </Box>
        )}
        {collapsed && (
          <Typography sx={{ color: '#a78bfa', fontFamily: '"Plus Jakarta Sans"', fontWeight: 800, fontSize: '1.15rem' }}>SI</Typography>
        )}
        <IconButton size="small" onClick={() => setCollapsed(c => !c)}
          sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Role badge */}
      {!collapsed && (
        <Box sx={{ mx: 2, mb: 1.5, px: 1.5, py: 0.75, bgcolor: 'rgba(99,102,241,0.2)', borderRadius: 2, border: '1px solid rgba(99,102,241,0.3)' }}>
          <Typography sx={{ color: '#a78bfa', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isRecruiter ? '⚡ Recruiter Hub' : '🎯 Candidate Portal'}
          </Typography>
        </Box>
      )}

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List dense disablePadding>
          {navItems.map(item => (
            <NavItem key={item.path} item={item} collapsed={collapsed} active={isActive(item.path)} />
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Profile footer */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2, px: 1.5, py: 1,
            color: 'rgba(255,255,255,0.5)',
            justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.15)', color: '#f87171' },
          }}
        >
          {collapsed ? (
            <Tooltip title="Sign out" placement="right">
              <LogoutIcon sx={{ fontSize: 20 }} />
            </Tooltip>
          ) : (
            <>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', fontSize: '0.72rem', fontWeight: 700, mr: 1.5, flexShrink: 0 }}>
                {getInitials(user?.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.2 }} noWrap>{user?.name}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }} noWrap>{user?.email}</Typography>
              </Box>
              <LogoutIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </>
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer open={open} onClose={onClose} variant="temporary"
        sx={{ '& .MuiDrawer-paper': { border: 'none', width: SIDEBAR_W } }}>
        {inner}
      </Drawer>
    );
  }

  return (
    <Drawer variant="permanent"
      sx={{ width, flexShrink: 0, transition: 'width 240ms ease',
        '& .MuiDrawer-paper': { width, border: 'none', overflow: 'hidden', transition: 'width 240ms ease' } }}>
      {inner}
    </Drawer>
  );
}
