import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Strategies')}</div>
    </PageWrapper>
  )
}

export default StrategiesPage
