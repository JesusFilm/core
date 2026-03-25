'use client'

import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement } from 'react'

const NEW_TAB_TOOLTIP = 'Opens video in a new tab'

export type VideoIdPublishStatus = 'success' | 'error'

export function VideoIdNewTabLink({
  id,
  status
}: {
  id: string
  status?: VideoIdPublishStatus
}): ReactElement {
  const statusIcon =
    status === 'success' ? (
      <CheckCircleIcon
        sx={{ color: 'success.main', fontSize: '1.125rem', flexShrink: 0 }}
        aria-hidden
      />
    ) : status === 'error' ? (
      <CancelIcon
        sx={{ color: 'error.main', fontSize: '1.125rem', flexShrink: 0 }}
        aria-hidden
      />
    ) : null

  const link = (
    <Tooltip title={NEW_TAB_TOOLTIP} enterDelay={400} describeChild>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          maxWidth: '100%',
          verticalAlign: 'top'
        }}
      >
        <Link
          href={`/videos/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          aria-label={`Open video ${id} in a new tab`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontWeight: 600
          }}
        >
          <span>{id}</span>
          <OpenInNewIcon
            fontSize="small"
            sx={{ color: 'text.secondary', flexShrink: 0 }}
            aria-hidden
          />
        </Link>
      </Box>
    </Tooltip>
  )

  if (statusIcon == null) {
    return link
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      component="span"
      sx={{ maxWidth: '100%' }}
      aria-label={
        status === 'success'
          ? `Published: ${id}`
          : `Could not publish: ${id}`
      }
    >
      {statusIcon}
      {link}
    </Stack>
  )
}
