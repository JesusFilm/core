import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { SidePanel } from '../../PageWrapper/SidePanel'
import { SidePanelContainer } from '../../PageWrapper/SidePanelContainer'

import { AccessControl } from './AccessControl'
import { JourneyDetails } from './JourneyDetails'
import { JourneyLink } from './JourneyLink'

interface PropertiesProps {
  isPublisher?: boolean
}

export function Properties({ isPublisher }: PropertiesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <SidePanel withAdminDrawer title={t('Properties')}>
        <SidePanelContainer>
          <JourneyDetails isPublisher={isPublisher} />
        </SidePanelContainer>
        <SidePanelContainer>
          <AccessControl />
        </SidePanelContainer>
        <SidePanelContainer border={false}>
          <JourneyLink />
        </SidePanelContainer>
      </SidePanel>
    </>
  )
}
