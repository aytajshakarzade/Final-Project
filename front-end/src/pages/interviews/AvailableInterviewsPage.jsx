import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Stack, Chip,
  Alert, Skeleton, InputAdornment, TextField, Avatar,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { interviewService } from '../../services/interviewService';
import { ROUTES } from '../../constants/routes';
import { truncate, fmtSalary } from '../../utils/formatters';

function JobCard({ job, isCompleted, onStart }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
        opacity: isCompleted ? 0.8 : 1,
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: isCompleted ? 'action.disabledBackground' : 'primary.main', width: 44, height: 44 }}>
            <WorkIcon sx={{ fontSize: 22 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>{job.title}</Typography>
            {job.salary > 0 && (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                {fmtSalary(job.salary)}
              </Typography>
            )}
          </Box>
          {isCompleted && <CheckCircleIcon color="success" />}
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2, lineHeight: 1.6 }}>
          {truncate(job.description || job.requirements, 120)}
        </Typography>

        {/* Skills */}
        {job.requirements && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {job.requirements.split(',').slice(0, 4).map((s) => s.trim()).filter(Boolean).map((s) => (
              <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
            ))}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>~15 minutes · 6 questions</Typography>
          {isCompleted ? (
            <Chip label="Completed" size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={() => onStart(job)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Start Interview
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AvailableInterviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs({ pageSize: 100 });
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    interviewService.applications.getAll()
      .then((data) => setApplications(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(() => {});
  }, []);

  const completedJobIds = new Set(applications.map((a) => a.jobId));

  const filtered = jobs.filter((j) =>
    !search.trim() || [j.title, j.description, j.requirements].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = (job) => {
    navigate(`${ROUTES.CANDIDATE_INTERVIEWS}/${job.id}`);
  };

  if (jobsLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {Array(6).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Available Interviews</Typography>
        <Typography color="text.secondary" variant="body2">
          {filtered.length} opportunities · {completedJobIds.size} completed
        </Typography>
      </Box>

      {jobsError && <Alert severity="error" sx={{ mb: 2 }}>{jobsError}</Alert>}

      {/* Search */}
      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by job title or skills…"
        size="small"
        sx={{ mb: 3, width: { xs: '100%', sm: 360 } }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No jobs match your search' : 'No interviews available'}
          description={search ? 'Try different keywords.' : 'New interview opportunities will appear here.'}
          icon={WorkIcon}
        />
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((job) => (
            <Grid item xs={12} sm={6} lg={4} key={job.id}>
              <JobCard
                job={job}
                isCompleted={completedJobIds.has(job.id)}
                onStart={handleStart}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
