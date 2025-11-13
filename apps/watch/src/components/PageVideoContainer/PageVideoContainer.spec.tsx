import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { PlayerProvider } from '../../libs/playerContext'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { PageVideoContainer } from '.'

jest.mock('../ContentHeader', () => ({
  ContentHeader: ({ languageSlug }: { languageSlug?: string }) => (
    <div data-testid="ContentHeader" data-language={languageSlug ?? ''} />
  )
}))

jest.mock('./AudioLanguageSelect', () => ({
  AudioLanguageSelect: () => <div data-testid="AudioLanguageSelect" />
}))

jest.mock('../DialogShare', () => ({
  DialogShare: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Share this video" /> : null
}))

function renderPage({
  content = videos[0],
  mocks = []
}: {
  content?: (typeof videos)[number]
  mocks?: Parameters<typeof MockedProvider>[0]['mocks']
} = {}): void {
  render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <PlayerProvider>
          <VideoProvider value={{ content }}>
            <PageVideoContainer />
          </VideoProvider>
        </PlayerProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('PageVideoContainer', () => {
  it('renders hero cover with content header', () => {
    renderPage()

    expect(screen.getByTestId('ContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('CollectionHero')).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: videos[0].title[0].value })
    ).not.toHaveLength(0)
  })

  it('shows the collection snippet inside the blurred content area', () => {
    renderPage()

    expect(screen.getByTestId('CollectionDescription')).toHaveTextContent(
      videos[0].snippet[0].value
    )
  })

  it('opens the share dialog when share is clicked', () => {
    renderPage()

    const shareButton = screen.getAllByRole('button', { name: 'Share' })[0]
    fireEvent.click(shareButton)
    expect(
      screen.getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  it('renders the audio language select control', () => {
    renderPage()

    expect(screen.getByTestId('AudioLanguageSelect')).toBeInTheDocument()
  })

  it('displays children returned from the video children query', async () => {
    renderPage({ mocks: [getVideoChildrenMock] })

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Reflections of Hope' })
      ).toBeInTheDocument()
    )
  })
})
