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
    <Box sx={{ width: 256, mx: 'auto' }}>
      <Stack direction="column" justifyContent="start">
        <Typography variant="subtitle2" sx={{ pb: 4 }}>
          Shared in the messenger
        </Typography>
        <Box>
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
              width: 0,
              height: 0,
              borderTop: (theme) =>
                `12px solid ${theme.palette.background.paper as string}`,
              borderRight: '12px solid transparent',
              ml: 5,
              mb: 2
            }}
          />
          {journey != null && (
            <Box
              sx={{
                width: 240,
                borderRadius: '8px 8px 0 8px',
                px: 2,
                py: 1,
                pt: 2,
                bgcolor: (theme) => theme.palette.background.paper
              }}
            >
              <Stack direction="row" gap={2}>
                {isEmpty ? (
                  <Box
                    data-testId="social-preview-message-empty"
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '6px'
                    }}
                  />
                ) : (
                  journey?.primaryImageBlock?.src != null && (
                    <Box display="block">
                      <Image
                        src={journey?.primaryImageBlock.src}
                        alt={journey?.primaryImageBlock.alt}
                        objectFit="cover"
                        width="60"
                        height="60"
                        style={{ borderRadius: '4px' }}
                      />
                    </Box>
                  )
                )}
                <Stack
                  sx={{
                    maxWidth:
                      journey?.primaryImageBlock?.src != null ? 164 : 'inherit'
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, fontSize: 9, lineHeight: '12px' }}
                  >
                    {journey.seoTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 7, lineHeight: '11px' }}
                  >
                    {journey.seoDescription}
                  </Typography>
                </Stack>
              </Stack>
              <Typography
                variant="body1"
                sx={{ fontSize: 8, lineHeight: '12px' }}
              >
                YOUR.NEXTSTEP.IS
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: (theme) =>
                `12px solid ${theme.palette.background.paper as string}`,
              borderLeft: '12px solid transparent',
              ml: 57,
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
              width: 0,
              height: 0,
              borderTop: (theme) =>
                `12px solid ${theme.palette.background.paper as string}`,
              borderLeft: '12px solid transparent',
              ml: 52,
              mb: 2
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
