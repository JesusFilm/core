import { GetStaticProps } from 'next'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'
import { Videos } from '../../src/components/Videos/Videos'
import i18nConfig from '../../next-i18next.config'

function VideoListPage(): ReactElement {
  return <Videos />
}

export const getStaticProps: GetStaticProps<SSRConfig> = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
export default VideoListPage
