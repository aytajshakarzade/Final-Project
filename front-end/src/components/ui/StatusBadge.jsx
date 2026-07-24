import { Chip } from '@mui/material';

const STATUS_MAP = {
  // Application statuses
  PENDING: { label: 'Pending', color: 'warning' },
  REVIEWING: { label: 'Reviewing', color: 'info' },
  SHORTLISTED: { label: 'Shortlisted', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  HIRED: { label: 'Hired', color: 'success' },
  QUALIFIED: { label: 'Qualified', color: 'success' },

  // Interview statuses
  NOT_STARTED: { label: 'Not Started', color: 'default' },
  IN_PROGRESS: { label: 'In Progress', color: 'info' },
  COMPLETED: { label: 'Completed', color: 'success' },

  // Role
  RECRUITER: { label: 'Recruiter', color: 'primary' },
  CANDIDATE: { label: 'Candidate', color: 'secondary' },
  ADMIN: { label: 'Admin', color: 'error' },
};

export default function StatusBadge({ status, size = 'small', variant = 'filled' }) {
  const cfg = STATUS_MAP[status?.toUpperCase()] || { label: status || 'Unknown', color: 'default' };
  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size={size}
      variant={variant}
      sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
    />
  );
}
