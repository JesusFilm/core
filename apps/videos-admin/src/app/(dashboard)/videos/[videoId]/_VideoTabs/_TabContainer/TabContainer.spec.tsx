import Typography from '@mui/material/Typography'
import { render, screen } from '@testing-library/react'

import { TabContainer } from './TabContainer'

describe('TabContainer', () => {
  it('should render children when value equals index', () => {
    render(
      <TabContainer value={0} index={0}>
        <Typography>Hello</Typography>
      </TabContainer>
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should not render children when value does not equal index', () => {
    render(
      <TabContainer value={0} index={1}>
        <Typography>Hello</Typography>
      </TabContainer>
    )

    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })
})
