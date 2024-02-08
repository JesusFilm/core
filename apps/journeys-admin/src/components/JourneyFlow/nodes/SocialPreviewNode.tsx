import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BaseNode } from './BaseNode'

import Avatar from '@mui/material/Avatar'

import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'

import UserProfile2Icon from '@core/shared/ui/icons/UserProfile2'
import Stack from '@mui/material/Stack'
import CardMedia from '@mui/material/CardMedia'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import Share from '@core/shared/ui/icons/Share'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

export interface SocialPreviewNodeData {
  __typename: 'SocialPreview'
}

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()
  const { dispatch } = useEditor()

  function handleClick() {
    dispatch({
      type: 'SetJourneyEditContentAction',
      component: ActiveJourneyEditContent.SocialPreview
    })
  }

  return (
    <BaseNode
      onClick={() => handleClick()}
      title={journey?.title ?? 'Social Preview'}
      variant="social"
      icon={
        journey != null && (
          <Card
            sx={{
              height: 168,
              width: 130.5,
              borderRadius: '9px',
              display: 'block',
              px: 1.5
            }}
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
              <Box
                width={9}
                height={9}
                bgcolor="#EFEFEF"
                borderRadius="4.5px"
              />
            </Stack>
            <CardMedia>
              {journey?.primaryImageBlock?.src == null ? (
                <Box
                  data-testid="social-preview-post-empty"
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
              sx={{
                justifyContent: 'space-between',
                flexDirection: 'column',
                display: 'flex',
                height: 36
              }}
            >
              <Stack gap={0.75} maxHeight={21}>
                {isEmpty(journey?.seoTitle) ? (
                  <Box
                    width={118.5}
                    height={9}
                    bgcolor="#EFEFEF"
                    borderRadius="3px"
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
                {isEmpty(journey?.seoDescription) ? (
                  <Box
                    width={118.5}
                    height={9}
                    bgcolor="#EFEFEF"
                    borderRadius="3px"
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
        )
      }
    />
  )
}
