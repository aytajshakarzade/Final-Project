import { useCallback, useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Alert,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/forms/ConfirmDialog';
import { companyService } from '../../services/companyService';
import { truncate } from '../../utils/formatters';

function CompanyDialog({ open, onClose, company, onSave }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: company || { name: '', industry: '', description: '', website: '' },
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700}>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            <TextField label="Company name *" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message}
              {...register('name', { required: 'Name is required' })} />
            <TextField label="Industry" fullWidth placeholder="e.g. Technology, Finance, Healthcare"
              {...register('industry')} />
            <TextField label="Description" fullWidth multiline rows={3}
              placeholder="Brief company overview…" {...register('description')} />
            <TextField label="Website" fullWidth placeholder="https://example.com"
              {...register('website')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : company ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await companyService.getAll();
      setCompanies(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    const created = await companyService.create(data);
    setCompanies((prev) => [created, ...prev]);
    toast.success('Company created!');
  };

  const handleUpdate = async (data) => {
    await companyService.update(editItem.id, data);
    setCompanies((prev) => prev.map((c) => c.id === editItem.id ? { ...c, ...data } : c));
    toast.success('Company updated!');
  };

  const handleDelete = async () => {
    await companyService.remove(deleteItem.id);
    setCompanies((prev) => prev.filter((c) => c.id !== deleteItem.id));
    toast.success('Company deleted.');
  };

  const columns = [
    {
      id: 'name',
      label: 'Company',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BusinessIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.industry || 'Industry not set'}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (row) => <Typography variant="body2" color="text.secondary">{truncate(row.description, 60)}</Typography>,
      sortable: false,
    },
    {
      id: 'website',
      label: 'Website',
      render: (row) => row.website ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LanguageIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}
            onClick={() => window.open(row.website, '_blank')}>
            {row.website.replace(/^https?:\/\//, '')}
          </Typography>
        </Box>
      ) : <Typography variant="caption" color="text.disabled">—</Typography>,
      sortable: false,
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => setEditItem(row)}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteItem(row)}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Companies</Typography>
          <Typography color="text.secondary" variant="body2">{companies.length} organisations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Add Company</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable columns={columns} rows={companies} loading={loading} searchable
            searchPlaceholder="Search by name or industry…" rowKey={(r) => r.id}
            emptyTitle="No companies yet" emptyDescription="Add your first company to start posting jobs."
            emptyIcon={BusinessIcon} defaultSort="name" />
        </CardContent>
      </Card>

      <CompanyDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
      {editItem && <CompanyDialog open onClose={() => setEditItem(null)} company={editItem} onSave={handleUpdate} />}
      {deleteItem && (
        <ConfirmDialog open onClose={() => setDeleteItem(null)} onConfirm={handleDelete} danger
          title="Delete Company" confirmLabel="Delete" confirmColor="error"
          message={`Delete "${deleteItem.name}"? All associated jobs may be affected.`} />
      )}
    </Box>
  );
}
