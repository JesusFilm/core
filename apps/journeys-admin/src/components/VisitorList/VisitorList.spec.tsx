import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '../ThemeProvider'
import { edges } from './VisitorListData'
import { VisitorList } from '.'

describe('VisitorList', () => { 
  
  it('should render DataGrid', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <ThemeProvider>
              <VisitorList input={edges} />
            </ThemeProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('grid')).toBeInTheDocument()
  })

  it('should have name', () => {
    const { getByText } = render(
      <VisitorList input={edges} />
    )
    expect(getByText('Jesse Ernst')).toBeInTheDocument()
  })

  it('should have TeamId', () => {
    const { getByText } = render(
      <VisitorList input={edges} />
    )
    expect(getByText('56,445')).toBeInTheDocument()
  })
  it('should have UserId', () => {
    const { getByText } = render(
      <VisitorList input={edges} />
    )
    expect(getByText('84454')).toBeInTheDocument()
  })
})
