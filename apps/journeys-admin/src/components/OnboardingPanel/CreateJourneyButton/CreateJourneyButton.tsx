import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import FilePlus1Icon from '@core/shared/ui/icons/FilePlus1'

import { useJourneyCreateMutation } from '../../../libs/useJourneyCreateMutation'
import { ContainedIconButton } from '../../ContainedIconButton'
import { SidePanelContainer } from '../../PageWrapper/SidePanelContainer'

export function CreateJourneyButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { teamsLoading, activeTeam } = useTeam()
  const router = useRouter()
  const { createJourney, loading: loadingJourneyCreateMutation } =
    useJourneyCreateMutation()
  async function handleCreateJourneyClick(): Promise<void> {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}`, undefined, {
        shallow: true
      })
    }
  }
  return activeTeam != null || teamsLoading ? (
    <SidePanelContainer>
      <ContainedIconButton
        label={t('Create Custom Journey')}
        thumbnailIcon={<FilePlus1Icon />}
        onClick={handleCreateJourneyClick}
        loading={loadingJourneyCreateMutation || teamsLoading}
      />
    </SidePanelContainer>
  ) : (
    <></>
  )
}
