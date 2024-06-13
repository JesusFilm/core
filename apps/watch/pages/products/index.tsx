import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'

function ProductsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Products')}</div>
    </PageWrapper>
  )
}

export default ProductsPage
