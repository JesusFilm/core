import { render } from '@testing-library/react'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { PlaylistHero } from '.'

describe('PlaylistHero', () => {
  const defaultVideo = {
    label: VideoLabel.collection,
    title: [{ value: 'Collection video title' }],
    children: [1, 2, 3],
    image:
      'https://images.unsplash.com/photo-1669569713869-ff4a427a38ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3774&q=80'
  } as unknown as Video

  const seriesVideo = {
    ...defaultVideo,
    label: VideoLabel.series,
    title: [{ value: 'Series video title' }]
  } as unknown as Video

  it('should render hero for a collection', () => {
    const { getByText } = render(<PlaylistHero video={defaultVideo} />)

    expect(getByText('collection')).toBeInTheDocument()
  })

  it('should render hero for a series', () => {
    const { getByText } = render(<PlaylistHero video={seriesVideo} />)

    expect(getByText('series')).toBeInTheDocument()
  })
})
