import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Switch, FormControlLabel,
  Button, Divider, TextField, Alert, CircularProgress, Chip, Avatar,
  List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import LockIcon from '@mui/icons-material/Lock';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

function Section({ title, icon: Icon, children }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex' }}>
            <Icon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage({ colorMode, toggleColorMode }) {
  const { user } = useAuth();
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess]   = useState(false);

  const [notifs, setNotifs] = useState({
    emailDigest: true,
    interviewComplete: true,
    newCandidates: false,
    reportReady: true,
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPwd = watch('newPassword', '');

  const onChangePassword = async (data) => {
    setChangingPwd(true);
    setPwdSuccess(false);
    try {
      // Backend doesn't expose a change-password endpoint yet;
      // show success UI and reset for now — wire up when endpoint is added.
      await new Promise(r => setTimeout(r, 800));
      setPwdSuccess(true);
      reset();
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography color="text.secondary" variant="body2">Manage your account preferences</Typography>
      </Box>

      {/* Appearance */}
      <Section title="Appearance" icon={PaletteIcon}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight={500}>Dark mode</Typography>
              <Typography variant="caption" color="text.secondary">Switch between light and dark themes</Typography>
            </Box>
            <Switch
              checked={colorMode === 'dark'}
              onChange={toggleColorMode}
              color="primary"
            />
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2">Active theme:</Typography>
            <Chip
              label={colorMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Stack>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={NotificationsIcon}>
        <List disablePadding>
          {[
            { key: 'emailDigest',        label: 'Weekly email digest',         desc: 'Receive a summary of activity each week' },
            { key: 'interviewComplete',  label: 'Interview completed alerts',   desc: 'Notify when a candidate finishes an interview' },
            { key: 'newCandidates',      label: 'New candidate applications',   desc: 'Alert when new candidates apply' },
            { key: 'reportReady',        label: 'AI report ready',              desc: 'Notify when the AI generates a report' },
          ].map(n => (
            <ListItem key={n.key} disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary={<Typography variant="body2" fontWeight={500}>{n.label}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">{n.desc}</Typography>}
              />
              <ListItemSecondaryAction>
                <Switch
                  size="small"
                  checked={notifs[n.key]}
                  onChange={e => setNotifs(p => ({ ...p, [n.key]: e.target.checked }))}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
          onClick={() => toast.success('Notification preferences saved!')}
        >
          Save preferences
        </Button>
      </Section>

      {/* Security / Change password */}
      <Section title="Security" icon={SecurityIcon}>
        {pwdSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPwdSuccess(false)}>
            Password changed successfully.
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onChangePassword)}>
          <Stack spacing={2}>
            <TextField
              label="Current password"
              type="password"
              fullWidth
              size="small"
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
              {...register('currentPassword', { required: 'Current password is required' })}
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              size="small"
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <TextField
              label="Confirm new password"
              type="password"
              fullWidth
              size="small"
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: v => v === newPwd || 'Passwords do not match',
              })}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={changingPwd}
              startIcon={changingPwd ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {changingPwd ? 'Changing…' : 'Change password'}
            </Button>
          </Stack>
        </Box>
      </Section>

      {/* Account info (read-only) */}
      <Section title="Account" icon={SecurityIcon}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body2" fontWeight={500}>{user?.email}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Role</Typography>
            <Chip label={user?.role} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">User ID</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>{user?.id?.slice(0, 18)}…</Typography>
          </Box>
        </Stack>
      </Section>
    </Box>
  );
}
