import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../ThemeProvider'

import { TemplateList } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => {
    return {
      query: {
        tab: 'active'
      },
      push: vi.fn()
    }
  })
}))

describe('TemplatesList', () => {
  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <TemplateList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })
})
