import { render, fireEvent, waitFor } from '@testing-library/react'
import ShareSection from '.'

describe('JourneyShare', () => {
  it('should render with the heading', () => {
    const { getByText } = render(<ShareSection slug={'my-journey'} />)
    expect(getByText('Journey URL')).toBeInTheDocument()
  })

  it('should, have the correct sharing url', () => {
    const { getByRole } = render(<ShareSection slug={'my-journey'} />)
    expect(getByRole('textbox')).toHaveAttribute(
      'value',
      '/journeys/my-journey'
    )
  })

  it('should handle copy link on icon click', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {
          return null
        }
      }
    })

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <ShareSection slug={'my-journey'} />
    )
    fireEvent.click(getByRole('button', { name: 'Copy' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '/journeys/my-journey'
      )
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
  })
})
