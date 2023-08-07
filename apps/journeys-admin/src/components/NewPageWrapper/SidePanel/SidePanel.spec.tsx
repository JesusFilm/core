import Typography from '@mui/material/Typography'
import { render } from '@testing-library/react'

import { SidePanel } from '.'

describe('SidePanel', () => {
  it('should render title', () => {
    const { getByTestId } = render(
      <SidePanel title="Side Panel Title">
        <Typography variant="h1">Side Panel</Typography>
      </SidePanel>
    )
    expect(getByTestId('side-header')).toHaveTextContent('Side Panel Title')
  })
})
