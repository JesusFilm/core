import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

function CalendarPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return <div>{t('Calendar')}</div>
}

export default CalendarPage
