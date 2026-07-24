import { Box, Button, Typography, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import BlockIcon from '@mui/icons-material/Block';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { getRoleBase } from '../../constants/routes';

function ErrorPage({ code, title, description, icon: Icon, iconColor }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 3,
          borderRadius: 4,
          bgcolor: `${iconColor}15`,
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 56, color: iconColor }} />
      </Box>

      <Typography
        variant="h1"
        sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: { xs: '4rem', sm: '6rem' }, lineHeight: 1, mb: 1, color: 'text.disabled' }}
      >
        {code}
      </Typography>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {title}
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 420, mb: 4, lineHeight: 1.7 }}>
        {description}
      </Typography>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate(isAuthenticated ? getRoleBase(user?.role) : ROUTES.LOGIN)}
        >
          {isAuthenticated ? 'Dashboard' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved. Check the URL or navigate back to your dashboard."
      icon={SearchOffIcon}
      iconColor="#6366f1"
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code="401"
      title="Authentication required"
      description="You need to sign in to access this page. Please log in with your account credentials."
      icon={LockIcon}
      iconColor="#f59e0b"
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      title="Access forbidden"
      description="You don't have permission to view this page. This area is restricted to specific roles."
      icon={BlockIcon}
      iconColor="#f43f5e"
    />
  );
}
