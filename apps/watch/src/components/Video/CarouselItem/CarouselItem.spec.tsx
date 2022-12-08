import { fireEvent, render, waitFor } from '@testing-library/react'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { CarouselItem } from './CarouselItem'

const onClick = jest.fn()

const chapter1: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.segment,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter2: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.collection,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter3: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.episode,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter4: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.series,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter5: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.featureFilm,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

const chapter6: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.shortFilm,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'the-beginning/english'
  },
  slug: 'the-beginning',
  children: []
}

describe('carouselItem', () => {
  it('should have correct alt text', async () => {
    const { getAllByAltText } = render(
      <VideoProvider
        value={{
          content: chapter1,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getAllByAltText('The Beginning')[0]).toBeInTheDocument()
    })
  })
  it('should have onClick called', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: chapter1,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      fireEvent.click(getByText('Play Now'))
      expect(onClick).toHaveBeenCalled()
    })
  })
  it('should display chapter label for segement', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: chapter1,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Chapter 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for collection', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: chapter2,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for episode', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: chapter3,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should display episode label for series', async () => {
    const { getByText } = render(
      <VideoProvider
        value={{
          content: chapter4,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(getByText('Episode 4')).toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for featureFilm', async () => {
    const { queryByText } = render(
      <VideoProvider
        value={{
          content: chapter5,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
  it('should not display episode or chapter label for shortFilm', async () => {
    const { queryByText } = render(
      <VideoProvider
        value={{
          content: chapter6,
          container: videos[0]
        }}
      >
        <CarouselItem index={4} isPlaying={false} onClick={onClick} />
      </VideoProvider>
    )
    await waitFor(() => {
      expect(queryByText('Episode 4')).not.toBeInTheDocument()
      expect(queryByText('Chapter 4')).not.toBeInTheDocument()
    })
  })
})
