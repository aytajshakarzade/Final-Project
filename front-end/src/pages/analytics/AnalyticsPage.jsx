import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Stack, Chip, Skeleton,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { useCandidates } from '../../hooks/useCandidates';
import { useJobs } from '../../hooks/useJobs';
import { interviewService } from '../../services/interviewService';
import { tokens } from '../../theme/index';

const COLORS = [tokens.indigo[600], tokens.violet[600], '#0ea5e9', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
  const { candidates, loading: cLoading } = useCandidates();
  const { jobs, loading: jLoading } = useJobs();
  const [sessions, setSessions] = useState([]);
  const [sLoading, setSLoading] = useState(true);

  useEffect(() => {
    interviewService.sessions.getAll()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setSLoading(false));
  }, []);

  const loading = cLoading || jLoading || sLoading;

  // Score distribution
  const scored = candidates.filter((c) => c.bestScore != null);
  const scoreRanges = [
    { range: '90-100', count: scored.filter((c) => c.bestScore >= 90).length },
    { range: '80-89', count: scored.filter((c) => c.bestScore >= 80 && c.bestScore < 90).length },
    { range: '70-79', count: scored.filter((c) => c.bestScore >= 70 && c.bestScore < 80).length },
    { range: '60-69', count: scored.filter((c) => c.bestScore >= 60 && c.bestScore < 70).length },
    { range: '<60', count: scored.filter((c) => c.bestScore < 60).length },
  ];

  // Status pie
  const shortlisted = candidates.filter((c) => c.bestScore != null && c.bestScore >= 70).length;
  const pending = candidates.filter((c) => c.bestScore == null).length;
  const belowThreshold = scored.length - shortlisted;
  const statusData = [
    { name: 'Shortlisted', value: shortlisted },
    { name: 'Below Threshold', value: belowThreshold },
    { name: 'Pending', value: pending },
  ].filter((d) => d.value > 0);

  // Trend mock (weekly activity)
  const weeklyData = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    interviews: Math.floor(sessions.length / 8) + Math.floor(Math.random() * 3),
    candidates: Math.floor(candidates.length / 8) + Math.floor(Math.random() * 2),
  }));

  const ChartSkeleton = () => <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Typography color="text.secondary" variant="body2">Hiring pipeline performance overview</Typography>
      </Box>

      {/* KPI summary row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Candidates', value: candidates.length, color: tokens.indigo[600] },
          { label: 'Avg Score', value: scored.length ? `${Math.round(scored.reduce((s, c) => s + c.bestScore, 0) / scored.length)}%` : '—', color: '#10b981' },
          { label: 'Shortlist Rate', value: scored.length ? `${Math.round((shortlisted / scored.length) * 100)}%` : '—', color: '#f59e0b' },
          { label: 'Active Jobs', value: jobs.length, color: tokens.violet[600] },
        ].map((kpi) => (
          <Grid item xs={6} md={3} key={kpi.label}>
            <Card>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: kpi.color, mx: 'auto', mb: 1 }} />
                {loading ? <Skeleton height={40} width="60%" sx={{ mx: 'auto' }} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1 }}>{kpi.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Score distribution */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Score Distribution</Typography>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {scoreRanges.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Candidate Status</Typography>
              {loading ? <ChartSkeleton /> : statusData.length === 0 ? (
                <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.disabled" variant="body2">No data yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                    <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Weekly Activity</Typography>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="ig1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tokens.indigo[600]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={tokens.indigo[600]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ig2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tokens.violet[600]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={tokens.violet[600]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} />
                    <Area type="monotone" dataKey="interviews" stroke={tokens.indigo[600]} fill="url(#ig1)" strokeWidth={2} dot={false} name="Interviews" />
                    <Area type="monotone" dataKey="candidates" stroke={tokens.violet[600]} fill="url(#ig2)" strokeWidth={2} dot={false} name="Candidates" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
