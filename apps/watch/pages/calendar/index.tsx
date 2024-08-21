import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { getFlags } from '../../src/libs/getFlags'

function CalendarPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Calendar')}</div>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const flags = await getFlags()

  if (flags.calendar !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    revalidate: 3600,
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default CalendarPage
