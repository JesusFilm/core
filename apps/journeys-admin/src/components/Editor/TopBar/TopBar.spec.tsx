import { render } from '@testing-library/react'
import { TopBar } from '.'

describe('TopBar', () => {
  it('should render title', () => {
    const { getByText } = render(
      <TopBar
        title="NUA Journey: Ep.3 - Decision"
        slug="nua-journey-ep-3-decision"
      />
    )
    expect(getByText('NUA Journey: Ep.3 - Decision')).toBeInTheDocument()
  })

  it('should render link to journey show page', () => {
    const { getByRole } = render(
      <TopBar
        title="NUA Journey: Ep.3 - Decision"
        slug="nua-journey-ep-3-decision"
      />
    )
    expect(getByRole('link', { name: 'back' })).toHaveAttribute(
      'href',
      '/journeys/nua-journey-ep-3-decision'
    )
  })
})
