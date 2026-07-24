export const ROUTES = {
  // Public
  HOME:     '/',
  LOGIN:    '/login',
  REGISTER: '/register',

  // Recruiter
  RECRUITER_DASHBOARD:   '/recruiter/dashboard',
  RECRUITER_JOBS:        '/recruiter/jobs',
  RECRUITER_CANDIDATES:  '/recruiter/candidates',
  RECRUITER_COMPANIES:   '/recruiter/companies',
  RECRUITER_INTERVIEWS:  '/recruiter/interviews',
  RECRUITER_ANALYTICS:   '/recruiter/analytics',
  RECRUITER_SETTINGS:    '/recruiter/settings',
  RECRUITER_PROFILE:     '/recruiter/profile',

  // Candidate
  CANDIDATE_DASHBOARD:   '/candidate/dashboard',
  CANDIDATE_INTERVIEWS:  '/candidate/interviews',
  CANDIDATE_INTERVIEW:   '/candidate/interviews/:id',
  CANDIDATE_RESULTS:     '/candidate/results',
  CANDIDATE_REPORTS:     '/candidate/reports',
  CANDIDATE_SETTINGS:    '/candidate/settings',
  CANDIDATE_PROFILE:     '/candidate/profile',

  // Errors
  NOT_FOUND:    '/404',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN:    '/forbidden',
};

export const getRoleBase = (role) => {
  switch (String(role).toUpperCase()) {
    case 'RECRUITER':
    case 'ADMIN':
      return ROUTES.RECRUITER_DASHBOARD;
    case 'CANDIDATE':
    default:
      return ROUTES.CANDIDATE_INTERVIEWS;
  }
};
