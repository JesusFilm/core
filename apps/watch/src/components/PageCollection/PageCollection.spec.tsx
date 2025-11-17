import { render, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { PlayerProvider } from '../../libs/playerContext'
import { useLanguages } from '../../libs/useLanguages'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { PageCollection } from './PageCollection'

jest.mock('../SectionVideoGrid', () => ({
  SectionVideoGrid: ({ primaryCollectionId, languageId }: any) => (
    <div
      data-testid="SectionVideoGrid"
      data-primary={primaryCollectionId}
      data-language={languageId ?? ''}
    />
  )
}))

jest.mock('../LanguageFilterDropdown', () => ({
  LanguageFilterDropdown: ({ onSelect, selectedValue }: any) => (
    <button
      type="button"
      data-testid="LanguageFilterDropdown"
      onClick={() => onSelect('spanish')}
    >
      {selectedValue}
    </button>
  )
}))

jest.mock('../../libs/useLanguages')

const mockUseLanguages = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

const collectionVideo: VideoContentFields = {
  ...videos[0],
  variant: null
}

const languages = [
  {
    id: 'language-1',
    slug: 'english',
    displayName: 'English',
    englishName: { id: '1', primary: true, value: 'English' },
    nativeName: { id: '1', primary: true, value: 'English' }
  },
  {
    id: 'language-2',
    slug: 'spanish',
    displayName: 'Spanish',
    englishName: { id: '2', primary: true, value: 'Spanish' },
    nativeName: { id: '2', primary: true, value: 'Español' }
  }
]

describe('PageCollection', () => {
  beforeEach(() => {
    mockUseLanguages.mockReturnValue({ languages, isLoading: false })
  })

  it('renders collection metadata and languages heading', async () => {
    await mockRouter.push('/watch/worth-episode-2.html/english.html')

    render(
      <SnackbarProvider>
        <PlayerProvider>
          <VideoProvider value={{ content: collectionVideo }}>
            <PageCollection />
          </VideoProvider>
        </PlayerProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('CollectionMetadata')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByTestId('LanguageFilterDropdown')).toHaveTextContent(
      'english'
    )
  })

  it('passes ids to SectionVideoGrid', async () => {
    await mockRouter.push('/watch/worth-episode-2.html/english.html')

    render(
      <SnackbarProvider>
        <PlayerProvider>
          <VideoProvider value={{ content: collectionVideo }}>
            <PageCollection />
          </VideoProvider>
        </PlayerProvider>
      </SnackbarProvider>
    )

    const grid = screen.getByTestId('SectionVideoGrid')
    expect(grid).toHaveAttribute('data-primary', collectionVideo.id)
    expect(grid).toHaveAttribute('data-language', 'language-1')
  })

  it('opens share dialog when share button clicked', async () => {
    await mockRouter.push('/watch/worth-episode-2.html/english.html')

    render(
      <SnackbarProvider>
        <PlayerProvider>
          <VideoProvider value={{ content: collectionVideo }}>
            <PageCollection />
          </VideoProvider>
        </PlayerProvider>
      </SnackbarProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: /share/i }))
    expect(screen.getByTestId('DialogShare')).toBeInTheDocument()
  })
})
