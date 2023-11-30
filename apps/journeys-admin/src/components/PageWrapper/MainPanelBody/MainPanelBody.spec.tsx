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
})
