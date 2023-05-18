import { render } from '@testing-library/react'
import { VisitorToolbar } from './VisitorToolbar'

describe('VisitorToolbar', () => {
  it('should not render the component in desktop viewport', () => {
    const { getByRole } = render(<VisitorToolbar />)
    const filterIcon = getByRole('button', { name: /filter/i })
    expect(filterIcon).toBeInTheDocument()
    expect(filterIcon).toBeVisible()

    expect(getByRole('button')).toBeInTheDocument()
  })
})
