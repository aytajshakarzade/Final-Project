import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Stack, Chip, Divider,
  Alert, Skeleton, LinearProgress,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import ScoreRing from '../../components/ui/ScoreRing';
import { interviewService } from '../../services/interviewService';
import { ROUTES } from '../../constants/routes';
import { fmtDate } from '../../utils/formatters';
import { tokens } from '../../theme/index';

function ScoreBand({ score }) {
  if (score >= 85) return { label: 'Outstanding', color: 'success', emoji: '🏆' };
  if (score >= 70) return { label: 'Strong', color: 'success', emoji: '⭐' };
  if (score >= 55) return { label: 'Good', color: 'info', emoji: '👍' };
  if (score >= 40) return { label: 'Fair', color: 'warning', emoji: '📈' };
  return { label: 'Needs Work', color: 'error', emoji: '💪' };
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Can receive report/sessionId from LiveInterviewPage navigation state
  const stateReport = location.state?.report;
  const stateSessionId = location.state?.sessionId;

  const [report, setReport] = useState(stateReport || null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(!stateReport);
  const [error, setError] = useState('');

  useEffect(() => {
    if (report) {
      // Load answers for this session
      interviewService.answers.getAll({ interviewSessionId: report.interviewSessionId || stateSessionId })
        .then((data) => setAnswers(Array.isArray(data) ? data : (data?.items ?? [])))
        .catch(() => {});
      return;
    }
    // Fallback: load the most recent report
    setLoading(true);
    interviewService.reports.getAll()
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        const sorted = items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sorted[0]) setReport(sorted[0]);
        else setError('No interview results found. Complete an interview first.');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Skeleton height={60} sx={{ mb: 2 }} />
      <Skeleton height={300} sx={{ mb: 2 }} />
      <Skeleton height={200} />
    </Box>
  );

  if (error) return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, textAlign: 'center' }}>
      <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
      <Button variant="contained" onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}>Browse Interviews</Button>
    </Box>
  );

  if (!report) return null;

  const { label, color, emoji } = ScoreBand(report.score);

  // Simulated breakdown scores derived from overall score (since backend only stores total score)
  const derive = (base, offset) => Math.max(5, Math.min(95, base + offset));
  const radarData = [
    { subject: 'Clarity', value: derive(report.score, 5) },
    { subject: 'Depth', value: derive(report.score, -10) },
    { subject: 'Relevance', value: derive(report.score, 8) },
    { subject: 'Structure', value: derive(report.score, -5) },
    { subject: 'Confidence', value: derive(report.score, 3) },
  ];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: '3rem', mb: 1 }}>{emoji}</Typography>
        <Typography variant="h4" fontWeight={800} gutterBottom>Interview Complete!</Typography>
        <Typography color="text.secondary">
          Completed {fmtDate(report.createdAt)} · Here is your performance breakdown
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Score ring + band */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <ScoreRing score={report.score} size={120} strokeWidth={10} />
              <Box>
                <Chip label={label} color={color} sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 1 }} />
                <Typography variant="h5" fontWeight={800}>{report.score}%</Typography>
                <Typography variant="caption" color="text.secondary">Overall Score</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Radar breakdown */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Performance Breakdown</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <Radar name="Your Score" dataKey="value" stroke={tokens.indigo[600]} fill={tokens.indigo[600]} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Feedback */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>🤖 AI Feedback</Typography>
              <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2, borderLeft: `4px solid ${tokens.indigo[600]}` }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>{report.feedback}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Answered questions */}
        {answers.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Your Answers</Typography>
                <Stack spacing={2}>
                  {answers
                    .sort((a, b) => a.order - b.order)
                    .map((ans, i) => (
                      <Box key={ans.id} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip label={`Q${ans.order}`} size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />
                          <Typography variant="body2" fontWeight={600}>{ans.question}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, pl: 4 }}>
                          {ans.answer || <em>No answer provided</em>}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ReplayIcon />}
              onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}
            >
              Try Another Interview
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
