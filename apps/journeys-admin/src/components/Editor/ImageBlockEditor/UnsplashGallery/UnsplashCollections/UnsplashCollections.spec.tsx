import { fireEvent, render } from '@testing-library/react'

import { UnsplashCollections } from './UnsplashCollections'

describe('UnsplashCollections', () => {
  it('should call onClick when a chip is clicked', () => {
    const onClick = jest.fn()
    const { getByText, getByRole } = render(
      <UnsplashCollections onClick={onClick} />
    )

    const christChip = getByRole('button', { name: 'Christ' })
    expect(christChip).toBeInTheDocument()
    expect(getByText('Church')).toBeInTheDocument()
    fireEvent.click(christChip)
    expect(onClick).toHaveBeenCalledWith('5TziIavS84o', 'Christ')
  })
})
