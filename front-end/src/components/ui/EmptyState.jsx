import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ title = 'Nothing here yet', description, icon: Icon = InboxIcon, action }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
      <Box sx={{ display: 'inline-flex', p: 2.5, borderRadius: 3, bgcolor: 'action.hover', mb: 2 }}>
        <Icon sx={{ fontSize: 36, color: 'text.disabled' }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
      {description && (
        <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 360, mx: 'auto', mb: action ? 3 : 0 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
