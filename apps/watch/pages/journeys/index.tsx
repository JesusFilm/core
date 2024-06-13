import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { JourneysPage as JourneysTemplatePage } from './journeys'

function JourneysPage(): ReactElement {
  return <JourneysTemplatePage />
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    revalidate: 3600,
    props: {
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
export default JourneysPage
