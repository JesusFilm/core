import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { useRouter } from 'next/router'
import { SWRConfig } from 'swr'

import { server } from '../../../test/mswServer'
import { WatchInitialState, WatchProvider } from '../../libs/watchContext'

import { LanguageSwitchDialog } from './LanguageSwitchDialog'
import { I18nextProvider } from 'react-i18next'
import { makeI18n } from '../../../test/i18n'

// Mock external dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  pathname: '/watch/video123',
  query: { id: 'video123' },
  asPath: '/watch/video123'
}

// Default watch context state
const defaultWatchState: WatchInitialState = {
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: false,
  videoId: 'video123'
}

const TestSWRConfig: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SWRConfig
    value={{
      provider: () => new Map(), // isolate cache
      dedupingInterval: 0, // simplify timing
      revalidateOnFocus: false, // avoid focus-triggered refetch
      revalidateOnReconnect: false,
      refreshInterval: 0
    }}
  >
    {children}
  </SWRConfig>
)

describe('LanguageSwitchDialog', () => {
  const mockHandleClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  describe('basic rendering', () => {
    it('should render dialog with all components', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    })

    it('should render close button with proper accessibility', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog')
    })
  })

  describe('user interactions', () => {
    it('should call handleClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockHandleClose).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should render components in correct order', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      const dialog = screen.getByRole('dialog')

      // Verify dialog contains the main content structure
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('language rendering', () => {
    it('should call api/languages query and render in english', async () => {
      server.use(
        http.get('/api/languages', () =>
          HttpResponse.json([
            ['529:en:English', '639:Inglés', "496:l'anglais"],
            ['639:es:Español', '529:Spanish', "496:l'espagnol"],
            ['496:fr:Français', '529:French', '639:francés'],
            ['134:ma:', '529:Maori']
          ])
        )
      )
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      await waitFor(() => {
        expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
      })

      const audioTrackSelect = screen.getAllByRole('combobox')[0]
      await userEvent.click(audioTrackSelect)

      await waitFor(() => {
        const [english, french, maori, spanish] = screen.getAllByRole('option')
        expect(english).toHaveTextContent('English')
        expect(french).toHaveTextContent('FrenchFrançais')
        expect(maori).toHaveTextContent('Maori')
        expect(spanish).toHaveTextContent('SpanishEspañol')
      })
    })

    it('should call api/languages query and render in french', async () => {
      server.use(
        http.get('/api/languages', () =>
          HttpResponse.json([
            ['529:en:English', '639:Inglés', "496:l'anglais"],
            ['639:es:Español', '529:Spanish', "496:l'espagnol"],
            ['496:fr:Français', '529:French', '639:francés'],
            ['134:ma:Maori', '529:Maori']
          ])
        )
      )
      const i18n = await makeI18n('fr')
      render(
        <I18nextProvider i18n={i18n}>
          <MockedProvider mocks={[]} addTypename={false}>
            <WatchProvider initialState={defaultWatchState}>
              <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
            </WatchProvider>
          </MockedProvider>
        </I18nextProvider>,
        {
          wrapper: TestSWRConfig
        }
      )

      await waitFor(() => {
        expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
      })

      const audioTrackSelect = screen.getAllByRole('combobox')[0]
      await userEvent.click(audioTrackSelect)

      await waitFor(() => {
        const [french, english, spanish, maori] = screen.getAllByRole('option')
        expect(french).toHaveTextContent('Français')
        expect(english).toHaveTextContent("l'anglaisEnglish")
        expect(spanish).toHaveTextContent("l'espagnolEspañol")
        expect(maori).toHaveTextContent('Maori')
      })
    })
  })
})
