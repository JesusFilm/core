import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { useJourneyQuery } from '../../../../libs/useJourneyQuery'

interface OnboardingTemplateCardProps {
  templateId?: string
}

export function OnboardingTemplateCard({
  templateId
}: OnboardingTemplateCardProps): ReactElement {
  const { data } = useJourneyQuery({ id: templateId ?? '' })

  return (
    <>
      {templateId != null && (
        <Stack
          spacing={{ xs: 5, md: 0 }}
          justifyContent={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'row', md: 'column' }}
          sx={{
            // border: '2px blue solid',
            width: '100%',
            height: { xs: 58, md: '100%' }
          }}
        >
          <Stack
            sx={{
              position: 'relative',
              backgroundColor:
                data?.journey != null ? 'background.default' : 'transparent',
              overflow: 'hidden',
              height: { xs: 58, md: 244 },
              width: { xs: 59, md: 244 },
              borderRadius: { xs: 2, md: 0 },
              borderTopLeftRadius: { md: 12 },
              borderTopRightRadius: { md: 12 }
            }}
            data-testid="OnboardingSideBarSocialImage"
          >
            {data?.journey?.primaryImageBlock?.src != null ? (
              <NextImage
                src={data?.journey.primaryImageBlock.src}
                alt={data?.journey?.primaryImageBlock.alt}
                placeholder="blur"
                blurDataURL={data?.journey?.primaryImageBlock.blurhash}
                layout="fill"
                objectFit="cover"
                priority
              />
            ) : data?.journey != null ? (
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
          <OnboardingTemplateCardDetails journey={data?.journey} />
        </Stack>
      )}
    </>
  )
}

interface OnboardingTemplateCardDetailsProps {
  journey?: Journey
}

function OnboardingTemplateCardDetails({
  journey
}: OnboardingTemplateCardDetailsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      data-testid="OnboardingTemplateCardDetails"
      direction="column"
      sx={{
        px: { xs: 0, md: 4 },
        pb: { xs: 0, md: 4 },
        pt: { xs: 0, md: 4 },
        borderWidth: { xs: 0, md: 1 },
        borderStyle: 'solid',
        borderColor: 'divider',
        borderTop: 'none',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        width: 244,
        height: { xs: 55, md: 'auto' }
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: (theme) => theme.palette.grey[700]
        }}
      >
        {t('Journey Template')}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          my: 1,
          display: { xs: 'none', md: 'block' }
        }}
      >
        {journey?.title != null ? (
          journey?.title
        ) : (
          <Skeleton
            data-testid="OnboardingTemplateCardDetails"
            sx={{
              transform: 'scale(1, 0.8)',
              width: '100%',
              height: 46,
              maxWidth: 200
            }}
          />
        )}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          my: 1,
          display: { xs: 'block', md: 'none' }
        }}
      >
        {journey?.title != null ? (
          journey?.title
        ) : (
          <Skeleton
            data-testid="OnboardingTemplateCardDetails"
            sx={{
              transform: 'scale(1, 0.8)',
              width: '100%',
              height: 46,
              maxWidth: 200
            }}
          />
        )}
      </Typography>
    </Stack>
  )
}
