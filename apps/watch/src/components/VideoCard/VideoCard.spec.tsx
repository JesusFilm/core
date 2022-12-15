import { render } from '@testing-library/react'
import { videos } from '../Videos/testData'
import { VideoCard } from '.'

describe('VideoCard', () => {
  describe('video', () => {
    it('should display image', async () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      expect(getByRole('img')).toHaveAttribute('src', videos[0].image)
    })

    it('should set link to video url', async () => {
      const { getByRole } = render(<VideoCard video={videos[0]} />)
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/${videos[0].variant?.slug as string}`
      )
    })

    it('should set link to video url with container slug', async () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} containerSlug="jesus" />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/jesus/${videos[0].variant?.slug as string}`
      )
    })
  })
  describe('no video', () => {
    it('should display placeholder', async () => {
      const { getByTestId } = render(<VideoCard />)
      expect(getByTestId('MuiImageBackground-loading')).toBeInTheDocument()
    })

    it('should set link pointer-events to none', async () => {
      const { getByRole } = render(<VideoCard />)
      expect(getByRole('link')).toHaveStyle('pointer-events: none')
    })
  })
})
