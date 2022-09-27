import { render, fireEvent } from '@testing-library/react'
import { AccessDenied } from './AccessDenied'

describe('AccessDenied', () => {
  it('should handle onClick', () => {
    const onClick = jest.fn()
    const { getByText, getByRole } = render(
      <AccessDenied title="title" description="description" onClick={onClick} />
    )

    expect(getByText('title')).toBeInTheDocument()
    expect(getByText('description')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Request Access' }))
    expect(onClick).toHaveBeenCalled()
  })
})
