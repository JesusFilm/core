import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import Typography from '@mui/material/Typography'
import { SidePanelContainer } from '.'

describe('SidePanelContainer', () => {
  it('should render children', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SidePanelContainer>
            <Typography variant="h1">Child</Typography>
          </SidePanelContainer>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Child')
  })
})
