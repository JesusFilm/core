import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import File5 from '@core/shared/ui/icons/File5'
import Trash2 from '@core/shared/ui/icons/Trash2'

interface LinkFileProps {
  name: string
  link: string
  onDelete?: () => void
}

export function LinkFile({
  name,
  link,
  onDelete
}: LinkFileProps): ReactElement {
  return (
    <Paper
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}
      data-testid="LinkFile"
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: 1,
          height: 40,
          width: 40
        }}
      >
        <File5 />
      </Box>
      <Link
        variant="subtitle2"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ fontWeight: 800 }}
      >
        {name}
      </Link>
      {onDelete && (
        <Stack
          sx={{
            ml: 'auto',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <IconButton onClick={onDelete} aria-label="delete-file">
            <Trash2 fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Paper>
  )
}
