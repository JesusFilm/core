import { getTranslations } from 'next-intl/server'
import { ReactElement } from 'react'

import { ShortLinkDomainList } from './_ShortLinkDomainList'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale })

  return {
    title: `${t('Short Links')} | ${t('Nexus')}`
  }
}

export default function ShortLinkDomainsPage(): ReactElement {
  return <ShortLinkDomainList />
}
