import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useCustomDomainsQuery } from '../../../../../../libs/useCustomDomainsQuery'
import { Tooltip } from '../../../../../Tooltip'
import { useEditorLayout } from '../../../../EditorLayoutContext'

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
  const ref = useRef<HTMLDivElement | null>(null)
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
      sx={{
        position: 'relative',
        width: width,
        height: height,
        bgcolor: 'background.paper',
        border: '0.5px solid #DEDFE0',
        borderRadius: direction === 'left' ? '8px 8px 8px 0' : '8px 8px 0 8px',
        mx: 5,
        mb: 5,
        px: 2,
        pt: 2,
        pb: 1,

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
export function Message(): ReactElement {
  const { journey } = useJourney()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })
  const { t } = useTranslation('apps-journeys-admin')
  const { isLayered } = useEditorLayout()
  return (
    <Box
      data-testid="SocialPreviewMessage"
      sx={{
        maxWidth: 256
      }}
    >
      <Stack
        direction="column"
        sx={{
          justifyContent: 'start'
        }}
      >
        <Typography
          variant="caption"
          // the layered desktop view floats over a dark backdrop
          sx={{
            color: isLayered ? 'white' : undefined,
            pb: 4,
            textAlign: 'center',
            fontSize: 16
          }}
        >
          {t('Message View')}
        </Typography>
        <Stack
          sx={{
            alignItems: 'center'
          }}
        >
          <MessageBubble width={252} height={54} direction="left" />
          {journey != null && (
            <MessageBubble width={315} direction="right">
              <Stack direction="column" sx={{ p: 1 }}>
                <Stack
                  direction="row"
                  sx={{
                    gap: 2,
                    alignItems: 'center'
                  }}
                >
                  <Tooltip title={t('Social Image')}>
                    {journey?.primaryImageBlock?.src == null ? (
                      <Box
                        data-testid="social-preview-message-empty"
                        sx={{
                          width: 78,
                          height: 78,
                          bgcolor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '6px'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 78,
                          height: 78,
                          position: 'relative'
                        }}
                      >
                        <Image
                          src={journey.primaryImageBlock.src}
                          alt={journey.primaryImageBlock.alt ?? ''}
                          fill
                          sizes="78px"
                          style={{
                            borderRadius: '5px',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}
                  </Tooltip>
                  <Stack
                    data-testid="SecondaryText"
                    sx={{
                      width: 164,
                      flexGrow: 1,
                      gap: 1.5
                    }}
                  >
                    <Tooltip title={t('Headline')}>
                      {isEmpty(journey?.seoTitle?.trim()) ? (
                        <Box
                          data-testid="HeadlineSkeleton"
                          sx={{
                            width: 205,
                            height: 15,
                            bgcolor: '#EFEFEF',
                            borderRadius: '5px'
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: 12,
                            lineHeight: '15px'
                          }}
                        >
                          {journey.seoTitle}
                        </Typography>
                      )}
                    </Tooltip>

                    <Tooltip title={t('Secondary Text')}>
                      {isEmpty(journey?.seoDescription?.trim()) ? (
                        <Box
                          data-testid="SecondaryTextSkeleton"
                          sx={{
                            width: 144,
                            height: 15,
                            bgcolor: '#EFEFEF',
                            borderRadius: '5px'
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 8,
                            lineHeight: '15px',
                            wordBreak: 'break-word'
                          }}
                        >
                          {journey.seoDescription}
                        </Typography>
                      )}
                    </Tooltip>
                  </Stack>
                </Stack>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: 10.5,
                      lineHeight: '16px',
                      mt: 2,
                      color: '#C52D3A'
                    }}
                  >
                    {journey?.slug != null
                      ? `${
                          hostname != null
                            ? `https://${hostname}`
                            : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                              'https://your.nextstep.is')
                        }/${journey.slug}`
                      : undefined}
                  </Typography>
                </Box>
              </Stack>
            </MessageBubble>
          )}
          <MessageBubble width={252} height={54} direction="right" />
        </Stack>
      </Stack>
    </Box>
  )
}
