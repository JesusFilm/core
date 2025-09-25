import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useCustomDomainsQuery } from '../../../../../../libs/useCustomDomainsQuery'
import { Tooltip } from '../../../../../Tooltip'

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
export function Message(): ReactElement {
  const { journey } = useJourney()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box maxWidth={256} data-testid="SocialPreviewMessage">
      <Stack direction="column" justifyContent="start">
        <Typography
          variant="caption"
          pb={4}
          textAlign="center"
          sx={{ fontSize: 16 }}
        >
          {t('Message View')}
        </Typography>
        <Stack alignItems="center">
          <MessageBubble width={252} height={54} direction="left" />
          {journey != null && (
            <MessageBubble width={315} direction="right">
              <Stack direction="column" sx={{ p: 1 }}>
                <Stack direction="row" gap={2} alignItems="center">
                  <Tooltip title={t('Social Image')}>
                    {journey?.primaryImageBlock?.src == null ? (
                      <Box
                        width={78}
                        height={78}
                        data-testid="social-preview-message-empty"
                        bgcolor="rgba(0, 0, 0, 0.1)"
                        borderRadius="6px"
                      />
                    ) : (
                      <Box width={78} height={78} sx={{ position: 'relative' }}>
                        <Image
                          src={journey.primaryImageBlock.src}
                          alt={journey.primaryImageBlock.alt ?? ''}
                          fill
                          style={{
                            borderRadius: '5px',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}
                  </Tooltip>
                  <Stack
                    width={164}
                    flexGrow={1}
                    gap={1.5}
                    data-testid="SecondaryText"
                  >
                    <Tooltip title={t('Headline')}>
                      {isEmpty(journey?.seoTitle?.trim()) ? (
                        <Box
                          width={205}
                          height={15}
                          bgcolor="#EFEFEF"
                          borderRadius="5px"
                          data-testid="HeadlineSkeleton"
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          fontSize={12}
                          lineHeight="15px"
                          noWrap
                        >
                          {journey.seoTitle}
                        </Typography>
                      )}
                    </Tooltip>

                    <Tooltip title={t('Secondary Text')}>
                      {isEmpty(journey?.seoDescription?.trim()) ? (
                        <Box
                          width={144}
                          height={15}
                          bgcolor="#EFEFEF"
                          borderRadius="5px"
                          data-testid="SecondaryTextSkeleton"
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          fontSize={8}
                          lineHeight="15px"
                          sx={{ wordBreak: 'break-word' }}
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
                    fontSize={10.5}
                    lineHeight="16px"
                    mt={2}
                    color="#C52D3A"
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
