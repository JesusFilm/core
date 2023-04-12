import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import { isEmpty } from 'lodash'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewMessageProps {
  journey?: JourneyFields
}

interface MessageBubbleProps {
  height?: number
  width: number
  direction?: 'left' | 'right'
  children?: ReactNode
  pt?: number
}
export function MessageBubble({
  height,
  width,
  direction = 'left',
  children,
  pt = 0
}: MessageBubbleProps): ReactElement {
  const ref = useRef<HTMLDivElement>()
  const [clientHeight, setClientHeight] = useState(ref?.current?.clientHeight)
  useEffect(() => {
    setClientHeight(ref?.current?.clientHeight)
  }, [])
  const top = (padding = 0): number => {
    return clientHeight != null ? clientHeight + pt + padding : 0
  }
  const left = (padding = 0): number | undefined => {
    return direction === 'left' ? 0 + padding : undefined
  }
  const right = (padding = 0): number | undefined => {
    return direction === 'right' ? 0 + padding : undefined
  }
  return (
    <Box
      ref={ref}
      position="relative"
      width={width}
      height={height}
      bgcolor={(theme) => theme.palette.background.paper}
      border="0.5px solid #DEDFE0"
      borderRadius={direction === 'left' ? '8px 8px 8px 0' : '8px 8px 0 8px'}
      mx={5}
      mb={5}
      px={2}
      pt={2}
      pb={1}
    >
      <Box
        position="absolute"
        top={{ md: top(-0.25), sm: top() }}
        left={left(-0.5)}
        right={right(-0.5)}
        width={0}
        height={0}
        borderTop={(theme) => `13px solid #DEDFE0`}
        borderRight={direction === 'left' ? '13px solid transparent' : ''}
        borderLeft={direction === 'right' ? '13px solid transparent' : ''}
        mb={2}
        zIndex={1}
      />
      <Box
        position="absolute"
        left={left()}
        right={right()}
        top={{ md: top(-0.25), sm: top() }}
        width={0}
        height={0}
        borderTop={(theme) =>
          `12px solid ${theme.palette.background.paper as string}`
        }
        borderRight={direction === 'left' ? '12px solid transparent' : ''}
        borderLeft={direction === 'right' ? '12px solid transparent' : ''}
        zIndex={2}
      />
      {children}
    </Box>
  )
}
export function SocialPreviewMessage({
  journey
}: SocialPreviewMessageProps): ReactElement {
  return (
    <Box
      width={256}
      mx="auto"
      sx={{ transform: { md: 'scale(1)', lg: 'scale(1.33)' } }}
    >
      <Stack direction="column" justifyContent="start">
        <Typography variant="caption" pb={4} textAlign="center">
          Messaging App View
        </Typography>
        <Box>
          <MessageBubble width={200} height={40} direction="left" />
          {journey != null && (
            <MessageBubble width={240} direction="right" pt={-0.5}>
              <Stack direction="column">
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
                  <Stack width={164} flexGrow={1} justifyContent="center">
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
                <Box maxWidth={224}>
                  <Typography
                    variant="body1"
                    fontSize={8}
                    lineHeight="12px"
                    mt={1}
                    color="#C52D3A"
                  >
                    https://your.nextstep.is/{journey.slug}
                  </Typography>
                </Box>
              </Stack>
            </MessageBubble>
          )}
          <MessageBubble width={200} height={40} direction="right" />
        </Box>
      </Stack>
    </Box>
  )
}
