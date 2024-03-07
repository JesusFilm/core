import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { abbreviateLanguageName } from '../../../libs/abbreviateLanguageName'

interface OnboardingTemplateCardProps {
  journey: Journey
}

export function OnboardingTemplateCard({
  journey
}: OnboardingTemplateCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const localLanguage = journey?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    journey?.language?.name.find(({ primary }) => primary)?.value ?? ''

  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          month: 'short',
          year: isThisYear(parseISO(journey?.createdAt)) ? undefined : 'numeric'
        }).replace(' ', ', ')
      : ''

  return (
    <Box sx={{ flexShrink: 0, width: { xs: 107, sm: 244 } }}>
      <Stack
        sx={{
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            journey != null ? 'background.default' : 'transparent',
          overflow: 'hidden',
          height: { xs: 107, sm: 244 },
          width: { xs: 107, sm: 244 },
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
        data-testid="OnboardingSideBarSocialImage"
      >
        {journey?.primaryImageBlock?.src != null ? (
          <NextImage
            src={journey.primaryImageBlock.src}
            alt={journey?.primaryImageBlock.alt}
            placeholder="blur"
            blurDataURL={journey?.primaryImageBlock.blurhash}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : journey != null ? (
          <GridEmptyIcon fontSize="large" />
        ) : (
          <Skeleton
            data-testid="OnboardingSideBarImageSkeleton"
            variant="rectangular"
            sx={{
              width: '100%',
              height: '100%'
            }}
          />
        )}
      </Stack>
      <Stack
        data-testid="OnboardingDetails"
        direction="column"
        spacing={2}
        sx={{
          py: 6,
          px: 3,
          borderWidth: { xs: 0, sm: 1 },
          borderStyle: 'solid',
          borderColor: 'divider',
          borderTop: 'none',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12
        }}
      >
        <>
          <Typography
            variant="overline2"
            sx={{
              whiteSpace: 'noWrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: (theme) => theme.palette.grey[700]
            }}
          >
            {t('{{ date }} ● {{ displayLanguage }}', {
              date,
              displayLanguage
            })}
          </Typography>
          <Box
            sx={{
              height: '46px',
              textOverflow: 'ellipsis',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                my: 1
              }}
            >
              {journey.title}
            </Typography>
          </Box>
        </>
      </Stack>
    </Box>
  )
}
