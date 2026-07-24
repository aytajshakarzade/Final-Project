import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Button, TextField, Typography, Alert, InputAdornment, IconButton,
  Checkbox, FormControlLabel, Divider, Paper, Stack, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../hooks/useAuth';
import { getRoleBase, ROUTES } from '../constants/routes';

// ─── Animated brand illustration ─────────────────────────────────────────────
function BrandPanel() {
  return (
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <Box sx={{ position: 'absolute', top: '20%', left: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '20%', right: '20%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Waveform illustration */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}>
        {[0.3, 0.6, 1, 0.8, 0.5, 0.9, 0.4, 0.7, 1, 0.6, 0.3].map((h, i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: `${h * 80}px`,
              background: `rgba(167,139,250,${0.4 + h * 0.5})`,
              borderRadius: 1,
              animation: `waveBar ${0.6 + i * 0.08}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </Box>

      <Typography
        variant="h3"
        sx={{ color: '#fff', fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, textAlign: 'center', lineHeight: 1.2, mb: 2 }}
      >
        Smarter hiring,<br />
        <Box component="span" sx={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          built for clarity.
        </Box>
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 380, lineHeight: 1.7, mb: 5 }}>
        AI-powered interviews that let candidates show their best, and help recruiters make confident decisions.
      </Typography>

      {/* Feature chips */}
      {[
        ['⚡', 'Role-based access'],
        ['🎯', 'AI-scored interviews'],
        ['📊', 'Real-time analytics'],
      ].map(([icon, label]) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 2.5, py: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 340 }}>
          <Typography sx={{ fontSize: '1rem' }}>{icon}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Main login form ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      // ✅ AUTH BUG FIX:
      // After login, we receive the user object with role, and IMMEDIATELY
      // navigate to the role-appropriate dashboard using React Router.
      // The old monolithic engine never called navigate() — it relied on
      // internal state.view which only worked if the component re-rendered
      // with the right role check.
      const user = await login({ email: data.email, password: data.password });
      const destination = from || getRoleBase(user?.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'recruiter') {
      setValue('email', 'recruiter@demo.com');
      setValue('password', 'Demo1234!');
    } else {
      setValue('email', 'candidate@demo.com');
      setValue('password', 'Demo1234!');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <BrandPanel />

      {/* Form panel */}
      <Box
        sx={{
          width: { xs: '100%', lg: 480 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          py: 6,
          bgcolor: 'background.paper',
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, mb: 0.5 }}
          >
            Silent<Box component="span" sx={{ color: 'primary.main' }}>Interview</Box>
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Sign in to your workspace
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
              }}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', { required: 'Password is required' })}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="caption">Remember me</Typography>}
              />
              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in to Dashboard'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.disabled">or</Typography>
        </Divider>

        {/* Demo accounts */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
            Quick demo access
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => fillDemo('recruiter')}
              sx={{ fontSize: '0.75rem' }}
            >
              ⚡ Recruiter demo
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => fillDemo('candidate')}
              sx={{ fontSize: '0.75rem' }}
            >
              🎯 Candidate demo
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Don't have an account?{' '}
          <RouterLink to={ROUTES.REGISTER} style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Create account
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  );
}
