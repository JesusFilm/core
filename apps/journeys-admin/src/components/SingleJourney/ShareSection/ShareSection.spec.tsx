import { render, fireEvent, waitFor } from '@testing-library/react'
import { ShareSection } from '.'

describe('ShareSection', () => {
  it('should render with the heading', () => {
    const { getByText } = render(<ShareSection slug={'my-journey'} />)
    expect(getByText('Journey URL')).toBeInTheDocument()
  })

  it('should, have the correct sharing url', () => {
    const { getByRole } = render(<ShareSection slug={'my-journey'} />)
    expect(getByRole('textbox')).toHaveAttribute(
      'value',
      'https://your.nextstep.is/my-journey'
    )
  })

  it('should have correct url for the edit button', () => {
    const { getByRole, getAllByRole } = render(
      <ShareSection slug={'my-journey'} />
    )
    fireEvent.click(getAllByRole('button')[1])
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
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

    const { getByRole, getAllByRole, getByText } = render(
      <ShareSection slug={'my-journey'} />
    )
    fireEvent.click(getAllByRole('button')[1])
    fireEvent.click(getByRole('menuitem', { name: 'Copy' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://your.nextstep.is/my-journey'
      )
    })
    expect(getByText('Link Copied')).toBeInTheDocument()
  })
})
