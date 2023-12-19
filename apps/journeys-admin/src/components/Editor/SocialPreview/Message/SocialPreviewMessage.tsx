import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { JourneyFields } from '../../../../../__generated__/JourneyFields'
import { useSocialPreview } from '../../SocialProvider'

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
  children
}: MessageBubbleProps): ReactElement {
  const ref = useRef<HTMLDivElement>()
  const [clientHeight, setClientHeight] = useState(ref?.current?.clientHeight)
  useEffect(() => {
    setClientHeight(ref?.current?.clientHeight)
  }, [])
  const triangleBase: Partial<SxProps> = {
    content: '""',
    width: 0,
    height: 0,
    top: clientHeight,
    left: direction === 'left' ? 0 : undefined,
    right: direction === 'right' ? 0 : undefined,
    position: 'absolute'
  }
  return (
    <Box
      ref={ref}
      position="relative"
      width={width}
      height={height}
      bgcolor="background.paper"
      border="0.5px solid #DEDFE0"
      borderRadius={direction === 'left' ? '8px 8px 8px 0' : '8px 8px 0 8px'}
      mx={5}
      mb={5}
      px={2}
      pt={2}
      pb={1}
      sx={{
        '&:before': {
          ...triangleBase,
          borderTop: `12px solid #FFF`,
          zIndex: 1,
          borderRight: direction === 'left' ? '12px solid transparent' : '',
          borderLeft: direction === 'right' ? '12px solid transparent' : ''
        },
        '&:after': {
          ...triangleBase,
          borderTop: `13px solid #DEDFE0`,
          borderRight: `13px solid ${
            direction === 'left' ? 'transparent' : 'background.paper'
          }`,
          borderLeft: `13px solid ${
            direction === 'right' ? 'transparent' : 'background.paper'
          }`
        }
      }}
    >
      {children}
    </Box>
  )
}
export function SocialPreviewMessage({
  journey
}: SocialPreviewMessageProps): ReactElement {
  const { seoTitle, seoDescription, primaryImageBlock } = useSocialPreview()

  return (
    <Box
      width={256}
      mx="auto"
      sx={{ transform: { md: 'scale(1)', lg: 'scale(1.33)' } }}
      data-testid="SocialPreviewMessage"
    >
      <Stack direction="column" justifyContent="start">
        <Typography variant="caption" pb={4} textAlign="center">
          Messaging App View
        </Typography>
        <Box>
          <MessageBubble width={200} height={40} direction="left" />
          {journey != null && (
            <MessageBubble width={240} direction="right">
              <Stack direction="column">
                <Stack direction="row" gap={2}>
                  {primaryImageBlock?.src == null ? (
                    <Box
                      width={60}
                      height={60}
                      data-testid="social-preview-message-empty"
                      bgcolor="rgba(0, 0, 0, 0.1)"
                      borderRadius="6px"
                    />
                  ) : (
                    primaryImageBlock?.src != null && (
                      <Image
                        src={primaryImageBlock.src}
                        alt={primaryImageBlock.alt ?? ''}
                        width="60"
                        height="60"
                        style={{
                          borderRadius: '4px',
                          maxWidth: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                          overflow: 'hidden'
                        }}
                      />
                    )
                  )}
                  <Stack width={164} flexGrow={1} justifyContent="center">
                    {isEmpty(seoTitle) ? (
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
                        {seoTitle}
                      </Typography>
                    )}
                    {isEmpty(seoDescription) ? (
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
                        {seoDescription}
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
