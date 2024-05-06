import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { ReactElement } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import Share from '@core/shared/ui/icons/Share'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import UserProfile2Icon from '@core/shared/ui/icons/UserProfile2'

import { BaseNode } from '../BaseNode'

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()
  const {
    dispatch,
    state: { activeContent }
  } = useEditor()

  function handleClick(): void {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  }

  return (
    <BaseNode
      id="SocialPreview"
      selected={activeContent === ActiveContent.Social}
      isSourceConnectable
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
            outlineOffset: '5px'
          }}
          onClick={() => handleClick()}
        >
          <Stack
            direction="row"
            height="30px"
            justifyContent="space-between"
            alignItems="center"
          >
            <Avatar
              sx={{
                height: 15,
                width: 15,
                bgcolor: (theme) => theme.palette.background.default,
                color: (theme) => theme.palette.background.paper,
                mr: 1.5
              }}
            >
              <UserProfile2Icon sx={{ height: '15px' }} />
            </Avatar>
            <Box flexGrow={1}>
              <Box
                width={45}
                height={9}
                bgcolor="#EFEFEF"
                borderRadius="4.5px"
              />
            </Box>
            <Box width={9} height={9} bgcolor="#EFEFEF" borderRadius="4.5px" />
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
                bgcolor="rgba(0, 0, 0, 0.1)"
                borderRadius="4px"
              />
            ) : (
              <Image
                src={journey.primaryImageBlock.src}
                alt={journey.primaryImageBlock.alt ?? ''}
                width={118.5}
                height={90}
                style={{
                  borderRadius: '4px',
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
                  bgcolor="#EFEFEF"
                  borderRadius="4px"
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  fontSize={7}
                  lineHeight="9px"
                  color="#26262E"
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
                  bgcolor="#EFEFEF"
                  borderRadius="4px"
                />
              ) : (
                <Typography
                  variant="body2"
                  fontSize={4.5}
                  lineHeight="9px"
                  color="#6D6D7D"
                  noWrap
                >
                  {journey.seoDescription}
                </Typography>
              )}
            </Stack>
            <Stack
              flexDirection="row"
              justifyContent="space-around"
              color="#EFEFEF"
            >
              <ThumbsUp sx={{ fontSize: 9 }} />
              <MessageCircle sx={{ fontSize: 9 }} />
              <Share sx={{ fontSize: 9 }} />
            </Stack>
          </Stack>
        </Card>
      )}
    </BaseNode>
  )
}
