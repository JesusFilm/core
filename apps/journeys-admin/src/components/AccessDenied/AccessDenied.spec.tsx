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

  it('should show back button', () => {
    const { getByRole } = render(
      <AccessDenied title="title" description="description" />
    )

    expect(
      getByRole('link', { name: 'Back to the Admin Panel' })
    ).toHaveAttribute('href', '/')
  })
})
