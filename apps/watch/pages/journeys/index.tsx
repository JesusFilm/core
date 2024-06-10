import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

function JourneysPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return <div>{t('Journeys')}</div>
}

export default JourneysPage
