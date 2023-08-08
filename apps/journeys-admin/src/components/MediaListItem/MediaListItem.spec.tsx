import { fireEvent, render } from '@testing-library/react'

import { MediaListItem } from './MediaListItem'

describe('MediaListItem', () => {
  const onClick = jest.fn()

  it('should render content', async () => {
    const { getByRole } = render(
      <MediaListItem
        image="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg"
        title="Heading"
        description="Description"
        overline="Overline"
        onClick={onClick}
        duration="2:34"
      />
    )

    expect(getByRole('button')).toHaveTextContent(
      '2:34OverlineHeadingDescription'
    )
  })

  it('should call onClick on button click', () => {
    const { getByRole } = render(
      <MediaListItem
        image="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg"
        title="Heading"
        description="Description"
        onClick={onClick}
      />
    )
    fireEvent.click(getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })

  it('should hide image and text if loading', () => {
    const { getByRole, getByTestId } = render(
      <MediaListItem
        image="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg"
        title="Heading"
        description="Description"
        loading
        overline="Overline"
        onClick={onClick}
        duration="2:34"
      />
    )

    expect(getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    expect(getByRole('button')).toHaveTextContent('')
    expect(getByTestId('image-placeholder')).toBeInTheDocument()
  })
})
