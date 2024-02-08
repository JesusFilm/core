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
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import UserProfile2Icon from '@core/shared/ui/icons/UserProfile2'
import ThumbsUp from '@core/shared/ui/icons/ThumbsUp'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import Share from '@core/shared/ui/icons/Share'

export function SocialPreviewPost(): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="SocialPreviewPost">
      <Stack direction="column" justifyContent="start" alignContent="center">
        <Typography
          variant="caption"
          pb={4}
          textAlign="center"
          sx={{ fontSize: 16 }}
        >
          {t('Social App View')}
        </Typography>
        {journey != null && (
          <Card
            sx={{
              width: 228,
              height: 294,
              border: '0.5px solid #DEDFE0',
              borderRadius: '16px',
              display: 'block',
              padding: 2.5
            }}
            elevation={0}
          >
            <Stack
              pb={2}
              mb={0}
              direction="row"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  mr: 2,
                  bgcolor: (theme) => theme.palette.background.default,
                  color: (theme) => theme.palette.background.paper
                }}
              >
                <UserProfile2Icon />
              </Avatar>
              <Box flexGrow={1}>
                <Box
                  width={80}
                  height={16}
                  bgcolor="#EFEFEF"
                  borderRadius="8px"
                />
              </Box>
              <Box
                width={16}
                height={16}
                bgcolor="#EFEFEF"
                borderRadius="8px"
                mr={0}
              />
            </Stack>
            <CardMedia
              sx={{
                px: 0,
                pt: 0,
                width: 208,
                height: 158,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {journey?.primaryImageBlock?.src == null ? (
                <Box
                  data-testid="social-preview-post-empty"
                  display="block"
                  width={208}
                  height={158}
                  bgcolor="rgba(0, 0, 0, 0.1)"
                  borderRadius="5px"
                />
              ) : (
                <Image
                  src={journey.primaryImageBlock.src}
                  alt={journey.primaryImageBlock.alt ?? ''}
                  width={208}
                  height={158}
                  style={{
                    borderRadius: '5px',
                    maxWidth: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </CardMedia>
            <CardContent sx={{ p: 0, my: 3 }}>
              {isEmpty(journey?.seoTitle) ? (
                <Box
                  width={208}
                  height={15}
                  bgcolor="#EFEFEF"
                  borderRadius="8px"
                  mb={1}
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  fontSize={12}
                  lineHeight="16px"
                  color="#26262E"
                >
                  {journey.seoTitle}
                </Typography>
              )}
              {isEmpty(journey?.seoDescription) ? (
                <Box
                  width={144}
                  height={15}
                  bgcolor="#EFEFEF"
                  borderRadius="8px"
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
                width="100%"
                height="100%"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-around"
                color="#EFEFEF"
                sx={{ my: 3 }}
              >
                <ThumbsUp sx={{ fontSize: 15 }} />
                <MessageCircle sx={{ fontSize: 15 }} />
                <Share sx={{ fontSize: 15 }} />
              </Stack>
            </CardContent>
            <CardActionArea />
          </Card>
        )}
      </Stack>
    </Box>
  )
}
