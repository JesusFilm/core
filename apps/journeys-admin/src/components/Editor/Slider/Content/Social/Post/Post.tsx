import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import isEmpty from 'lodash/isEmpty'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Tooltip } from '../../../../../Tooltip'

export function Post(): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="SocialPreviewPost">
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignContent="center"
        alignItems="center"
      >
        <Typography
          variant="caption"
          pb={4}
          textAlign="center"
          sx={{ fontSize: 16 }}
        >
          {t('Social Post View')}
        </Typography>
        {journey != null && (
          <Card
            sx={{
              maxWidth: { xs: 208, md: 228 },
              height: { xs: 274, md: 294 },
              border: '0.5px solid #DEDFE0',
              borderRadius: '16px',
              display: 'block',
              padding: 2.5
            }}
            elevation={0}
          >
            <Stack
              direction="row"
              height="30px"
              mb={2.5}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Box
                width={22}
                height={22}
                borderRadius={4}
                mr={0}
                bgcolor="background.default"
              />
              <Box flexGrow={1}>
                <Box
                  width={80}
                  height={16}
                  borderRadius="8px"
                  bgcolor="background.default"
                />
              </Box>
              <Box
                width={16}
                height={16}
                borderRadius="8px"
                mr={0}
                bgcolor="background.default"
              />
            </Stack>
            <Tooltip title={t('Social Image')}>
              <CardMedia
                sx={{
                  mb: 2.5,
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
                    borderRadius="5px"
                    bgcolor="background.default"
                  />
                ) : (
                  <Image
                    src={journey.primaryImageBlock.src}
                    alt={journey.primaryImageBlock.alt ?? ''}
                    width={208}
                    height={158}
                    draggable="false"
                    style={{
                      borderRadius: '5px',
                      maxWidth: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </CardMedia>
            </Tooltip>
            <Stack gap={1.5} sx={{ mb: 2.75 }}>
              <Tooltip title={t('Headline')}>
                {isEmpty(journey?.seoTitle?.trim()) ? (
                  <Box
                    width={208}
                    height={15}
                    borderRadius={1.25}
                    bgcolor="background.default"
                    data-testid="HeadlineSkeleton"
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    fontSize={12}
                    lineHeight="15px"
                    color="#26262E"
                    noWrap
                  >
                    {journey.seoTitle}
                  </Typography>
                )}
              </Tooltip>
              <Tooltip title={t('Secondary Text')}>
                {isEmpty(journey?.seoDescription?.trim()) ? (
                  <Box
                    width={208}
                    height={15}
                    borderRadius={1.25}
                    bgcolor="background.default"
                    data-testid="SecondaryTextSkeleton"
                  />
                ) : (
                  <Typography
                    variant="body2"
                    fontSize={8}
                    lineHeight="15px"
                    color="#6D6D7D"
                    noWrap
                  >
                    {journey.seoDescription}
                  </Typography>
                )}
              </Tooltip>
            </Stack>
            <Stack
              flexDirection="row"
              justifyContent="space-around"
              color="background.default"
              mb={2.5}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  width={16}
                  height={16}
                  bgcolor="background.default"
                  borderRadius="8px"
                  mr={0}
                />
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
