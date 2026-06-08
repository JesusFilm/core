import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'

import i18nConfig from '../../../next-i18next.config'

// The page is hostname-agnostic — same static content under both the
// root domain (routed to `pages/home/legal/about-chat.tsx`) and any
// custom hostname (routed here by the `apps/journeys/proxy.ts` Next.js
// middleware, which rewrites `/{path}` → `/{hostname}/{path}`).
// We re-export the component and provide a getStaticProps that only
// loads translations.
export { default } from '../../home/legal/about-chat'

export const getStaticProps: GetStaticProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(
      context.locale ?? 'en',
      ['apps-journeys', 'libs-journeys-ui'],
      i18nConfig
    ))
  }
})

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking'
})
