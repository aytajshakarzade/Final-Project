import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Avatar, Stack,
  Chip, LinearProgress, Tab, Tabs, Skeleton, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Tooltip,
} from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import ScoreRing from '../../components/ui/ScoreRing';
import { useJobs } from '../../hooks/useJobs';
import { useCandidates } from '../../hooks/useCandidates';
import { interviewService } from '../../services/interviewService';
import { ROUTES } from '../../constants/routes';
import { fmtTimeAgo, fmtScore, getInitials, truncate } from '../../utils/formatters';
import { tokens } from '../../theme/index';

// ─── Hiring funnel chart ──────────────────────────────────────────────────────
function HiringFunnelChart({ data, loading }) {
  if (loading) return <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Bar dataKey="count" fill={tokens.indigo[600]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Score trend chart ────────────────────────────────────────────────────────
function ScoreTrendChart({ data, loading }) {
  if (loading) return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={tokens.indigo[600]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={tokens.indigo[600]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Avg Score']} />
        <Area type="monotone" dataKey="score" stroke={tokens.indigo[600]} strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: tokens.indigo[600], r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Top candidates list ──────────────────────────────────────────────────────
function TopCandidatesList({ candidates, loading }) {
  if (loading) return <Stack spacing={1}>{Array(4).fill(0).map((_, i) => <Skeleton key={i} height={56} sx={{ borderRadius: 2 }} />)}</Stack>;
  if (!candidates.length) return <EmptyState title="No candidates yet" description="Candidates will appear here after they complete interviews." />;

  return (
    <List disablePadding>
      {candidates.slice(0, 5).map((c, i) => (
        <ListItem key={c.id} disablePadding sx={{ mb: 0.5, borderRadius: 2, px: 1, '&:hover': { bgcolor: 'action.hover' } }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: tokens.indigo[600], width: 36, height: 36, fontSize: '0.75rem' }}>
              {getInitials(c.userId || String(i + 1))}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="body2" fontWeight={500}>Candidate #{String(c.id).slice(0, 6)}</Typography>}
            secondary={<Typography variant="caption" color="text.secondary">{c.skills || 'Skills not listed'}</Typography>}
          />
          {c.bestScore != null && (
            <Chip label={fmtScore(c.bestScore)} size="small" color={c.bestScore >= 75 ? 'success' : c.bestScore >= 50 ? 'warning' : 'error'} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </ListItem>
      ))}
    </List>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { jobs, loading: jobsLoading } = useJobs();
  const { candidates, loading: candidatesLoading } = useCandidates();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    interviewService.sessions
      .getAll()
      .then((response) => {
        if (Array.isArray(response)) {
          setSessions(response);
        } else if (Array.isArray(response?.items)) {
          setSessions(response.items);
        } else if (Array.isArray(response?.data?.items)) {
          setSessions(response.data.items);
        } else if (Array.isArray(response?.data)) {
          setSessions(response.data);
        } else {
          console.log("Interview response:", response);
          setSessions([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSessions([]);
      })
      .finally(() => setSessionsLoading(false));
  }, []);

  const loading = jobsLoading || candidatesLoading || sessionsLoading;

  // Derive metrics
  const completedSessions = Array.isArray(sessions)
    ? sessions.filter((s) => s.completedAt)
    : []; const shortlisted = candidates.filter((c) => c.bestScore != null && c.bestScore >= 70);
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
    : 0;

  // Funnel data
  const funnelData = [
    { stage: 'Applied', count: candidates.length },
    { stage: 'Interviewed', count: completedSessions.length },
    { stage: 'Shortlisted', count: shortlisted.length },
    { stage: 'Hired', count: Math.max(1, Math.floor(shortlisted.length * 0.3)) },
  ];

  // Trend data (mocked from real data)
  const trendData = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    score: Math.min(95, Math.max(50, avgScore + (Math.random() - 0.5) * 20)),
  }));

  const stats = [
    { title: 'Active Jobs', value: loading ? '—' : jobs.length, icon: WorkIcon, color: tokens.indigo[600], trend: 12 },
    { title: 'Total Candidates', value: loading ? '—' : candidates.length, icon: PeopleIcon, color: tokens.violet[600], trend: 8 },
    { title: 'Interviews Done', value: loading ? '—' : completedSessions.length, icon: VideoCallIcon, color: '#0ea5e9', trend: 23 },
    { title: 'Shortlisted', value: loading ? '—' : shortlisted.length, icon: StarIcon, color: '#10b981', trend: 5 },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Recruiter Dashboard</Typography>
          <Typography color="text.secondary" variant="body2">Overview of your hiring pipeline</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.RECRUITER_JOB_CREATE)}>
          New Job
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={6} lg={3} key={s.title}>
            <StatCard {...s} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Hiring Funnel</Typography>
              <HiringFunnelChart data={funnelData} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Score Trend</Typography>
                <Chip label={`Avg ${avgScore}%`} size="small" color="primary" variant="outlined" />
              </Box>
              <ScoreTrendChart data={trendData} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom row */}
      <Grid container spacing={2.5}>
        {/* Top candidates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Top Candidates</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate(ROUTES.RECRUITER_CANDIDATES)}>
                  View all
                </Button>
              </Box>
              <TopCandidatesList candidates={candidates.filter((c) => c.bestScore).sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))} loading={loading} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent jobs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Recent Jobs</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate(ROUTES.RECRUITER_JOBS)}>
                  View all
                </Button>
              </Box>
              {loading ? (
                <Stack spacing={1}>{Array(4).fill(0).map((_, i) => <Skeleton key={i} height={60} sx={{ borderRadius: 2 }} />)}</Stack>
              ) : jobs.length === 0 ? (
                <EmptyState title="No jobs yet" description="Create your first job to start interviewing." action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.RECRUITER_JOB_CREATE)} size="small">Create job</Button>} />
              ) : (
                <Stack spacing={1}>
                  {jobs.slice(0, 5).map((job) => (
                    <Box
                      key={job.id}
                      onClick={() => navigate(ROUTES.RECRUITER_JOBS)}
                      sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>{job.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{truncate(job.description, 60)}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
