import { STORAGE_KEYS } from '../constants/storageKeys';
import { candidateApi } from '../api/candidateApi';
import { companyApi } from '../api/companyApi';
import { jobApi } from '../api/jobApi';
import { recruiterApi } from '../api/recruiterApi';
import { interviewApi } from '../api/interviewApi';
import { getAuthenticatedUser } from './authenticationService';

const memory = new Map();
const empty = () => [];

export const readStoredValue = (key, fallback) => memory.has(key) ? memory.get(key) : fallback;
export const writeStoredValue = (key, value) => memory.set(key, value);
export const clearRuntimeStore = () => memory.clear();

function normalizeJobs(jobs) {
  return jobs.map((job) => ({
    ...job,
    // The supplied API has Description and Requirements, not the former UI-only fields.
    department: job.description || '',
    skillsRequired: job.requirements || '',
  }));
}

export async function hydrateRuntimeStore() {
  const [candidates, companies, recruiters, jobs, applications, sessions, answers, reports] = await Promise.all([
    candidateApi.getAll(),
    companyApi.getAll(),
    recruiterApi.getAll(),
    jobApi.getAll(),
    interviewApi.applications.getAll(),
    interviewApi.sessions.getAll(),
    interviewApi.answers.getAll(),
    interviewApi.reports.getAll(),
  ]);

  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const sessionByApplication = new Map(sessions.map((session) => [session.jobApplicationId, session]));
  const reportBySession = new Map(reports.map((report) => [report.interviewSessionId, report]));
  const normalizedApps = applications.map((application) => {
    const session = sessionByApplication.get(application.id);
    const report = session ? reportBySession.get(session.id) : undefined;
    return {
      ...application,
      backendCandidateId: application.candidateId,
      candidateId: candidateById.get(application.candidateId)?.userId || application.candidateId,
      interviewScore: report?.score,
      report: report ? { score: report.score, feedback: report.feedback, createdAt: report.createdAt } : null,
    };
  });
  const user = getAuthenticatedUser();

  memory.set(STORAGE_KEYS.users, user ? [user] : empty());
  memory.set(STORAGE_KEYS.jobs, normalizeJobs(jobs));
  memory.set(STORAGE_KEYS.apps, normalizedApps);
  memory.set(STORAGE_KEYS.interviews, sessions);
  memory.set(STORAGE_KEYS.training, empty());
  memory.set(STORAGE_KEYS.drafts, {});
  memory.set(STORAGE_KEYS.session, user ? { userId: user.id } : null);
  memory.set('backend.candidates', candidates);
  memory.set('backend.companies', companies);
  memory.set('backend.recruiters', recruiters);
  memory.set('backend.answers', answers);
  memory.set('backend.reports', reports);
  return { candidates, companies, recruiters, jobs, applications: normalizedApps, sessions, answers, reports };
}

export function getBackendCollection(name, fallback = []) {
  return memory.get(`backend.${name}`) || fallback;
}
