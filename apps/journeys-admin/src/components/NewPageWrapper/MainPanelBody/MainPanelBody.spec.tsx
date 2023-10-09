import Typography from '@mui/material/Typography'
import { render } from '@testing-library/react'

import { MainPanelBody } from '.'

describe('MainPanelBody', () => {
  it('should render bottom panel children', () => {
    const { getByTestId } = render(
      <MainPanelBody bottomPanelChildren={<div>Bottom Panel</div>}>
        <Typography variant="h1">Child</Typography>
      </MainPanelBody>
    )
    expect(getByTestId('bottom-panel')).toHaveTextContent('Bottom Panel')
  })

  it('should render the main body with a background color', () => {
    const { getByTestId } = render(
      <MainPanelBody backgroundColor="background.paper">
        <Typography variant="h1">Child</Typography>
      </MainPanelBody>
    )
    expect(getByTestId('main-body')).toHaveStyle({
      backgroundColor: '#FFFFFF'
    })
  })
})
