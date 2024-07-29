import { gql } from '@apollo/client'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { WatchHomePage as VideoHomePage } from '../../src/components/WatchHomePage'
import { getFlags } from '../../src/libs/getFlags'
import { VIDEO_CHILD_FIELDS } from '../../src/libs/videoChildFields'

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
    videos(where: { ids: $ids }) {
      ...VideoChildFields
    }
  }
`

function HomePage(): ReactElement {
  return <VideoHomePage />
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    revalidate: 3600,
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
export default HomePage
