import { render, fireEvent } from '@testing-library/react'
import ShareSection from '.'

describe('JourneyShare', () => {
  it('should render with the heading', () => {
    const { getByText } = render(<ShareSection slug={'my-journey'} />)
    expect(getByText('Journey Link')).toBeInTheDocument()
  })

  it('should, have the correct sharing url', () => {
    const { getByRole } = render(<ShareSection slug={'my-journey'} />)
    expect(getByRole('textbox')).toHaveAttribute(
      'value',
      '/journeys/my-journey'
    )
  })

  it('should have open menu on click', () => {
    const { getByRole } = render(<ShareSection slug={'my-journey'} />)
    expect(getByRole('button')).toHaveAttribute(
      'aria-controls',
      'share-actions'
    )
    expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(getByRole('button'))

    expect(getByRole('menu')).toHaveAttribute(
      'aria-labelledby',
      'share-actions'
    )
  })

  it('should have menu links to the the correct address', () => {
    const { getByRole, getByText } = render(
      <ShareSection slug={'my-journey'} />
    )
    fireEvent.click(getByRole('button'))
    expect(getByText('Change Link')).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
    )
  })
})
