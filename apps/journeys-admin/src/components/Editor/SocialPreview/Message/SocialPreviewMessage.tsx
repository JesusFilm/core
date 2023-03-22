import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewMessageProps {
  journey?: JourneyFields
}
export function SocialPreviewMessage({
  journey
}: SocialPreviewMessageProps): ReactElement {
  const [isEmpty, setIsEmpty] = useState(true)
  useEffect(() => {
    if (
      journey?.seoTitle != null ||
      journey?.seoDescription != null ||
      journey?.primaryImageBlock?.src != null
    ) {
      setIsEmpty(false)
    } else {
      setIsEmpty(true)
    }
  }, [journey, isEmpty])

  return (
    <Stack direction="column" justifyContent="center">
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Shared in the messenger
      </Typography>
      <Box
        sx={{
          width: 200,
          height: 40,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: '8px 8px 8px 0',
          mx: 5
        }}
      />
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: (theme) => theme.palette.background.paper,
          ml: 5,
          transform: 'matrix(-1, 0, 0, 1, 0, 0)',
          mb: 2
        }}
      />
      {journey != null && (
        <Box
          sx={{
            width: 240,
            borderRadius: '8px 8px 0 8px',
            px: 2,
            bgcolor: (theme) => theme.palette.background.paper
          }}
        >
          <Stack direction="row">
            {isEmpty ? (
              <Box
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '6px'
                }}
              />
            ) : (
              journey?.primaryImageBlock?.src != null && (
                <Image
                  src={journey?.primaryImageBlock.src}
                  alt={journey?.primaryImageBlock.alt}
                  objectFit="cover"
                  width="60"
                  height="60"
                />
              )
            )}
            <Stack
              sx={{
                maxWidth:
                  journey?.primaryImageBlock?.src != null ? 160 : 'inherit'
              }}
            >
              <div>
                <Typography variant="body1">{journey.seoTitle}</Typography>
              </div>
              <div>
                <Typography variant="body2">
                  {journey.seoDescription}
                </Typography>
              </div>
            </Stack>
          </Stack>
          <Typography variant="body1">YOUR.NEXTSTEP.IS</Typography>
        </Box>
      )}
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: (theme) => theme.palette.background.paper,
          ml: 57,
          transform: 'matrix(-1, 0, 0, 1, 0, 0)',
          mb: 2
        }}
      />
      <Box
        sx={{
          width: 200,
          height: 40,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: '8px 8px 0 8px',
          mx: 5
        }}
      />
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: (theme) => theme.palette.background.paper,
          ml: 52,
          transform: 'matrix(-1, 0, 0, 1, 0, 0)',
          mb: 2
        }}
      />
    </Stack>
  )
}
