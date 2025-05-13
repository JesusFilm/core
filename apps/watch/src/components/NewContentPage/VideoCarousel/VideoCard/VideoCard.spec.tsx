import { render, screen } from '@testing-library/react'

import { VideoCard } from './VideoCard'
import { videos } from '../../../Videos/__generated__/testData'

describe('VideoCard', () => {
  it('renders the component with video data correctly', () => {
    render(<VideoCard video={videos[0]} active={false} />)

    expect(screen.getByText('JESUS')).toBeInTheDocument()
    expect(screen.getByText('Feature Film')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'JESUS')
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
    )
  })

  it('should have active styles when active is true', () => {
    render(<VideoCard video={videos[0]} active />)

    const card = screen.getByTestId('ActiveLayer')
    expect(card).toHaveStyle('box-shadow: inset 0 0 0 4px #fff')
  })

  it('has proper accessibility attributes', () => {
    render(<VideoCard video={videos[0]} active={false} />)

    const card = screen.getByTestId(`CarouselItem-${videos[0].slug}`)
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-label', `Navigate to ${videos[0].slug}`)
  })
})
