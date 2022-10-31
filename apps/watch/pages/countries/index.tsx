import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { Countries } from '../../src/components/Countries/Countries'
import { Header } from '../../src/components/Header'

function CountriesPage(): ReactElement {
  return (
    <LanguageProvider>
      <PageWrapper header={<Header />}>
        <Countries />
      </PageWrapper>
    </LanguageProvider>
  )
}

export default CountriesPage
