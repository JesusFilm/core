import { render } from '@testing-library/react'
import { VideoType } from '../../../../__generated__/globalTypes'
import { SimpleHero } from '.'

const episode = {
  id: '1_fj_1-0-0',
  __typename: 'Video',
  type: VideoType.standalone,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicHigh.jpg',
  imageAlt: [
    {
      value: 'image',
      __typename: 'Translation'
    }
  ],
  snippet: [
    {
      value:
        "A few men in the village walk and talk. The JESUS film has been shown in their village and it's made an impression. One man keeps remembering how Jesus brought the daughter of Jairus from death to life.",
      __typename: 'Translation'
    }
  ],
  title: [
    {
      value: 'Who is God',
      __typename: 'Translation'
    }
  ],
  variant: {
    duration: 1079,
    __typename: 'VideoVariant',
    hls: 'https://arc.gt/qjqeh'
  },
  episodeIds: [''],
  slug: [
    {
      value: 'who-is-god',
      __typename: 'Translation'
    }
  ]
}

const video = {
  id: '1_fj-0-0',
  type: VideoType.playlist,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
  title: [
    {
      value: 'Following Jesus (India)',
      __typename: 'Translation'
    }
  ],
  variant: { duration: 0, __typename: 'VideoVariant', hls: null },
  __typename: 'Video',
  slug: [
    {
      value: 'following-jesus-india',
      __typename: 'Translation'
    }
  ],
  description: [
    {
      value: 'description',
      __typename: 'Translation'
    }
  ],
  episodes: [episode, episode, episode],
  variantLanguages: [
    {
      __typename: 'Language',
      id: '1171',
      name: [{ __typename: 'Translation', value: 'Assamese' }]
    }
  ]
}

describe('SimpleHero', () => {
  it('should render SimpleHero', () => {
    const { getByRole } = render(<SimpleHero video={video} loading={false} />)
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_fj_1-0-0.mobileCinematicHigh.jpg'
    )
  })
})
