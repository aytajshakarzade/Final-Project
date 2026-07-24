import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Button, TextField, Typography, Alert, InputAdornment, IconButton,
  LinearProgress, Stack, MenuItem, Select, FormControl, InputLabel,
  FormHelperText, CircularProgress, Divider, Paper,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, getRoleBase } from '../constants/routes';

// ─── Password strength calculator ────────────────────────────────────────────
function calcStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 20, label: 'Weak', color: 'error' };
  if (score === 2) return { score: 40, label: 'Fair', color: 'warning' };
  if (score === 3) return { score: 60, label: 'Good', color: 'info' };
  if (score === 4) return { score: 80, label: 'Strong', color: 'success' };
  return { score: 100, label: 'Excellent', color: 'success' };
}

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ─── Brand illustration ───────────────────────────────────────────────────────
function BrandPanel() {
  return (
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #4c1d95 60%, #1e1b4b 100%)',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: '15%', right: '15%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />

      <Typography
        variant="h3"
        sx={{ color: '#fff', fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, textAlign: 'center', lineHeight: 1.2, mb: 2 }}
      >
        Join teams hiring<br />
        <Box component="span" sx={{ background: 'linear-gradient(135deg, #c084fc, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          smarter every day.
        </Box>
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 360, lineHeight: 1.7, mb: 5 }}>
        Create your account to start conducting AI-powered interviews or practice for your next opportunity.
      </Typography>

      {[
        ['🎥', 'Recruiter', 'Build jobs, train AI, review ranked candidates'],
        ['🏆', 'Candidate', 'Practice interviews and receive instant AI feedback'],
      ].map(([icon, role, desc]) => (
        <Box key={role} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2, px: 3, py: 2, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 380 }}>
          <Typography sx={{ fontSize: '1.5rem', mt: 0.25 }}>{icon}</Typography>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{role}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.5 }}>{desc}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Main register form ───────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register: authRegister, login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'Candidate' },
  });

  const password = watch('password', '');
  const strength = calcStrength(password);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authRegister({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
      });
      // Auto-login after register
      const user = await login({ email: data.email, password: data.password });
      navigate(getRoleBase(user?.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <BrandPanel />

      {/* Form panel */}
      <Box
        sx={{
          width: { xs: '100%', lg: 520 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 6 },
          py: 6,
          overflowY: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, mb: 0.5 }}>
            Silent<Box component="span" sx={{ color: 'primary.main' }}>Interview</Box>
          </Typography>
          <Typography color="text.secondary" variant="body2">Create your account — takes 30 seconds</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField
              label="Full name"
              fullWidth
              autoComplete="name"
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
              {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
            />

            <TextField
              label="Email address"
              type="email"
              fullWidth
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })}
            />

            <FormControl fullWidth size="small" error={Boolean(errors.role)}>
              <InputLabel>I am a…</InputLabel>
              <Select label="I am a…" defaultValue="Candidate" {...register('role', { required: true })}>
                <MenuItem value="Candidate">🎯 Candidate — looking for a job</MenuItem>
                <MenuItem value="Recruiter">⚡ Recruiter — hiring for my company</MenuItem>
              </Select>
              {errors.role && <FormHelperText>Please select a role</FormHelperText>}
            </FormControl>

            <Box>
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="new-password"
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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />

              {/* Password strength meter */}
              {password && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">Password strength</Typography>
                    <Typography variant="caption" color={`${strength.color}.main`} fontWeight={600}>{strength.label}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    color={strength.color || 'primary'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                    {requirements.map((req) => {
                      const met = req.test(password);
                      return (
                        <Box key={req.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {met
                            ? <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
                            : <RadioButtonUncheckedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          }
                          <Typography variant="caption" color={met ? 'success.main' : 'text.disabled'} sx={{ fontSize: '0.68rem' }}>
                            {req.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            <TextField
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              autoComplete="new-password"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((s) => !s)} edge="end">
                      {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account & Enter'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <RouterLink to={ROUTES.LOGIN} style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Sign in
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  );
}
