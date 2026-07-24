import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, Chip,
  Avatar, List, ListItem, ListItemText, Skeleton, LinearProgress,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import ScoreRing from '../../components/ui/ScoreRing';
import { useJobs } from '../../hooks/useJobs';
import { interviewService } from '../../services/interviewService';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { fmtTimeAgo, fmtScore, truncate } from '../../utils/formatters';
import { tokens } from '../../theme/index';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      interviewService.applications.getAll(),
      interviewService.reports.getAll(),
    ]).then(([apps, reps]) => {
      setApplications(apps);
      setReports(reps);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completedCount = applications.filter((a) => a.status === 'Completed').length;
  const latestReport = reports[reports.length - 1];
  const avgScore = reports.length ? Math.round(reports.reduce((s, r) => s + (r.score || 0), 0) / reports.length) : null;

  const radarData = [
    { subject: 'Confidence', value: latestReport?.confidence ?? 0 },
    { subject: 'Clarity', value: latestReport?.clarity ?? 0 },
    { subject: 'Technical', value: latestReport?.technicalScore ?? 0 },
    { subject: 'Comm.', value: latestReport?.communicationScore ?? 0 },
    { subject: 'Culture', value: latestReport?.cultureFit ?? 0 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Welcome back, {user?.name?.split(' ')[0]} 👋</Typography>
        <Typography color="text.secondary" variant="body2">Your interview performance at a glance</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Available Jobs" value={loading || jobsLoading ? '—' : jobs.length} icon={VideoCallIcon} color={tokens.indigo[600]} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Interviews Done" value={loading ? '—' : completedCount} icon={AssignmentTurnedInIcon} color="#0ea5e9" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Avg Score" value={loading ? '—' : avgScore != null ? fmtScore(avgScore) : '—'} icon={EmojiEventsIcon} color="#f59e0b" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Best Score" value={loading ? '—' : reports.length ? fmtScore(Math.max(...reports.map((r) => r.score || 0))) : '—'} icon={EmojiEventsIcon} color="#10b981" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Performance radar */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Latest Performance</Typography>
                {latestReport && <ScoreRing score={latestReport.score} size={56} />}
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              ) : !latestReport ? (
                <EmptyState title="No results yet" description="Complete an interview to see your performance breakdown." icon={VideoCallIcon} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke={tokens.indigo[600]} fill={tokens.indigo[600]} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
              {latestReport?.feedback && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, borderLeft: `3px solid ${tokens.indigo[600]}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>AI Feedback</Typography>
                  <Typography variant="body2">{latestReport.feedback}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available interviews */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Available Interviews</Typography>
                <Button size="small" onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}>See all</Button>
              </Box>
              {jobsLoading ? (
                <Stack spacing={1.5}>{Array(4).fill(0).map((_, i) => <Skeleton key={i} height={72} sx={{ borderRadius: 2 }} />)}</Stack>
              ) : jobs.length === 0 ? (
                <EmptyState title="No interviews available" description="Check back soon for new opportunities." />
              ) : (
                <Stack spacing={1.5}>
                  {jobs.slice(0, 4).map((job) => {
                    const app = applications.find((a) => a.jobId === job.id);
                    const done = Boolean(app);
                    return (
                      <Box
                        key={job.id}
                        sx={{
                          p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                          display: 'flex', alignItems: 'center', gap: 2,
                          bgcolor: done ? 'action.hover' : 'background.paper',
                        }}
                      >
                        <Avatar sx={{ bgcolor: done ? 'action.disabledBackground' : tokens.indigo[600], width: 40, height: 40, fontSize: '0.75rem' }}>
                          {job.title?.[0] || 'J'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{job.title}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{truncate(job.description || job.requirements, 55)}</Typography>
                        </Box>
                        {done ? (
                          <Chip label="Completed" size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => navigate(`${ROUTES.CANDIDATE_INTERVIEWS}/${job.id}`)}
                            sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                          >
                            Start
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
