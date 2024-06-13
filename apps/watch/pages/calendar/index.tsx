import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'

function CalendarPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Calendar')}</div>
    </PageWrapper>
  )
}

export default CalendarPage
