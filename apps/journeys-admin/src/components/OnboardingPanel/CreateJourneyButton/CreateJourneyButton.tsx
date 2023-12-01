import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import FilePlus1Icon from '@core/shared/ui/icons/FilePlus1'

import { useJourneyCreateMutation } from '../../../libs/useJourneyCreateMutation'
import { ContainedIconButton } from '../../ContainedIconButton'
import { SidePanelContainer } from '../../PageWrapper/SidePanelContainer'
import { useTeam } from '../../Team/TeamProvider'

export function CreateJourneyButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    query: { loading: loadingTeams },
    activeTeam
  } = useTeam()
  const router = useRouter()
  const { createJourney, loading: loadingJourneyCreateMutation } =
    useJourneyCreateMutation()
  async function handleCreateJourneyClick(): Promise<void> {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}/edit`, undefined, {
        shallow: true
      })
    }
  }
  return activeTeam != null || loadingTeams ? (
    <SidePanelContainer>
      <ContainedIconButton
        label={t('Create Custom Journey')}
        thumbnailIcon={<FilePlus1Icon />}
        onClick={handleCreateJourneyClick}
        loading={loadingJourneyCreateMutation || loadingTeams}
      />
    </SidePanelContainer>
  ) : (
    <></>
  )
}
