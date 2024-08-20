import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import type { ReactElement } from 'react'
import type { OnConnect } from 'reactflow'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import Share from '@core/shared/ui/icons/Share'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import UserProfileCircle from '@core/shared/ui/icons/UserProfileCircle'

import { useUpdateEdge } from '../../libs/useUpdateEdge'
import { BaseNode, HandleVariant } from '../BaseNode'

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { showAnalytics }
  } = useEditor()
  const updateEdge = useUpdateEdge()

  const {
    dispatch,
    state: { activeContent }
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
      sourceHandle={HandleVariant.Shown}
      targetHandle={
        showAnalytics === true ? HandleVariant.Shown : HandleVariant.Hidden
      }
      onSourceConnect={handleSourceConnect}
      isSourceConnected
      positionTargetHandle={false}
    >
      {({ selected }) => (
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
              outline: (theme) =>
                `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
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
            <UserProfileCircle
              sx={{
                fontSize: 14,
                color: (theme) =>
                  showAnalytics === true
                    ? alpha(theme.palette.secondary.dark, 0.1)
                    : 'background.default'
              }}
            />
            <Box flexGrow={1}>
              <Box
                width={45}
                height={9}
                borderRadius={2}
                sx={{
                  backgroundColor: (theme) =>
                    showAnalytics === true
                      ? alpha(theme.palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
            </Box>
            <Box
              width={9}
              height={9}
              borderRadius={2}
              sx={{
                backgroundColor: (theme) =>
                  showAnalytics === true
                    ? alpha(theme.palette.secondary.dark, 0.1)
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
                  backgroundColor: (theme) =>
                    alpha(theme.palette.secondary.dark, 0.1)
                }}
              />
            ) : (
              <Image
                src={journey.primaryImageBlock.src}
                alt={journey.primaryImageBlock.alt ?? ''}
                width={118.5}
                height={90}
                style={{
                  borderRadius: 1.5,
                  maxWidth: '100%',
                  objectFit: 'cover'
                }}
              />
            )}
          </CardMedia>
          <Stack
            gap={2}
            sx={{
              flexDirection: 'column',
              display: 'flex',
              height: 36
            }}
          >
            <Stack gap={0.75} sx={{ mt: 1 }}>
              {journey?.seoTitle == null ||
              isEmpty(journey?.seoTitle?.trim()) ? (
                <Box
                  data-testid="SocialPreviewTitleEmpty"
                  width={118.5}
                  height={9}
                  borderRadius={2}
                  sx={{
                    backgroundColor: (theme) =>
                      showAnalytics === true
                        ? alpha(theme.palette.secondary.dark, 0.1)
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
                  sx={{
                    backgroundColor: (theme) =>
                      showAnalytics === true
                        ? alpha(theme.palette.secondary.dark, 0.1)
                        : 'background.default'
                  }}
                  borderRadius={2}
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
            >
              <ThumbsUp
                sx={{
                  fontSize: 9,
                  color: (theme) =>
                    showAnalytics === true
                      ? alpha(theme.palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
              <MessageCircle
                sx={{
                  fontSize: 9,
                  color: (theme) =>
                    showAnalytics === true
                      ? alpha(theme.palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
              <Share
                sx={{
                  fontSize: 9,
                  color: (theme) =>
                    showAnalytics === true
                      ? alpha(theme.palette.secondary.dark, 0.1)
                      : 'background.default'
                }}
              />
            </Stack>
          </Stack>
        </Card>
      )}
    </BaseNode>
  )
}
