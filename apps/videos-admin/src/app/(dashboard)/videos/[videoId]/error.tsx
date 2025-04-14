'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

export default function VideoViewError({
  error
}: {
  error: Error
}): ReactElement {
  console.error(error)
  const router = useRouter()

  return (
    <Stack
      sx={{
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Typography variant="h4">Video not found</Typography>
      <Button variant="contained" color="primary" onClick={() => router.back()}>
        Go Back
      </Button>
    </Stack>
  )
}
