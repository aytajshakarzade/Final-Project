import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Stack, Alert,
  ToggleButtonGroup, ToggleButton, Tooltip, IconButton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useCandidates } from '../../hooks/useCandidates';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ScoreRing from '../../components/ui/ScoreRing';
import { fmtScore, getInitials, scoreColor } from '../../utils/formatters';
import { tokens } from '../../theme/index';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ABOVE', label: 'Above 70%' },
  { value: 'BELOW', label: 'Below 70%' },
  { value: 'PENDING', label: 'Pending' },
];

export default function CandidatesPage() {
  const { candidates, loading, error } = useCandidates();
  const [filter, setFilter] = useState('ALL');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'ABOVE': return candidates.filter((c) => c.bestScore != null && c.bestScore >= 70);
      case 'BELOW': return candidates.filter((c) => c.bestScore != null && c.bestScore < 70);
      case 'PENDING': return candidates.filter((c) => c.bestScore == null);
      default: return candidates;
    }
  }, [candidates, filter]);

  const columns = [
    {
      id: 'candidate',
      label: 'Candidate',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: tokens.indigo[600], width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700 }}>
            {getInitials(String(row.id).slice(0, 4))}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>Candidate {String(row.id).slice(0, 8)}</Typography>
            <Typography variant="caption" color="text.secondary">{row.education || '—'}</Typography>
          </Box>
        </Box>
      ),
      value: (row) => String(row.id),
    },
    {
      id: 'skills',
      label: 'Skills',
      render: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(row.skills || '').split(',').slice(0, 3).map((s) => s.trim()).filter(Boolean).map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
          ))}
          {!row.skills && <Typography variant="caption" color="text.disabled">Not specified</Typography>}
        </Box>
      ),
      sortable: false,
    },
    {
      id: 'experience',
      label: 'Experience',
      render: (row) => <Typography variant="body2" color="text.secondary">{row.experience || '—'}</Typography>,
      value: (row) => row.experience,
    },
    {
      id: 'applications',
      label: 'Applications',
      render: (row) => (
        <Chip label={row.applications.length} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
      ),
      value: (row) => row.applications.length,
    },
    {
      id: 'bestScore',
      label: 'Best Score',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScoreRing score={row.bestScore} size={40} strokeWidth={4} />
        </Box>
      ),
      value: (row) => row.bestScore,
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => {
        if (row.bestScore == null) return <StatusBadge status="PENDING" />;
        if (row.bestScore >= 70) return <StatusBadge status="SHORTLISTED" />;
        return <StatusBadge status="REVIEWING" />;
      },
      value: (row) => row.bestScore,
    },
  ];

  // Summary stats
  const shortlisted = candidates.filter((c) => c.bestScore != null && c.bestScore >= 70).length;
  const avgScore = candidates.filter((c) => c.bestScore != null).length
    ? Math.round(candidates.filter((c) => c.bestScore != null).reduce((s, c) => s + c.bestScore, 0) / candidates.filter((c) => c.bestScore != null).length)
    : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Candidates</Typography>
          <Typography color="text.secondary" variant="body2">{candidates.length} total · {shortlisted} shortlisted</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {avgScore != null && (
            <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontSize: '0.65rem' }}>AVG SCORE</Typography>
              <Typography fontWeight={700} fontSize="1rem">{avgScore}%</Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter tabs */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          {FILTERS.map((f) => (
            <ToggleButton key={f.value} value={f.value} sx={{ px: 2, fontSize: '0.75rem', textTransform: 'none', fontWeight: 500 }}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable
            columns={columns}
            rows={filtered}
            loading={loading}
            searchable
            searchPlaceholder="Search by skills or experience…"
            rowKey={(r) => r.id}
            emptyTitle="No candidates found"
            emptyDescription="Candidates appear after they complete interviews."
            emptyIcon={PeopleIcon}
            defaultSort="bestScore"
            defaultSortDir="desc"
          />
        </CardContent>
      </Card>
    </Box>
  );
}
