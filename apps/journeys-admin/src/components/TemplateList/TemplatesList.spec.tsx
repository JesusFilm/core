import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { ThemeProvider } from '../ThemeProvider'

import { TemplateList } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => {
    return {
      query: {
        tab: 'active'
      },
      push: jest.fn()
    }
  })
}))

describe('TemplatesList', () => {
  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <ThemeProvider>
              <TemplateList />
            </ThemeProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })
})
