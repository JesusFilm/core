import { ReactElement } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import PersonIcon from '@mui/icons-material/Person'
import Avatar from '@mui/material/Avatar'
import { isEmpty } from 'lodash'
import CardActionArea from '@mui/material/CardActionArea'
import ThumbUp from '@mui/icons-material/ThumbUp'
import ChatBubble from '@mui/icons-material/ChatBubble'
import Share from '@mui/icons-material/Share'
import Card from '@mui/material/Card'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewPostProps {
  journey?: JourneyFields
}

export function SocialPreviewPost({
  journey
}: SocialPreviewPostProps): ReactElement {
  return (
    <Box
      width={256}
      mx="auto"
      sx={{ transform: { xs: 'scale(1)', sm: 'scale(1.33)' } }}
    >
      <Stack direction="column" justifyContent="start" alignContent="center">
        <Typography variant="caption" pb={4} textAlign="center">
          Social App View
        </Typography>
        {journey != null && (
          <Card
            sx={{
              width: { sm: 240, xs: 224 },
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
                <PersonIcon />
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
              {journey.primaryImageBlock?.src == null ? (
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
                  src={journey.primaryImageBlock.src}
                  alt={journey.primaryImageBlock.alt}
                  width={224}
                  height={120}
                  objectFit="cover"
                  style={{
                    borderRadius: '4px'
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
              {isEmpty(journey.seoTitle) ? (
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
                  {journey.seoTitle}
                </Typography>
              )}
              {isEmpty(journey.seoDescription) ? (
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
                  {journey.seoDescription}
                </Typography>
              )}
            </CardContent>
            <CardActionArea>
              <Stack
                flexDirection="row"
                justifyContent="space-around"
                color="#EFEFEF"
                mb={2}
              >
                <ThumbUp sx={{ fontSize: 12 }} />
                <ChatBubble sx={{ fontSize: 12 }} />
                <Share sx={{ fontSize: 12 }} />
              </Stack>
            </CardActionArea>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
