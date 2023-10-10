import { render } from '@testing-library/react'

import { FormiumProvider } from '../../FormiumProvider'

import { Header, HeaderProps } from './Header'

describe('Header', () => {
  const headerProps = {
    page: {
      title: 'Page Title'
    }
  } as unknown as HeaderProps

  it('should show title', () => {
    const { getByText } = render(
      <FormiumProvider>
        <Header {...headerProps} />
      </FormiumProvider>
    )

    expect(getByText('Page Title')).toBeInTheDocument()
  })

  it('should hide title', () => {
    const { queryByText } = render(
      <FormiumProvider value={{ hiddenPageTitle: true }}>
        <Header {...headerProps} />
      </FormiumProvider>
    )

    expect(queryByText('Page Title')).not.toBeInTheDocument()
  })
})
