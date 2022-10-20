import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '../ThemeProvider'
import { VisitorListReport } from '.'

describe('VisitorListReport', () => {
  it('should render DataGrid', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <ThemeProvider>
              <VisitorListReport input={[]} />
            </ThemeProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('grid')).toBeInTheDocument()
  })
})
