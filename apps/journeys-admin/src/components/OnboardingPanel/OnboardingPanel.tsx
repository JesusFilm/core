import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, Suspense } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import Grid1Icon from '@core/shared/ui/icons/Grid1'

import { SidePanelContainer } from '../PageWrapper/SidePanelContainer'

import { CreateJourneyButton } from './CreateJourneyButton'
import { OnboardingListLoading } from './OnboardingListLoading'
import { OnboardingList } from './OnboardingList'

export function OnboardingPanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <CreateJourneyButton />
      <SidePanelContainer border={false}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">{t('Use Template')}</Typography>
          <Link
            component={NextLink}
            href="/templates"
            underline="none"
            variant="subtitle2"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {t('See all')}
            <ChevronRightIcon />
          </Link>
        </Stack>
      </SidePanelContainer>
      <Suspense fallback={<OnboardingListLoading />}>
        <OnboardingList />
      </Suspense>
      <SidePanelContainer border={false}>
        <Button
          LinkComponent={NextLink}
          href="/templates"
          variant="outlined"
          size="small"
          startIcon={<Grid1Icon />}
          sx={{ width: 'max-content', alignSelf: 'center' }}
        >
          {t('See all templates')}
        </Button>
      </SidePanelContainer>
    </>
  )
}
