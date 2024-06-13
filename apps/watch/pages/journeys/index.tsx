import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'

function JourneysPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Journeys')}</div>
    </PageWrapper>
  )
}

export default JourneysPage
