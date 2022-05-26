import { ReactElement } from 'react'

import { PageWrapper } from '../../src/components/PageWrapper'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { Countries } from '../../src/components/Countries/Countries'

function CountriesPage(): ReactElement {
  return (
    <LanguageProvider>
      <PageWrapper />
      <Countries />
    </LanguageProvider>
  )
}

export default CountriesPage
