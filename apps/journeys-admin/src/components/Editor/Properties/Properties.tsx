import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SidePanel } from '../../NewPageWrapper/SidePanel'
import { SidePanelContainer } from '../../NewPageWrapper/SidePanelContainer'

import { AccessControl } from './AccessControl'
import { JourneyDetails } from './JourneyDetails'
import { JourneyLink } from './JourneyLink'
import { EmbedJourneyDialog } from './JourneyLink/EmbedJourneyDialog'
import { SlugDialog } from './JourneyLink/SlugDialog'

interface PropertiesProps {
  isPublisher?: boolean
}

export function Properties({ isPublisher }: PropertiesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)

  return (
    <>
      <SidePanel edit title={t('Properties')}>
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
      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
      <EmbedJourneyDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
      />
    </>
  )
}
