import { render } from '@testing-library/react'
import Typography from '@mui/material/Typography'
import { SidePanelContainer } from '.'

describe('SidePanelContainer', () => {
  it('should render children', () => {
    const { getByRole } = render(
      <SidePanelContainer>
        <Typography variant="h1">Child</Typography>
      </SidePanelContainer>
    )
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Child')
  })
})
