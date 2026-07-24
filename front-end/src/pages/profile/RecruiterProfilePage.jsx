import { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Stack, TextField,
  Button, Chip, Alert, CircularProgress, Divider, Grid, MenuItem, Select,
  FormControl, InputLabel,
} from '@mui/material';
import EditIcon       from '@mui/icons-material/Edit';
import SaveIcon       from '@mui/icons-material/Save';
import BusinessIcon   from '@mui/icons-material/Business';
import { useForm }    from 'react-hook-form';
import toast          from 'react-hot-toast';
import { useAuth }    from '../../hooks/useAuth';
import { recruiterService } from '../../services/recruiterService';
import { companyService }   from '../../services/companyService';
import { getInitials }      from '../../utils/formatters';

export default function RecruiterProfilePage() {
  const { user }     = useAuth();
  const [recruiter, setRecruiter] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { companyId: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, comps] = await Promise.all([
        recruiterService.getAll(),
        companyService.getAll(),
      ]);
      const recList  = Array.isArray(recs)  ? recs  : recs?.items  ?? [];
      const compList = Array.isArray(comps) ? comps : comps?.items ?? [];
      setCompanies(compList);
      const mine = recList.find(r => r.userId === user?.id) ?? null;
      setRecruiter(mine);
      if (mine) reset({ companyId: mine.companyId ?? '' });
    } catch {}
    finally { setLoading(false); }
  }, [user?.id, reset]);

  useEffect(() => { load(); }, [load]);

  const myCompany = companies.find(c => c.id === recruiter?.companyId);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!recruiter) {
        const created = await recruiterService.create({ userId: user.id, companyId: data.companyId });
        setRecruiter(created);
        toast.success('Recruiter profile created!');
      } else {
        await recruiterService.update(recruiter.id, { companyId: data.companyId });
        setRecruiter(r => ({ ...r, companyId: data.companyId }));
        toast.success('Profile updated!');
      }
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Profile</Typography>
        <Typography color="text.secondary" variant="body2">Manage your recruiter account</Typography>
      </Box>

      {/* Identity card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>
              {getInitials(user?.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label="Recruiter" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                {myCompany && <Chip label={myCompany.name} size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Company link */}
      {!editing && !loading && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex' }}>
                <BusinessIcon sx={{ fontSize: 16, color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700}>Company Association</Typography>
            </Box>

            {myCompany ? (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600}>{myCompany.name}</Typography>
                <Typography variant="caption" color="text.secondary">{myCompany.industry}</Typography>
                {myCompany.website && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                    {myCompany.website}
                  </Typography>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                You are not linked to a company yet. Link your account to create jobs.
              </Alert>
            )}

            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ mt: 2 }}>
              {myCompany ? 'Change company' : 'Link company'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      {editing && !loading && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Link to Company
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select company *</InputLabel>
                  <Select label="Select company *" defaultValue={recruiter?.companyId ?? ''} {...register('companyId', { required: true })}>
                    {companies.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}{c.industry ? ` — ${c.industry}` : ''}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {companies.length === 0 && (
                  <Alert severity="warning">No companies found. Create a company first in the Companies section.</Alert>
                )}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button variant="outlined" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={saving || companies.length === 0}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
                    {saving ? 'Saving…' : 'Save'}
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
