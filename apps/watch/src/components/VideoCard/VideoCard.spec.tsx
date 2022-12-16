import { render } from '@testing-library/react'
import { videos } from '../Videos/testData'
import { VideoCard } from '.'

describe('VideoCard', () => {
  describe('video contained', () => {
    it('displays image', () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      const img = getByRole('img')
      expect(img).toHaveAttribute('src', videos[0].image)
      expect(img).toHaveAttribute('alt', videos[0].title[0].value)
    })

    it('sets link to video url', () => {
      const { getByRole } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/${videos[0].variant?.slug as string}`
      )
    })

    it('sets link to video url with container slug', () => {
      const { getByRole } = render(
        <VideoCard
          video={videos[0]}
          variant="contained"
          containerSlug="jesus"
        />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/jesus/${videos[0].variant?.slug as string}`
      )
    })

    it('sets link to video url without container slug when collection', () => {
      const { getByRole } = render(
        <VideoCard
          video={videos[9]}
          variant="contained"
          containerSlug="jesus"
        />
      )
      expect(getByRole('link')).toHaveAttribute(
        'href',
        `/${videos[9].variant?.slug as string}`
      )
    })

    it('displays feature film', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="contained" />
      )
      expect(getByText('JESUS')).toBeInTheDocument()
      expect(getByText('Feature Film')).toHaveStyle('color: #FF9E00')
      expect(getByText('61 chapters')).toBeInTheDocument()
    })

    it('displays segment', () => {
      const { getByText } = render(
        <VideoCard video={videos[2]} variant="contained" />
      )
      expect(getByText('Jesus Calms the Storm')).toBeInTheDocument()
      expect(getByText('Chapter')).toHaveStyle('color: #7283BE')
      expect(getByText('1:59')).toBeInTheDocument()
    })

    it('displays series', () => {
      const { getByText } = render(
        <VideoCard video={videos[5]} variant="contained" />
      )
      expect(getByText('Reflections of Hope')).toBeInTheDocument()
      expect(getByText('Series')).toHaveStyle('color: #3AA74A')
      expect(getByText('7 episodes')).toBeInTheDocument()
    })

    it('displays episode', () => {
      const { getByText } = render(
        <VideoCard video={videos[6]} variant="contained" />
      )
      expect(getByText('Day 6: Jesus Died for Me')).toBeInTheDocument()
      expect(getByText('Episode')).toHaveStyle('color: #7283BE')
      expect(getByText('8:08')).toBeInTheDocument()
    })

    it('displays collection', () => {
      const { getByText } = render(
        <VideoCard video={videos[9]} variant="contained" />
      )
      expect(getByText('LUMO')).toBeInTheDocument()
      expect(getByText('Collection')).toHaveStyle('color: #FF9E00')
      expect(getByText('4 items')).toBeInTheDocument()
    })

    it('displays short film', () => {
      const { getByText } = render(
        <VideoCard video={videos[12]} variant="contained" />
      )
      expect(getByText('Chosen Witness')).toBeInTheDocument()
      expect(getByText('Short Film')).toHaveStyle('color: #FF9E00')
      expect(getByText('9:26')).toBeInTheDocument()
    })

    it('displays playing now', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="contained" active />
      )
      expect(getByText('Playing now')).toBeInTheDocument()
    })
  })

  describe('video expanded', () => {
    it('shows label with count', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="expanded" index={0} />
      )
      expect(getByText('Feature Film 1')).toBeInTheDocument()
    })

    it('shows title', () => {
      const { getByText } = render(
        <VideoCard video={videos[0]} variant="expanded" index={0} />
      )
      expect(getByText('JESUS')).toBeInTheDocument()
    })
  })

  describe('no video', () => {
    it('displays placeholders when contained', async () => {
      const { getByTestId, queryByTestId } = render(
        <VideoCard variant="contained" />
      )
      expect(getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoLabelSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoVariantDurationSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelIndexSkeleton')).not.toBeInTheDocument()
    })

    it('displays placeholders when expanded', async () => {
      const { getByTestId, queryByTestId } = render(
        <VideoCard variant="expanded" />
      )
      expect(getByTestId('VideoImageSkeleton')).toBeInTheDocument()
      expect(getByTestId('VideoTitleSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelSkeleton')).not.toBeInTheDocument()
      expect(getByTestId('VideoVariantDurationSkeleton')).toBeInTheDocument()
      expect(queryByTestId('VideoLabelIndexSkeleton')).not.toBeInTheDocument()
    })

    it('should display placeholder when expanded with index', async () => {
      const { getByTestId } = render(<VideoCard variant="expanded" index={0} />)
      expect(getByTestId('VideoLabelIndexSkeleton')).toBeInTheDocument()
    })

    it('should set link pointer-events to none', async () => {
      const { getByRole } = render(<VideoCard variant="contained" />)
      expect(getByRole('link')).toHaveStyle('pointer-events: none')
    })
  })
})
