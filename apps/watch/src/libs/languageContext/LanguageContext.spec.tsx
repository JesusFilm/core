import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { LanguageProvider, useLanguage } from './LanguageContext'

const TestComponent = (): ReactElement => {
  const language = useLanguage()

  return <div>{language?.bcp47}</div>
}

describe('LanguageContext', () => {
  it('contain the bcp47 code', () => {
    const { getByText } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    expect(getByText('en')).toBeInTheDocument()
  })
})
