import { render } from '@testing-library/react'

import { FormiumProvider } from '../../FormiumProvider'

import { Header, HeaderProps } from './Header'

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactElement[] }) => {
      return <>{children}</>
    }
  }
})

describe('Header', () => {
  const headerProps = {
    page: {
      title: 'Header Title'
    }
  } as unknown as HeaderProps

  it('renders header', () => {
    const { getByText } = render(
      <FormiumProvider>
        <Header {...headerProps} />
      </FormiumProvider>
    )

    expect(getByText('Header Title')).toBeInTheDocument()
  })

  it('hides the header', () => {
    const { queryByText } = render(
      <FormiumProvider hideHeader>
        <Header {...headerProps} />
      </FormiumProvider>
    )

    expect(queryByText('Header Title')).not.toBeInTheDocument()
  })

  it('updates browser page title', () => {
    render(
      <FormiumProvider headerAsPageTitle>
        <Header {...headerProps} />
      </FormiumProvider>,
      {
        container: document.head
      }
    )

    expect(document.title).toBe('Header Title')
  })
})
