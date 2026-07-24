import { useState } from 'react';
import {
  Box, Button, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, MenuItem, Alert,
  CircularProgress, Card, CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { useJobs } from '../../hooks/useJobs';
import { ROUTES } from '../../constants/routes';
import { fmtSalary, truncate } from '../../utils/formatters';

// ─── Inline create/edit dialog ────────────────────────────────────────────────
function JobDialog({ open, onClose, job, onSave }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: job || { title: '', description: '', requirements: '', salary: '' },
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await onSave({ ...data, salary: Number(data.salary) || 0 });
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{job ? 'Edit Job' : 'Create New Job'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Job title *"
              fullWidth
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              placeholder="Role overview and responsibilities…"
              {...register('description')}
            />
            <TextField
              label="Requirements / Skills *"
              fullWidth
              multiline
              rows={3}
              placeholder="e.g. React, TypeScript, 3+ years experience…"
              error={Boolean(errors.requirements)}
              helperText={errors.requirements?.message}
              {...register('requirements', { required: 'Requirements are required' })}
            />
            <TextField
              label="Salary"
              type="number"
              fullWidth
              InputProps={{ startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>$</Box> }}
              {...register('salary')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : job ? 'Save changes' : 'Create job'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, jobTitle }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete Job</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          Delete <strong>"{jobTitle}"</strong>? This cannot be undone.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          disabled={deleting}
          onClick={async () => { setDeleting(true); try { await onConfirm(); onClose(); } finally { setDeleting(false); } }}
        >
          {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { jobs, loading, error, createJob, updateJob, removeJob } = useJobs();
  const [createOpen, setCreateOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);

  const columns = [
    {
      id: 'title',
      label: 'Job Title',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary">{truncate(row.description, 50)}</Typography>
        </Box>
      ),
    },
    {
      id: 'requirements',
      label: 'Skills / Requirements',
      render: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(row.requirements || row.skillsRequired || '').split(',').slice(0, 3).map((s) => s.trim()).filter(Boolean).map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
          ))}
        </Box>
      ),
      sortable: false,
    },
    {
      id: 'salary',
      label: 'Salary',
      render: (row) => <Typography variant="body2" color="text.secondary">{fmtSalary(row.salary)}</Typography>,
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditJob(row); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteJob(row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Jobs</Typography>
          <Typography color="text.secondary" variant="body2">{jobs.length} active positions</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create Job
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable
            columns={columns}
            rows={jobs}
            loading={loading}
            searchable
            searchPlaceholder="Search jobs by title or requirements…"
            rowKey={(r) => r.id}
            emptyTitle="No jobs yet"
            emptyDescription="Create your first job opening to start the hiring process."
            emptyIcon={WorkIcon}
            defaultSort="title"
          />
        </CardContent>
      </Card>

      {/* Create dialog */}
      <JobDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={async (data) => { await createJob(data); toast.success('Job created!'); }}
      />

      {/* Edit dialog */}
      {editJob && (
        <JobDialog
          open={Boolean(editJob)}
          job={editJob}
          onClose={() => setEditJob(null)}
          onSave={async (data) => { await updateJob(editJob.id, data); toast.success('Job updated!'); }}
        />
      )}

      {/* Delete dialog */}
      {deleteJob && (
        <DeleteDialog
          open={Boolean(deleteJob)}
          jobTitle={deleteJob.title}
          onClose={() => setDeleteJob(null)}
          onConfirm={async () => { await removeJob(deleteJob.id); toast.success('Job deleted.'); }}
        />
      )}
    </Box>
  );
}
