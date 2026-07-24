import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Typography, LinearProgress, IconButton, Chip, CircularProgress,
  Alert, Paper, Stack, Tooltip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useJobs } from '../../hooks/useJobs';
import { useInterview } from '../../hooks/useInterview';
import { useRecorder } from '../../hooks/useRecorder';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ROUTES } from '../../constants/routes';
import { fmtDuration } from '../../utils/formatters';

// ─── Speech recognition setup ─────────────────────────────────────────────────
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// ─── Timer hook ───────────────────────────────────────────────────────────────
function useTimer(initialSeconds = 900) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const running = useRef(false);
  const timerId = useRef(null);

  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    timerId.current = setInterval(() => setSeconds((s) => Math.max(s - 1, 0)), 1000);
  }, []);

  const stop = useCallback(() => {
    running.current = false;
    clearInterval(timerId.current);
  }, []);

  const reset = useCallback((s = initialSeconds) => {
    stop();
    setSeconds(s);
  }, [stop, initialSeconds]);

  useEffect(() => () => clearInterval(timerId.current), []);

  return { seconds, start, stop, reset };
}

// ─── Camera preview ───────────────────────────────────────────────────────────
function CameraPreview({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          bgcolor: '#0f172a',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '2rem' }}>📷</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Camera unavailable</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', aspectRatio: '16/9', borderRadius: 2, overflow: 'hidden', bgcolor: '#0f172a', position: 'relative' }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
        <Chip
          icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#f43f5e !important', animation: 'recordPulse 1.5s infinite' }} />}
          label="LIVE"
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}
        />
      </Box>
    </Box>
  );
}

// ─── Question dots progress ───────────────────────────────────────────────────
function QuestionDots({ total, current, answered }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            transition: 'all 300ms ease',
            bgcolor: i === current
              ? 'primary.main'
              : answered?.[i]?.trim()
              ? 'success.main'
              : 'divider',
          }}
        />
      ))}
    </Box>
  );
}

// ─── Wave animation when mic is active ───────────────────────────────────────
function MicWave({ active }) {
  if (!active) return null;
  return (
    <Box className="wave-bars" sx={{ ml: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => <Box key={i} className="wave-bar" />)}
    </Box>
  );
}

