import ChatBubble from '@mui/icons-material/ChatBubble' // icon-replace: add message-circle
import Share from '@mui/icons-material/Share' // icon-replace: no icon serves similar purpose
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { ReactElement } from 'react'

import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import UserProfile2 from '@core/shared/ui/icons/UserProfile2'

import { JourneyFields } from '../../../../../__generated__/JourneyFields'
import { useSocialPreview } from '../../SocialProvider'

interface SocialPreviewPostProps {
  journey?: JourneyFields
}

export function SocialPreviewPost({
  journey
}: SocialPreviewPostProps): ReactElement {
  const { seoTitle, seoDescription, primaryImageBlock } = useSocialPreview()
  return (
    <Box
      width={256}
      mx="auto"
      sx={{ transform: { xs: 'scale(1)', lg: 'scale(1.33)' } }}
    >
      <Stack direction="column" justifyContent="start" alignContent="center">
        <Typography variant="caption" pb={4} textAlign="center">
          Social App View
        </Typography>
        {journey != null && (
          <Card
            sx={{
              width: { md: 240, xs: 224 },
              border: '0.5px solid #DEDFE0',
              borderRadius: '12px',
              px: 2,
              display: 'block'
            }}
            elevation={0}
          >
            <Stack
              pb={2}
              mt={2}
              mb={0}
              direction="row"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  mr: 2,
                  bgcolor: (theme) => theme.palette.background.default,
                  color: (theme) => theme.palette.background.paper
                }}
              >
                <UserProfile2 />
              </Avatar>
              <Box flexGrow={1}>
                <Box
                  width={60}
                  height={12}
                  bgcolor="#EFEFEF"
                  borderRadius="6px"
                />
              </Box>
              <Box
                width={12}
                height={12}
                bgcolor="#EFEFEF"
                borderRadius="6px"
                mr={0}
              />
            </Stack>
            <CardMedia
              sx={{
                px: 0,
                pt: 0,
                width: 224,
                height: 120,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {primaryImageBlock?.src == null ? (
                <Box
                  data-testid="social-preview-post-empty"
                  display="block"
                  width={224}
                  height={120}
                  bgcolor="rgba(0, 0, 0, 0.1)"
                  borderRadius="4px"
                />
              ) : (
                <Image
                  src={primaryImageBlock.src}
                  alt={primaryImageBlock.alt ?? ''}
                  width={224}
                  height={120}
                  style={{
                    borderRadius: '4px',
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                  }}
                />
              )}
            </CardMedia>
            <CardContent sx={{ p: 0, mb: 2 }}>
              <Typography
                variant="body2"
                fontSize={7}
                fontWeight={400}
                lineHeight="10px"
                color="#6D6D7D"
                my={2}
              >
                YOUR.NEXTSTEP.IS
              </Typography>
              {isEmpty(seoTitle) ? (
                <Box
                  width={224}
                  height={12}
                  bgcolor="#EFEFEF"
                  borderRadius="6px"
                  mb={1}
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  fontSize={9}
                  lineHeight="12px"
                  color="#26262E"
                >
                  {seoTitle}
                </Typography>
              )}
              {isEmpty(seoDescription) ? (
                <Box
                  width={158}
                  height={12}
                  bgcolor="#EFEFEF"
                  borderRadius="6px"
                />
              ) : (
                <Typography
                  variant="body2"
                  fontSize={8}
                  lineHeight="12px"
                  color="#6D6D7D"
                >
                  {seoDescription}
                </Typography>
              )}
              <Stack
                flexDirection="row"
                justifyContent="space-around"
                color="#EFEFEF"
                my={2}
              >
                <ThumbsUp sx={{ fontSize: 12 }} />
                <ChatBubble sx={{ fontSize: 12 }} />
                <Share sx={{ fontSize: 12 }} />
              </Stack>
            </CardContent>
            <CardActionArea />
          </Card>
        )}
      </Stack>
    </Box>
  )
}
