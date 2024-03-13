import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { useJourneyQuery } from '../../../../libs/useJourneyQuery'

export function OnboardingTemplateCard(): ReactElement {
  const router = useRouter()

  function getTemplateId(): string | undefined {
    const url = router.query.redirect as string | undefined
    if (url == null) return

    const redirect = decodeURIComponent(url)
    const pathnameParts = redirect?.split('/')
    if (redirect?.includes('templates') && pathnameParts != null) {
      const idIndex = pathnameParts.indexOf('templates') + 1
      const id = pathnameParts[idIndex]
      return id.split('?')[0]
    }
  }

  const templateId = getTemplateId()

  const { data } = useJourneyQuery({ id: templateId ?? '' })

  return (
    <>
      {templateId != null && (
        <Stack
          spacing={{ xs: 4, md: 0 }}
          justifyContent={{ xs: 'flex-start', sm: 'center', md: null }}
          direction={{ xs: 'row', md: 'column' }}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', md: 244 },
            px: { xs: 6, md: 0 }
          }}
        >
          <Stack
            sx={{
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:
                data?.journey != null ? 'background.default' : 'transparent',
              overflow: 'hidden',
              height: { xs: 57, sm: 137, md: 244 },
              width: { xs: 57, sm: 137, md: 244 },
              borderRadius: { xs: 2, md: 0 },
              borderTopLeftRadius: { xs: null, md: 12 },
              borderTopRightRadius: { xs: null, md: 12 }
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
        py: { xs: null, md: 6 },
        px: { xs: null, md: 3 },
        borderWidth: { xs: 0, md: 1 },
        borderStyle: 'solid',
        borderColor: 'divider',
        borderTop: 'none',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12
      }}
    >
      <Typography
        variant="overline2"
        sx={{
          whiteSpace: 'noWrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: (theme) => theme.palette.grey[700]
        }}
      >
        {t('Journey Template')}
      </Typography>
      <Box
        sx={{
          height: { xs: 26, md: 46 },
          textOverflow: 'ellipsis',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            my: 1,
            display: { xs: 'none', sm: 'block' }
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
                height: 26,
                maxWidth: 200
              }}
            />
          )}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            my: 1,
            display: { xs: 'block', sm: 'none' }
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
                height: 26,
                maxWidth: 200
              }}
            />
          )}
        </Typography>
      </Box>
    </Stack>
  )
}
