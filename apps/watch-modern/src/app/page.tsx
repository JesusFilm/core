import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

import { ApolloClientProvider } from '@/components/providers/apollo'
import { InstantSearchProviders } from '@/components/providers/instantsearch'
import WatchHomePage from '@/components/watch/home/WatchHomePage'

export const generateMetadata = async () => {
  const t = await getTranslations('RootIndexPage')
  const m = await getTranslations('Metadata')
  return { title: m('pageTitle', { title: t('pageTitle') }) }
}

export default async function WatchRootPage(): Promise<ReactElement> {
  return (
    <main>
      <ApolloClientProvider>
        <InstantSearchProviders>
          <WatchHomePage />
        </InstantSearchProviders>
      </ApolloClientProvider>
    </main>
  )
}
