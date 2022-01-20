import { render } from '@testing-library/react'
import { AppBar } from './AppBar'

describe('AppBar', () => {
  it('should show title', () => {
    const { getByText } = render(<AppBar title="Journeys" />)
    expect(getByText('Journeys')).toBeInTheDocument()
  })

  it('should show back button', () => {
    const { getByRole } = render(<AppBar title="Journeys" backHref="/" />)
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show custom menu', () => {
    const { getByText } = render(
      <AppBar title="Journeys" Menu={<>Custom Content</>} />
    )
    expect(getByText('Custom Content')).toBeInTheDocument()
  })
})
