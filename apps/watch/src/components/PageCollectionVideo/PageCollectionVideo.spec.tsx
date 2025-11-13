import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { videos } from '../Videos/__generated__/testData'

import { PageCollectionVideo } from './PageCollectionVideo'

jest.mock('../../libs/useVideoChildren/useVideoChildren', () => ({
  ...jest.requireActual('../../libs/useVideoChildren/useVideoChildren'),
  useVideoChildren: jest.fn()
}))

jest.mock('../../libs/useLanguages', () => ({
  useLanguages: () => ({
    languages: [
      {
        id: '529',
        slug: 'english',
        displayName: 'English',
        name: { id: '1', primary: true, value: 'English' },
        englishName: { id: '1', primary: true, value: 'English' },
        nativeName: { id: '1', primary: true, value: 'English' }
      }
    ],
    isLoading: false
  })
}))

jest.mock('../SectionVideoGrid', () => ({
  SectionVideoGrid: ({ primaryCollectionId }: { primaryCollectionId: string }) => (
    <div data-testid="SectionVideoGrid">{primaryCollectionId}</div>
  )
}))

const mockUseVideoChildren = useVideoChildren as jest.MockedFunction<
  typeof useVideoChildren
>

const initialWatchState = {
  audioLanguageId: '529',
  subtitleLanguageId: '529',
  subtitleOn: true,
  videoAudioLanguageIds: ['529'],
  videoSubtitleLanguageIds: ['529']
}

describe('PageCollectionVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseVideoChildren.mockReturnValue({
      children: [],
      loading: false
    })
  })

  it('renders collection metadata and grid', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageCollectionVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
    expect(screen.getByTestId('SectionVideoGrid')).toHaveTextContent(videos[0].id)
  })
})
