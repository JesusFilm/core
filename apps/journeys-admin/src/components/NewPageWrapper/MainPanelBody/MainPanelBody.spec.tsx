import { render } from '@testing-library/react'
import Typography from '@mui/material/Typography'
import { MainPanelBody } from '.'

describe('MainPanelBody', () => {
  it('should render bottom panel children', () => {
    const { getByTestId } = render(
      <MainPanelBody
        bottomPanelChildren={<div>Bottom Panel</div>}
        styles={{
          toolbar: { variant: 'dense', height: 12 },
          bottomPanel: { height: 300 }
        }}
      >
        <Typography variant="h1">Child</Typography>
      </MainPanelBody>
    )
    expect(getByTestId('bottom-panel')).toHaveTextContent('Bottom Panel')
  })
})
