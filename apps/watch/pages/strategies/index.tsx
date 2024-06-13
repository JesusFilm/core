import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Header } from '../../src/components/Header'
import { PageWrapper } from '../../src/components/PageWrapper'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    // <PageWrapper>
    <>
      <Header />
      <div>{t('Strategies')}</div>
    </>
    // {/* </PageWrapper> */}
  )
}

export default StrategiesPage
