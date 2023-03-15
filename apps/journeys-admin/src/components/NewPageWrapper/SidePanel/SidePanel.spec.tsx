import { render } from '@testing-library/react'
import Typography from '@mui/material/Typography'
import { SidePanel } from '.'

describe('SidePanel', () => {
  it('should render title', () => {
    const { getByTestId } = render(
      <SidePanel
        title="S{ide Panel Title"
        styles={{
          toolbar: { variant: 'dense', height: 12 },
          bottomPanel: { height: 300 }
        }}
      >
        <Typography variant="h1">Side Panel</Typography>
      </SidePanel>
    )
    expect(getByTestId('side-header')).toHaveTextContent('Side Panel Title')
  })
})
