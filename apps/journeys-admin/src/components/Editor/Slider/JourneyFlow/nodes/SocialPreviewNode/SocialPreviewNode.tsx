import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { OnConnect, useStore } from 'reactflow'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { isIOSTouchScreen } from '@core/shared/ui/deviceUtils'

import { Tooltip } from '../../../../../Tooltip'
import { getReactflowTooltipOffset } from '../../../../../Tooltip/utils/getReactflowTooltipOffset'
import { useUpdateEdge } from '../../libs/useUpdateEdge'
import { BaseNode, HandleVariant } from '../BaseNode'

const TOOLTIP_DURATION = 1500

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()
  const updateEdge = useUpdateEdge()
  const { t } = useTranslation('apps-journeys-admin')
  const [showTooltip, setShowTooltip] = useState(false)
  const scaledOffset = useStore(getReactflowTooltipOffset)

  const {
    dispatch,
    state: { activeContent, activeSlide, showAnalytics }
  } = useEditor()

  useEffect(() => {
    const timeout = showTooltip
      ? setTimeout(() => setShowTooltip(false), TOOLTIP_DURATION)
      : undefined

    return () => {
      if (timeout != null) clearTimeout(timeout)
    }
  }, [showTooltip])

  function handleClick(): void {
    if (activeContent !== ActiveContent.Social) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: undefined
      })
      dispatch({ type: 'SetSelectedStepAction', selectedStep: undefined })
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.JourneyFlow
      })
      dispatch({
        type: 'SetActiveContentAction',
        activeContent: ActiveContent.Social
      })
    } else {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
    }
  }

  async function handleSourceConnect(
    params: { target: string } | Parameters<OnConnect>[0]
  ): Promise<void> {
    void updateEdge({ source: 'SocialPreview', target: params.target })
  }

  return (
    <BaseNode
      id="SocialPreview"
      selected={activeContent === ActiveContent.Social}
      sourceHandle={
        showAnalytics === true ? HandleVariant.Disabled : HandleVariant.Shown
      }
      targetHandle={
        showAnalytics === true ? HandleVariant.Shown : HandleVariant.Hidden
      }
      onSourceConnect={handleSourceConnect}
      isSourceConnected
      positionTargetHandle={false}
    >
      {({ selected }) => (
        <Tooltip
          title={t('Social Media Preview')}
          offset={scaledOffset}
          open={activeSlide === ActiveSlide.JourneyFlow && showTooltip}
          onOpen={() => setShowTooltip(true)}
          onClose={() => setShowTooltip(false)}
        >
          <Card
            data-testid="SocialPreviewNode"
            sx={{
              height: 168,
              width: 130.5,
              borderRadius: 2,
              display: 'block',
              px: 1.5,
              outline: (theme) =>
                `2px solid ${
                  selected === true
                    ? theme.palette.primary.main
                    : selected === 'descendant'
                      ? theme.palette.divider
                      : 'transparent'
                }`,
              outlineOffset: '5px',
              ...(showAnalytics === true && {
                backgroundColor: 'transparent',
                outline: ({ palette }) =>
                  `2px solid ${alpha(palette.secondary.dark, 0.1)}`,
                outlineOffset: 0,
                opacity: 0.7,
                boxShadow: 'none'
              })
            }}
            // hover events and psuedo elements preventing onclicks from running on iOS devices see:
            // https://stackoverflow.com/questions/17710893/why-when-do-i-have-to-tap-twice-to-trigger-click-on-ios#:~:text=The%20simplest%20solution%20is%20not,triggered%20on%20the%20first%20tap.
            // see fig 6-4, https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW7
            onMouseEnter={() => {
              if (isIOSTouchScreen()) handleClick()
            }}
            onClick={() => handleClick()}
          >
            <Stack
              direction="row"
              height="30px"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Box
                width={13}
                height={13}
                borderRadius={3.25}
                sx={{
                  bgcolor: ({ palette }) =>
                    showAnalytics === true
                      ? alpha(palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
              <Box flexGrow={1}>
                <Box
                  width={45}
                  height={9}
                  borderRadius={2}
                  sx={{
                    bgcolor: ({ palette }) =>
                      showAnalytics === true
                        ? alpha(palette.secondary.dark, 0.1)
                        : 'background.default'
                  }}
                />
              </Box>
              <Box
                width={9}
                height={9}
                borderRadius={2}
                sx={{
                  bgcolor: ({ palette }) =>
                    showAnalytics === true
                      ? alpha(palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
            </Stack>
            <CardMedia
              sx={{
                width: 118.5,
                height: 90,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {journey?.primaryImageBlock?.src == null ? (
                <Box
                  data-testid="SocialPreviewPostEmpty"
                  display="block"
                  width={118.5}
                  height={90}
                  borderRadius={1}
                  sx={{
                    bgcolor: ({ palette }) =>
                      showAnalytics === true
                        ? alpha(palette.secondary.dark, 0.1)
                        : 'background.default'
                  }}
                />
              ) : (
                <Box width={118.5} height={90} sx={{ position: 'relative' }}>
                  <Image
                    src={journey.primaryImageBlock.src}
                    alt={journey.primaryImageBlock.alt ?? ''}
                    fill
                    sizes="118.5px"
                  style={{
                      borderRadius: 5,
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </CardMedia>
            <Stack
              sx={{
                flexDirection: 'column',
                display: 'flex'
              }}
            >
              <Stack gap={0.75} sx={{ mt: 1 }}>
                {journey?.seoTitle == null ||
                isEmpty(journey?.seoTitle?.trim()) ? (
                  <Box
                    data-testid="SocialPreviewTitleEmpty"
                    width={118.5}
                    height={9}
                    borderRadius={0.75}
                    sx={{
                      bgcolor: ({ palette }) =>
                        showAnalytics === true
                          ? alpha(palette.secondary.dark, 0.1)
                          : 'background.default'
                    }}
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    fontSize={7}
                    lineHeight="9px"
                    color="secondary.dark"
                    noWrap
                  >
                    {journey.seoTitle}
                  </Typography>
                )}
                {journey?.seoDescription == null ||
                isEmpty(journey?.seoDescription?.trim()) ? (
                  <Box
                    data-testid="SocialPreviewDescriptionEmpty"
                    width={118.5}
                    height={9}
                    borderRadius={0.75}
                    sx={{
                      bgcolor: ({ palette }) =>
                        showAnalytics === true
                          ? alpha(palette.secondary.dark, 0.1)
                          : 'background.default'
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    fontSize={4.5}
                    lineHeight="9px"
                    color="secondary.light"
                    noWrap
                  >
                    {journey.seoDescription}
                  </Typography>
                )}
              </Stack>
              <Stack
                flexDirection="row"
                justifyContent="space-around"
                color="background.default"
                p={1.75}
              >
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    width={9}
                    height={9}
                    borderRadius="4.5px"
                    sx={{
                      bgcolor: ({ palette }) =>
                        showAnalytics === true
                          ? alpha(palette.secondary.dark, 0.1)
                          : 'background.default'
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Tooltip>
      )}
    </BaseNode>
  )
}
