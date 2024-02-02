import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BaseNode } from './BaseNode'

import Avatar from '@mui/material/Avatar'

import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'

import UserProfile2Icon from '@core/shared/ui/icons/UserProfile2'
import Stack from '@mui/material/Stack'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import ShareIcon from '@mui/icons-material/Share'

export interface SocialPreviewNodeData {
  __typename: 'SocialPreview'
}

export function SocialPreviewNode(): ReactElement {
  const { journey } = useJourney()

  return (
    <BaseNode
      title={journey?.title ?? 'Social Preview'}
      variant="social"
      icon={
        <Stack direction="column" justifyContent="start" alignContent="center">
          {journey != null && (
            <Card
              sx={{
                height: 168,
                width: 130.5,
                border: '0.38px solid #DEDFE0',
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
                    mr: 1,
                    p: 0.75,
                    bgcolor: (theme) => theme.palette.background.default,
                    color: (theme) => theme.palette.background.paper
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
              <CardMedia
                sx={{
                  px: 0,
                  pt: 0,
                  width: 118.5,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
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
              <CardContent sx={{ p: 0, mt: 1.5 }}>
                {isEmpty(journey?.seoTitle) ? (
                  <Box
                    width={118.5}
                    height={9}
                    bgcolor="#EFEFEF"
                    borderRadius="3px"
                    mb={0.75}
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    fontSize={9}
                    lineHeight="12px"
                    color="#26262E"
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
                    fontSize={8}
                    lineHeight="12px"
                    color="#6D6D7D"
                  >
                    {journey.seoDescription}
                  </Typography>
                )}
                <Stack
                  flexDirection="row"
                  justifyContent="space-around"
                  color="#EFEFEF"
                  my={1.5}
                >
                  <ThumbUpIcon sx={{ fontSize: 9 }} />
                  <ChatBubbleIcon sx={{ fontSize: 9 }} />
                  <ShareIcon sx={{ fontSize: 9 }} />
                </Stack>
              </CardContent>
              <CardActionArea />
            </Card>
          )}
        </Stack>
      }
    />
  )
}
