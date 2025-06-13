import { fireEvent, render, screen } from '@testing-library/react'

import { StateError } from './Error'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

describe('StateError', () => {
  const mockReload = jest.fn()
  const mockError = new Error('Test error message')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render error message and retry button when error exists', () => {
    render(<StateError error={mockError} reload={mockReload} />)

    expect(
      screen.getByText('An error occurred. Please try again.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('should return null when error is null', () => {
    const { container } = render(
      <StateError error={undefined} reload={mockReload} />
    )

    expect(container).toBeEmptyDOMElement()
    expect(
      screen.queryByText('An error occurred. Please try again.')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument()
  })

  it('should return null when error is undefined', () => {
    const { container } = render(
      <StateError error={undefined} reload={mockReload} />
    )

    expect(container).toBeEmptyDOMElement()
    expect(
      screen.queryByText('An error occurred. Please try again.')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument()
  })

  it('should call reload when retry button is clicked', () => {
    render(<StateError error={mockError} reload={mockReload} />)

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(mockReload).toHaveBeenCalledTimes(1)
  })
})
