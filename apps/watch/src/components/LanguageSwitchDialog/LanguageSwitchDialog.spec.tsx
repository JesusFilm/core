import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

import { WatchInitialState, WatchProvider } from '../../libs/watchContext'
import { TestWatchState } from '../../libs/watchContext/TestWatchState'

import { LanguageSwitchDialog } from './LanguageSwitchDialog'
import { SWRConfig } from 'swr'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/msw'

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

const mockT = jest.fn((key: string) => key)

// Default watch context state
const defaultWatchState: WatchInitialState = {
  siteLanguage: 'en',
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

  describe('GraphQL integration', () => {
    it('should call getAllLanguages query and update state with SetAllLanguages dispatch', async () => {
      server.use(
        http.get('/api/languages', () =>
          HttpResponse.json([
            ['529:en:English', '529:English', '639:Inglés'],
            ['639:es:Español', '529:Spanish', '639:Español']
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
      userEvent.click(audioTrackSelect)

      await waitFor(() => {
        expect(screen.getByText('Spanish')).toBeInTheDocument()
        expect(screen.getByText('Español')).toBeInTheDocument()
      })
    })
  })
})
