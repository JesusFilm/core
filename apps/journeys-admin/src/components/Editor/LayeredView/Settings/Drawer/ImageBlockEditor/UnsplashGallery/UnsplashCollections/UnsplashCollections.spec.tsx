import { fireEvent, render, screen } from '@testing-library/react'

import { UnsplashCollections } from './UnsplashCollections'

describe('UnsplashCollections', () => {
  it('should call onClick when a chip is clicked', () => {
    const onClick = jest.fn()
    render(<UnsplashCollections onClick={onClick} />)

    const christChip = screen.getByRole('button', { name: 'Christ' })
    expect(christChip).toBeInTheDocument()
    expect(screen.getByText('Church')).toBeInTheDocument()
    fireEvent.click(christChip)
    expect(onClick).toHaveBeenCalledWith('5TziIavS84o')
  })
})
