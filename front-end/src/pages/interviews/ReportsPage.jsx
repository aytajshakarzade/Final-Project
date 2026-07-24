import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Alert, Skeleton,
  Button, Divider,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import { interviewService } from '../../services/interviewService';
import { jobService } from '../../services/jobService';
import EmptyState from '../../components/ui/EmptyState';
import ScoreRing from '../../components/ui/ScoreRing';
import { fmtDate, fmtScore } from '../../utils/formatters';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      interviewService.reports.getAll(),
      interviewService.sessions.getAll(),
      interviewService.applications.getAll(),
      jobService.getAll({ pageSize: 100 }),
    ]).then(([rep, ses, app, j]) => {
      setReports(Array.isArray(rep) ? rep : (rep?.items ?? []));
      setSessions(Array.isArray(ses) ? ses : (ses?.items ?? []));
      setApplications(Array.isArray(app) ? app : (app?.items ?? []));
      setJobs(Array.isArray(j) ? j : (j?.items ?? []));
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Build enriched report list
  const enriched = reports.map((r) => {
    const session = sessions.find((s) => s.id === r.interviewSessionId);
    const application = session ? applications.find((a) => a.id === session.jobApplicationId) : null;
    const job = application ? jobs.find((j) => j.id === application.jobId) : null;
    return { ...r, session, application, job };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return (
    <Box>
      <Skeleton height={40} width={200} sx={{ mb: 3 }} />
      <Stack spacing={2}>{Array(3).fill(0).map((_, i) => <Skeleton key={i} height={120} sx={{ borderRadius: 2 }} />)}</Stack>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Interview Reports</Typography>
        <Typography color="text.secondary" variant="body2">{enriched.length} completed interviews</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {enriched.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 4 }}>
            <EmptyState
              title="No reports yet"
              description="Complete your first AI interview to receive a detailed feedback report."
              icon={AssessmentIcon}
            />
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {enriched.map((r) => (
            <Card key={r.id} sx={{ transition: 'box-shadow 200ms ease', '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <ScoreRing score={r.score} size={70} strokeWidth={6} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {r.job?.title || 'Interview Report'}
                      </Typography>
                      <Chip
                        label={r.score >= 70 ? 'Shortlisted' : r.score >= 50 ? 'Reviewed' : 'Needs Work'}
                        size="small"
                        color={r.score >= 70 ? 'success' : r.score >= 50 ? 'info' : 'warning'}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Completed {fmtDate(r.createdAt)}
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1.5, mt: 1 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{r.feedback}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
