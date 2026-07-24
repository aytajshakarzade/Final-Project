import { useCallback, useState } from 'react';
import { interviewService } from '../services/interviewService';
import { generateQuestions } from '../utils/questionGenerator';

/**
 * Manages the full lifecycle of a live interview session:
 * 1. ensure candidate profile → create job application → create session
 * 2. navigate through questions
 * 3. save each answer to backend
 * 4. complete session
 * 5. create report
 */
export function useInterview(job, candidateProfile) {
  const [sessionId, setSessionId] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});       // index → answer text
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  // ─── Start interview ────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (!job?.id || !candidateProfile?.id) {
      throw new Error('Job and candidate profile are required to start an interview.');
    }

    // 1. Create job application
    const app = await interviewService.applications.create({
      candidateId: candidateProfile.id,
      jobId: job.id,
    });
    setApplicationId(app.id);

    // 2. Create interview session
    const session = await interviewService.sessions.create({
      jobApplicationId: app.id,
      startedAt: new Date().toISOString(),
    });
    setSessionId(session.id);

    // 3. Generate questions from job requirements
    const qs = generateQuestions(job, 6);
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});

    return session.id;
  }, [job, candidateProfile]);

  // ─── Answer management ──────────────────────────────────────────────────────
  const setAnswer = useCallback((idx, text) => {
    setAnswers((prev) => ({ ...prev, [idx]: text }));
  }, []);

  const saveAnswer = useCallback(async (idx, answerText) => {
    if (!sessionId || !questions[idx]) return;
    await interviewService.answers.create({
      interviewSessionId: sessionId,
      question: questions[idx],
      answer: answerText || answers[idx] || '',
      order: idx + 1,
    });
  }, [sessionId, questions, answers]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // ─── Complete interview ─────────────────────────────────────────────────────
  const finishInterview = useCallback(async () => {
    if (!sessionId) return;
    setSubmitting(true);
    setError(null);

    try {
      // Save any unsaved answers
      await Promise.allSettled(
        questions.map((_, idx) =>
          answers[idx]?.trim()
            ? interviewService.answers.create({
                interviewSessionId: sessionId,
                question: questions[idx],
                answer: answers[idx],
                order: idx + 1,
              }).catch(() => null)
            : null
        )
      );

      // Mark session as ended
      await interviewService.sessions.update(sessionId, {
        endedAt: new Date().toISOString(),
      });

      // Compute a local score based on answer completeness
      const answered = Object.values(answers).filter((a) => a?.trim().length > 20).length;
      const completeness = Math.round((answered / Math.max(questions.length, 1)) * 100);
      const score = Math.min(Math.max(completeness, 5), 95);

      // Create report
      const newReport = await interviewService.reports.create({
        interviewSessionId: sessionId,
        score,
        feedback:
          score >= 75
            ? 'Excellent performance! Your answers were thorough and well-structured. Strong communication skills demonstrated throughout.'
            : score >= 50
            ? 'Good effort. Some answers could benefit from more specific examples. Focus on using the STAR method for behavioural questions.'
            : 'Keep practising! Try to provide more detailed, specific answers with concrete examples from your experience.',
      });

      setReport(newReport);
      setCompleted(true);
    } catch (err) {
      setError(err.message || 'Failed to complete interview. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, questions, answers]);

  return {
    // State
    sessionId,
    questions,
    answers,
    currentIndex,
    currentQuestion: questions[currentIndex] || '',
    currentAnswer: answers[currentIndex] || '',
    isFirst: currentIndex === 0,
    isLast: currentIndex === questions.length - 1,
    progress: questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0,
    submitting,
    completed,
    report,
    error,
    // Actions
    startSession,
    setAnswer,
    saveAnswer,
    goNext,
    goPrev,
    finishInterview,
  };
}
