import { render, fireEvent } from '@testing-library/react'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import JourneyCardMenu from '.'

describe('JourneyCardMenu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <JourneyCardMenu
        status={JourneyStatus.published}
        slug={'published-journey'}
      />
    )

    expect(getByRole('button')).toHaveAttribute(
      'aria-controls',
      'journey-actions'
    )
    expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toHaveAttribute(
      'aria-labelledby',
      'journey-actions'
    )
  })
  it('should handle edit journey', () => {
    const { getByRole } = render(
      <JourneyCardMenu
        status={JourneyStatus.published}
        slug={'published-journey'}
      />
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/published-journey/edit'
    )
  })
  it('should handle preview', () => {
    const { getByRole } = render(
      <JourneyCardMenu
        status={JourneyStatus.published}
        slug={'published-journey'}
      />
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'href',
      'https://your.NextStep.is/published-journey'
    )
  })

  it('should have a disabled preview button is journey is draft', () => {
    const { getByRole } = render(
      <JourneyCardMenu status={JourneyStatus.draft} slug={'draft-journey'} />
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled'
    )
  })
})
