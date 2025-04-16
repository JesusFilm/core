import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { OnConnect, ReactFlowStore, useStore } from 'reactflow'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Tooltip } from '../../../../../Tooltip'
import { useUpdateEdge } from '../../libs/useUpdateEdge'
import { BaseNode, HandleVariant } from '../BaseNode'

// Calculates the tooltip offset to work with react flow zoom
const getOffset = (store: ReactFlowStore): number => {
  const zoom = store.transform[2]

  // (react flow zoom min/max, tooltip offset to match zoom) used to calculate slope-intercept:
  // (0.5, -4)
  // (2.0, 5)
  return 6 * zoom - 7
}

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()
  const updateEdge = useUpdateEdge()
  const { t } = useTranslation('apps-journeys-admin')
  const [showTooltip, setShowTooltip] = useState(false)
  const scaledOffset = useStore(getOffset)

  const {
    dispatch,
    state: { activeContent, activeSlide, showAnalytics }
  } = useEditor()

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
          placement="top"
          open={activeSlide === ActiveSlide.JourneyFlow && showTooltip}
          onOpen={() => setShowTooltip(true)}
          onClose={() => setShowTooltip(false)}
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, scaledOffset]
                  }
                }
              ]
            }
          }}
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
                <Image
                  src={journey.primaryImageBlock.src}
                  alt={journey.primaryImageBlock.alt ?? ''}
                  width={118.5}
                  height={90}
                  style={{
                    borderRadius: 5,
                    maxWidth: '100%',
                    objectFit: 'cover'
                  }}
                />
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
