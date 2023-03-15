import { render } from '@testing-library/react'
import Typography from '@mui/material/Typography'
import { SidePanel } from '.'

describe('SidePanel', () => {
  it('should render children', () => {
    const { getByRole } = render(
      <SidePanel toolbarStyle={{ variant: 'dense', height: 12 }}>
        <Typography variant="h1">Child</Typography>
      </SidePanel>
    )

    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Child')
  })

  it('should render title', () => {
    const { getByTestId } = render(
      <SidePanel
        title="Side Panel Title"
        toolbarStyle={{ variant: 'dense', height: 12 }}
      >
        <Typography variant="h1">Side Panel</Typography>
      </SidePanel>
    )
    expect(getByTestId('side-header')).toHaveTextContent('Side Panel Title')
  })
})
