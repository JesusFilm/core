import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, Suspense } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import Grid1Icon from '@core/shared/ui/icons/Grid1'

import { SidePanelContainer } from '../PageWrapper/SidePanelContainer'

import { CreateJourneyButton } from './CreateJourneyButton'
import { OnboardingListLoading } from './OnboardingListLoading'

const DynamicOnboardingList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "OnboardingList" */
      './OnboardingList'
    ).then((mod) => mod.OnboardingList),
  { ssr: false, loading: () => <OnboardingListLoading /> }
)

export function OnboardingPanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <CreateJourneyButton />
      <SidePanelContainer border={false}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">{t('Use Template')}</Typography>
          <NextLink href="/templates" passHref legacyBehavior>
            <Link
              underline="none"
              variant="subtitle2"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {t('See all')}
              <ChevronRightIcon />
            </Link>
          </NextLink>
        </Stack>
      </SidePanelContainer>
      <Suspense fallback={<OnboardingListLoading />}>
        <DynamicOnboardingList />
      </Suspense>
      <SidePanelContainer border={false}>
        <NextLink href="/templates" passHref legacyBehavior>
          <Button
            component="a"
            variant="outlined"
            size="small"
            startIcon={<Grid1Icon />}
            sx={{ width: 'max-content', alignSelf: 'center' }}
          >
            {t('See all templates')}
          </Button>
        </NextLink>
      </SidePanelContainer>
    </>
  )
}
