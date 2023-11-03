import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import FilePlus1Icon from '@core/shared/ui/icons/FilePlus1'
import Grid1Icon from '@core/shared/ui/icons/Grid1'

import { GetOnboardingJourneys_onboardingJourneys as OnboardingJourneys } from '../../../__generated__/GetOnboardingJourneys'
import { useJourneyCreateMutation } from '../../libs/useJourneyCreateMutation/useJourneyCreateMutation'
import { ContainedIconButton } from '../ContainedIconButton'
import { MediaListItem } from '../MediaListItem'
import { SidePanelContainer } from '../NewPageWrapper/SidePanelContainer'
import { useTeam } from '../Team/TeamProvider'

const onboardingIds = [
  '014c7add-288b-4f84-ac85-ccefef7a07d3',
  'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
  'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
  '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
  '13317d05-a805-4b3c-b362-9018971d9b57'
]

interface OnboardingPanelContentProps {
  onboardingJourneys: OnboardingJourneys[]
}

export function OnboardingPanelContent({
  onboardingJourneys
}: OnboardingPanelContentProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const router = useRouter()
  const { teams } = useFlags()

  const { createJourney, loading } = useJourneyCreateMutation()

  const templates: OnboardingJourneys[] = []
  onboardingJourneys.forEach((onboardingJourney) => {
    templates[onboardingIds.indexOf(onboardingJourney.id)] = onboardingJourney
  })
  const loadingTemplates = onboardingJourneys == null

  const handleCreateJourneyClick = async (): Promise<void> => {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}/edit`, undefined, {
        shallow: true
      })
    }
  }

  const handleTemplateClick = (journeyId?: string): void => {
    if (journeyId != null) void router.push(`/templates/${journeyId}`)
  }

  return (
    <>
      {(!teams || activeTeam != null) && (
        <SidePanelContainer>
          <ContainedIconButton
            label={t('Create Custom Journey')}
            thumbnailIcon={<FilePlus1Icon />}
            onClick={handleCreateJourneyClick}
            loading={loading}
          />
        </SidePanelContainer>
      )}
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
      {templates.map(
        (template) =>
          template != null && (
            <MediaListItem
              key={template.id}
              loading={loadingTemplates}
              title={template.title}
              description={template.description ?? ''}
              image={template.primaryImageBlock?.src ?? ''}
              overline={t('Template')}
              border
              onClick={() => handleTemplateClick(template?.id)}
            />
          )
      )}
      <SidePanelContainer border={false}>
        <NextLink href="/templates" passHref legacyBehavior>
          <Button
            variant="outlined"
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