// ─── Main page component ─────────────────────────────────────────────────────
export default function LiveInterviewPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();

  const { jobs, loading: jobLoading } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  const { profile, loading: profileLoading, ensureProfile } = useCandidateProfile();
  const interview = useInterview(job, profile);
  const recorder = useRecorder();

  const { seconds, start: startTimer, stop: stopTimer } = useTimer(900);

  const [cameraStream, setCameraStream] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [started, setStarted] = useState(false);
  const [initError, setInitError] = useState('');
  const [startingUp, setStartingUp] = useState(false);

  const speechRef = useRef(null);
  const localAnswerRef = useRef({});

  // Sync local ref to keep track of current answers without stale closures
  useEffect(() => {
    localAnswerRef.current = interview.answers;
  }, [interview.answers]);

  // ─── Start everything ────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    setStartingUp(true);
    setInitError('');
    try {
      // Ensure candidate profile exists
      const candidateProfile = await ensureProfile();

      // Request camera + mic
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCameraStream(stream);
      } catch {
        // Camera optional — continue without it
      }

      // Start interview session on backend
      await interview.startSession();
      startTimer();
      setStarted(true);
    } catch (err) {
      setInitError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setStartingUp(false);
    }
  }, [ensureProfile, interview, startTimer]);

  // ─── Speech recognition toggle ────────────────────────────────────────────
  const toggleSpeech = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    if (listening) {
      speechRef.current?.stop();
      setListening(false);
      return;
    }

    const sr = new SpeechRecognitionAPI();
    sr.lang = 'en-US';
    sr.continuous = true;
    sr.interimResults = true;
    speechRef.current = sr;

    sr.onstart = () => setRecognizing(true);
    sr.onend = () => { setListening(false); setRecognizing(false); };

    sr.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      const idx = interview.currentIndex;
      const existing = localAnswerRef.current[idx] || '';
      // Append new transcript words, avoid duplicate
      const merged = existing.trimEnd() + (existing ? ' ' : '') + transcript;
      interview.setAnswer(idx, merged);
    };

    sr.start();
    setListening(true);
  }, [listening, interview]);

  // ─── Navigate questions ────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    // Save current answer before moving
    const currentAns = interview.answers[interview.currentIndex] || '';
    if (currentAns.trim()) {
      await interview.saveAnswer(interview.currentIndex, currentAns).catch(() => null);
    }
    interview.goNext();
  }, [interview]);

  const handlePrev = useCallback(() => {
    interview.goPrev();
  }, [interview]);

  // ─── Submit interview ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    stopTimer();
    speechRef.current?.stop();
    cameraStream?.getTracks().forEach((t) => t.stop());
    await interview.finishInterview();
  }, [stopTimer, cameraStream, interview]);

  // Redirect to results when complete
  useEffect(() => {
    if (interview.completed && interview.report) {
      navigate(ROUTES.CANDIDATE_RESULTS, { state: { report: interview.report, sessionId: interview.sessionId } });
    }
  }, [interview.completed, interview.report, interview.sessionId, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
      speechRef.current?.stop();
    };
  }, [cameraStream]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (jobLoading || profileLoading) return <LoadingSpinner fullPage message="Loading interview…" />;

  if (!job) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Job not found. Please go back and try again.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}>Back to Interviews</Button>
      </Box>
    );
  }

  // ─── Pre-start screen ─────────────────────────────────────────────────────
  if (!started) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Box sx={{ fontSize: '3rem', mb: 2 }}>🎯</Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>{job.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            You are about to start a live AI interview. You will answer 6 questions with an optional 15-minute timer.
            Your camera and microphone will be used. Answers are saved as you go.
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 3, textAlign: 'left' }}>
            {['6 AI-generated interview questions', 'Optional camera and speech recognition', 'Answers auto-saved to your profile', 'AI feedback report on completion'].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Stack>

          {initError && <Alert severity="error" sx={{ mb: 2 }}>{initError}</Alert>}

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button variant="outlined" onClick={() => navigate(ROUTES.CANDIDATE_INTERVIEWS)}>Cancel</Button>
            <Button variant="contained" size="large" onClick={handleStart} disabled={startingUp} sx={{ px: 4 }}>
              {startingUp ? <CircularProgress size={20} color="inherit" /> : '🚀 Start Interview'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ─── Active interview UI ──────────────────────────────────────────────────
  const timerWarning = seconds < 120;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
        gap: 2.5,
        minHeight: 'calc(100vh - 128px)',
        alignItems: 'start',
      }}
    >
      {/* Left panel — camera + stats */}
      <Box sx={{ position: { md: 'sticky' }, top: 80, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CameraPreview stream={cameraStream} />

        {/* Timer */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: timerWarning ? 'warning.main' : 'divider', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: timerWarning ? 'warning.main' : 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">Time remaining</Typography>
          </Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ fontFamily: 'monospace', color: timerWarning ? 'warning.main' : 'text.primary', mt: 0.5 }}
          >
            {fmtDuration(seconds)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(seconds / 900) * 100}
            color={timerWarning ? 'warning' : 'primary'}
            sx={{ mt: 1 }}
          />
        </Paper>

        {/* Progress */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography variant="caption" fontWeight={600}>
              {interview.currentIndex + 1} / {interview.questions.length}
            </Typography>
          </Box>
          <QuestionDots
            total={interview.questions.length}
            current={interview.currentIndex}
            answered={interview.answers}
          />
        </Paper>
      </Box>

      {/* Right panel — question + answer */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Progress bar */}
        <LinearProgress variant="determinate" value={interview.progress} sx={{ height: 4, borderRadius: 2 }} />

        {/* Question card */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 3, p: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
            Question {interview.currentIndex + 1} of {interview.questions.length}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1, lineHeight: 1.5 }}>
            {interview.currentQuestion}
          </Typography>
        </Paper>

        {/* Answer area */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>Your Answer</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MicWave active={recognizing} />
              {SpeechRecognitionAPI && (
                <Tooltip title={listening ? 'Stop speaking' : 'Speak your answer'}>
                  <IconButton
                    onClick={toggleSpeech}
                    size="small"
                    color={listening ? 'error' : 'default'}
                    sx={listening ? { animation: 'recordPulse 1.5s infinite' } : {}}
                  >
                    {listening ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="caption" color="text.disabled">
                {(interview.answers[interview.currentIndex] || '').length} chars
              </Typography>
            </Box>
          </Box>

          <Box
            component="textarea"
            value={interview.answers[interview.currentIndex] || ''}
            onChange={(e) => interview.setAnswer(interview.currentIndex, e.target.value)}
            placeholder="Type your answer here, or use the microphone button to speak…"
            rows={8}
            sx={{
              width: '100%',
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              fontSize: '0.95rem',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.7,
              resize: 'vertical',
              outline: 'none',
              bgcolor: 'background.default',
              color: 'text.primary',
              '&:focus': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(79,70,229,0.1)' },
              boxSizing: 'border-box',
            }}
          />

          {/* STAR guidance */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {['Situation', 'Task', 'Action', 'Result'].map((s) => {
              const present = (interview.answers[interview.currentIndex] || '').toLowerCase().includes(s.toLowerCase());
              return (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  color={present ? 'success' : 'default'}
                  variant={present ? 'filled' : 'outlined'}
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              );
            })}
            <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center', ml: 1 }}>
              STAR method guide
            </Typography>
          </Box>
        </Paper>

        {/* Error display */}
        {interview.error && <Alert severity="error">{interview.error}</Alert>}

        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={handlePrev}
            disabled={interview.isFirst}
          >
            Previous
          </Button>

          <Box sx={{ flex: 1 }} />

          {interview.isLast ? (
            <Button
              variant="contained"
              color="success"
              endIcon={interview.submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={interview.submitting}
              sx={{ px: 3 }}
            >
              {interview.submitting ? 'Submitting…' : 'Finish Interview'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={handleNext}
            >
              Next Question
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
