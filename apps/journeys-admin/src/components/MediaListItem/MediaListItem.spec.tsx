import { render } from '@testing-library/react'

import { MediaListItem } from './MediaListItem'

describe('MediaListItem', () => {
  it('should render content', async () => {
    const { getByRole } = render(
      <MediaListItem
        image="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg"
        title="Heading"
        description="Description"
        overline="Overline"
        href="/href"
      />
    )

    expect(getByRole('link')).toHaveTextContent('OverlineHeadingDescription')
  })

  it('should have link', () => {
    const { getByRole } = render(
      <MediaListItem
        image="https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg"
        title="Heading"
        description="Description"
        href="/href"
      />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/href')
  })

  it('should show placeholder when no image', () => {
    const { getByTestId } = render(
      <MediaListItem title="Heading" description="Description" href="/href" />
    )
    expect(getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })
})
