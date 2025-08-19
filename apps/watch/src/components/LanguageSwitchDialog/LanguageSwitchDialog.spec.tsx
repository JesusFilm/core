import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { WatchInitialState, WatchProvider } from '../../libs/watchContext'
import { TestWatchState } from '../../libs/watchContext/TestWatchState'

import { GET_ALL_LANGUAGES, LanguageSwitchDialog } from './LanguageSwitchDialog'

// Mock external dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
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

// Mock GraphQL response for getAllLanguages
const mockLanguagesData = [
  {
    id: '529',
    bcp47: 'en',
    slug: 'english',
    name: [{ primary: true, value: 'English', __typename: 'LanguageName' }],
    __typename: 'Language'
  },
  {
    id: '496',
    bcp47: 'es',
    slug: 'spanish',
    name: [{ primary: true, value: 'Spanish', __typename: 'LanguageName' }],
    __typename: 'Language'
  }
]

const getAllLanguagesResult = jest.fn()

const mockGetAllLanguages: MockedResponse<GetAllLanguages> = {
  request: { query: GET_ALL_LANGUAGES },
  result: getAllLanguagesResult
}

describe('LanguageSwitchDialog', () => {
  const mockHandleClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    getAllLanguagesResult.mockReturnValue({
      data: { languages: mockLanguagesData }
    })
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useTranslation as jest.Mock).mockReturnValue({ t: mockT })
  })

  describe('basic rendering', () => {
    it('should render dialog with all components', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    })
  })

  describe('component structure', () => {
    it('should render components in correct order with separators', () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
          </WatchProvider>
        </MockedProvider>
      )

      const dialog = screen.getByRole('dialog')

      // Verify horizontal rule separator exists
      const separator = dialog.querySelector('hr')
      expect(separator).toBeInTheDocument()

      // Verify dialog contains the main content structure
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('GraphQL integration', () => {
    it('should call getAllLanguages query and update state with SetAllLanguages dispatch', async () => {
      render(
        <MockedProvider mocks={[mockGetAllLanguages]} addTypename={false}>
          <WatchProvider initialState={defaultWatchState}>
            <LanguageSwitchDialog open={true} handleClose={mockHandleClose} />
            <TestWatchState />
          </WatchProvider>
        </MockedProvider>
      )

      // Verify the dialog renders
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Wait for the GraphQL query to be called
      await waitFor(() => {
        expect(getAllLanguagesResult).toHaveBeenCalled()
      })

      // Verify that the state shows the languages were loaded
      await waitFor(() => {
        expect(
          screen.getByText('allLanguages: 2 languages')
        ).toBeInTheDocument()
      })
    })
  })
})
