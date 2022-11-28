import { render } from '@testing-library/react'
import { videos } from '../../Videos/testData'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { PlaylistHero } from '.'

describe('PlaylistHero', () => {
  const video = { ...videos[0], episodes: {} } as unknown as Video
  it('should render hero for a collection', () => {
    const { getByText } = render(<PlaylistHero video={video} />)

    expect(getByText('collection')).toBeInTheDocument()
  })

  // TODO: bring back once we can find difference between series and collection
  it.skip('should render hero for a series', () => {
    const { getByText } = render(<PlaylistHero video={video} />)

    expect(getByText('series')).toBeInTheDocument()
  })
})
