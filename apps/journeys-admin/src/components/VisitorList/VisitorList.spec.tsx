import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '../ThemeProvider'
import { VisitorList } from '.'

describe('VisitorList', () => {
  const input = [
    {
      id:"Jesse Ernst",
      teamId: 56445,
      userId: 84454,
      createdAt: "This date"
    },
    {
      id:"Tataihono Nikora",
      teamId: 1111,
      userId: 8465,
      createdAt: "This date"
    },
    {
      id:"Siyang Cao",
      teamId: 2222,
      userId: 32165,
      createdAt: "This date"
    },
    {
      id:"Steven Diller",
      teamId: 33332,
      userId: 5,
      createdAt: "This date"
    },
    {
      id:"Aaron Thompson",
      teamId: 798654,
      userId: 132465,
      createdAt: "This date"
    }
  ]
  
  it('should render DataGrid', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <FlagsProvider>
            <ThemeProvider>
              <VisitorList input={input} />
            </ThemeProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('grid')).toBeInTheDocument()
  })
})
