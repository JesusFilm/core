import MenuBookIcon from '@mui/icons-material/MenuBook'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

interface HelpBannerProps {
  dismissed: boolean
  onDismiss: () => void
  onReopen: () => void
}

export function HelpBanner({
  dismissed,
  onDismiss,
  onReopen
}: HelpBannerProps): ReactElement {
  if (dismissed) {
    return (
      <Button
        size="small"
        variant="text"
        startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
        onClick={onReopen}
        aria-label="show help guide"
        sx={{ mb: 1.5, textTransform: 'none', color: 'text.secondary' }}
      >
        Guide
      </Button>
    )
  }

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: '#E3F2FD',
        borderColor: 'rgba(0,0,0,0.08)'
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Getting Started with Collections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Create collections to organize and publish groups of templates.
            Drag templates from the right panel into collections on the left.
            Each collection can be published independently as its own page.
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onDismiss}
          aria-label="dismiss help banner"
        >
          <X2Icon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>
    </Card>
  )
}
