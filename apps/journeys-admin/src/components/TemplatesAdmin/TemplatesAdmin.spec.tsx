import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '../ThemeProvider'
import { TemplatesAdmin } from '.'

describe('JourneyList', () => {
  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <ThemeProvider>
              <TemplatesAdmin event="" />
            </ThemeProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })
})
