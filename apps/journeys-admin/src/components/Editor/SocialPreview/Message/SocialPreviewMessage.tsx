import { ReactElement } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import { isEmpty } from 'lodash'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewMessageProps {
  journey?: JourneyFields
}
export function SocialPreviewMessage({
  journey
}: SocialPreviewMessageProps): ReactElement {
  return (
    <Box width={256} mx="auto">
      <Stack direction="column" justifyContent="start">
        <Typography variant="caption" pb={4} textAlign="center">
          Messaging App View
        </Typography>
        <Box>
          <Box
            width={200}
            height={40}
            bgcolor={(theme) => theme.palette.background.paper}
            borderRadius="8px 8px 0 0"
            mx={5}
          />
          <Box
            width={0}
            height={0}
            borderTop={(theme) =>
              `12px solid ${theme.palette.background.paper as string}`
            }
            borderRight="12px solid transparent"
            ml={5}
            mb={2}
          />
          {journey != null && (
            <Stack direction="column">
              <Box
                width={240}
                borderRadius="8px 8px 0 8px"
                px={2}
                pt={2}
                pb={1}
                bgcolor={(theme) => theme.palette.background.paper}
              >
                <Stack direction="row" gap={2}>
                  {journey?.primaryImageBlock?.src == null ? (
                    <Box
                      width={60}
                      height={60}
                      data-testId="social-preview-message-empty"
                      bgcolor="rgba(0, 0, 0, 0.1)"
                      borderRadius="6px"
                    />
                  ) : (
                    journey?.primaryImageBlock?.src != null && (
                      <Image
                        src={journey?.primaryImageBlock.src}
                        alt={journey?.primaryImageBlock.alt}
                        objectFit="cover"
                        width="60"
                        height="60"
                        style={{ borderRadius: '4px' }}
                      />
                    )
                  )}
                  <Stack width={164}>
                    {isEmpty(journey.seoTitle) ? (
                      <Box
                        width={156}
                        height={12}
                        bgcolor="#EFEFEF"
                        borderRadius="6px"
                        mb={1}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        fontSize={9}
                        lineHeight="12px"
                      >
                        {journey.seoTitle}
                      </Typography>
                    )}
                    {isEmpty(journey.seoDescription) ? (
                      <Box
                        width={110}
                        height={12}
                        bgcolor="#EFEFEF"
                        borderRadius="6px"
                        mb={1}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        fontSize={7}
                        lineHeight="11px"
                      >
                        {journey.seoDescription}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
                <Typography
                  variant="body1"
                  fontSize={8}
                  lineHeight="12px"
                  mt={1}
                >
                  YOUR.NEXTSTEP.IS
                </Typography>
              </Box>
            </Stack>
          )}
          <Box
            width={0}
            height={0}
            borderTop={(theme) =>
              `12px solid ${theme.palette.background.paper as string}`
            }
            borderLeft="12px solid transparent"
            ml={{ sm: 57, xs: 61 }}
            mb={2}
          />
          <Box
            width={200}
            height={40}
            bgcolor={(theme) => theme.palette.background.paper}
            borderRadius="8px 8px 0 8px"
            mx={5}
          />
          <Box
            width={0}
            height={0}
            borderTop={(theme) =>
              `12px solid ${theme.palette.background.paper as string}`
            }
            borderLeft="12px solid transparent"
            ml={52}
            mb={2}
          />
        </Box>
      </Stack>
    </Box>
  )
}
