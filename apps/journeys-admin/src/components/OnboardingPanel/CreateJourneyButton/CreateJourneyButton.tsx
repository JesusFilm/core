import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import FilePlus1Icon from '@core/shared/ui/icons/FilePlus1'

import { useJourneyCreateMutation } from '../../../libs/useJourneyCreateMutation'
import { ContainedIconButton } from '../../ContainedIconButton'
import { SidePanelContainer } from '../../PageWrapper/SidePanelContainer'

export function CreateJourneyButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()

  const {
    query: { loading: loadingTeams },
    activeTeam
  } = useTeam()

  const [isRedirecting, setIsRedirecting] = useState(false)
  const { createJourney } = useJourneyCreateMutation()

  async function handleCreateJourneyClick(): Promise<void> {
    setIsRedirecting(true)
    try {
      const journey = await createJourney()
      if (journey != null) {
        await router.push(`/journeys/${journey.id}`, undefined, {
          shallow: true
        })
      }
    } catch (error) {
      setIsRedirecting(false)
    } finally {
      setIsRedirecting(false)
    }
  }

  return activeTeam != null || loadingTeams ? (
    <SidePanelContainer>
      <ContainedIconButton
        label={t('Create Custom Journey')}
        thumbnailIcon={<FilePlus1Icon />}
        onClick={handleCreateJourneyClick}
        loading={loadingTeams || isRedirecting}
      />
    </SidePanelContainer>
  ) : (
    <></>
  )
}
