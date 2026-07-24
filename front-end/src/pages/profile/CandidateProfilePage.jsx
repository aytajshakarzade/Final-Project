import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Stack, TextField,
  Button, Chip, Alert, CircularProgress, Divider, Grid, Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import CodeIcon from '@mui/icons-material/Code';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { getInitials } from '../../utils/formatters';
import ScoreRing from '../../components/ui/ScoreRing';
import { interviewService } from '../../services/interviewService';

function InfoCard({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex' }}>
            <Icon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { profile, loading, ensureProfile, updateProfile } = useCandidateProfile();
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [reports, setReports]   = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { skills: '', education: '', experience: '', resumeUrl: '' },
  });

  // Load reports for score summary
  useEffect(() => {
    interviewService.reports.getAll()
      .then(d => setReports(Array.isArray(d) ? d : (d?.items ?? [])))
      .catch(() => {});
  }, []);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        skills: profile.skills ?? '',
        education: profile.education ?? '',
        experience: profile.experience ?? '',
        resumeUrl: profile.resumeUrl ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!profile) {
        await ensureProfile(data);
        toast.success('Profile created!');
      } else {
        await updateProfile(data);
        toast.success('Profile updated!');
      }
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const avgScore = reports.length
    ? Math.round(reports.reduce((s, r) => s + (r.score ?? 0), 0) / reports.length)
    : null;

  const bestScore = reports.length
    ? Math.max(...reports.map(r => r.score ?? 0))
    : null;

  const skillList = (profile?.skills ?? '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Profile</Typography>
        <Typography color="text.secondary" variant="body2">Manage your candidate profile</Typography>
      </Box>

      {/* Header card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>
              {getInitials(user?.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Chip label="Candidate" size="small" color="secondary" variant="outlined" sx={{ mt: 1, fontSize: '0.7rem' }} />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <ScoreRing score={avgScore} size={60} strokeWidth={5} label="Avg Score" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <ScoreRing score={bestScore} size={60} strokeWidth={5} label="Best Score" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800}>{reports.length}</Typography>
                <Typography variant="caption" color="text.secondary">Interviews</Typography>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Skills display */}
      {!editing && profile && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <InfoCard icon={CodeIcon} title="Skills">
              {skillList.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {skillList.map(s => (
                    <Chip key={s} label={s} size="small" color="primary" variant="outlined"
                      sx={{ fontSize: '0.75rem' }} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.disabled">No skills added yet</Typography>
              )}
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard icon={SchoolIcon} title="Education">
              <Typography variant="body2" color={profile.education ? 'text.primary' : 'text.disabled'}>
                {profile.education || 'Not specified'}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard icon={WorkHistoryIcon} title="Experience">
              <Typography variant="body2" color={profile.experience ? 'text.primary' : 'text.disabled'}>
                {profile.experience || 'Not specified'}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Edit form */}
      {(editing || !profile) && !loading && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
              {profile ? 'Edit Profile' : 'Create Your Profile'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <TextField
                  label="Skills (comma-separated)"
                  fullWidth
                  placeholder="React, TypeScript, Node.js, SQL…"
                  helperText="List your key skills separated by commas"
                  {...register('skills')}
                />
                <TextField
                  label="Education"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="B.Sc. Computer Science, University of…"
                  {...register('education')}
                />
                <TextField
                  label="Work experience"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="3 years as Frontend Developer at…"
                  {...register('experience')}
                />
                <TextField
                  label="Resume URL (optional)"
                  fullWidth
                  placeholder="https://drive.google.com/…"
                  {...register('resumeUrl')}
                />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {profile && (
                    <Button variant="outlined" onClick={() => { reset(); setEditing(false); }} disabled={saving}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" variant="contained" disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
                    {saving ? 'Saving…' : profile ? 'Save changes' : 'Create profile'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
