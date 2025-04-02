import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../next-i18next.config'
import { CollectionsPage } from '../../../src/components/CollectionsPage/languages/en'
import { getFlags } from '../../../src/libs/getFlags'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'

export default function EasterPage(): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <CollectionsPage />
      </LanguageProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
