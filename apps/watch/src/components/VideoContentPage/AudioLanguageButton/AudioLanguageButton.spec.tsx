import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { AudioLanguageButton } from '.'

// Mock the cookie handler
jest.mock('../../../libs/cookieHandler', () => ({
  getCookie: jest.fn()
}))

const mockGetCookie = jest.mocked(
  require('../../../libs/cookieHandler').getCookie
)

describe('AudioLanguageButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('falls back to English when no cookie is found', () => {
    mockGetCookie.mockReturnValue(undefined)

    const { getByText } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )

    expect(getByText('English')).toBeInTheDocument()
  })

  it('renders audio language as a button', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    )
  })

  it('renders audio language as an icon', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="icon" />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('LanguageOutlinedIcon'))
    await waitFor(() =>
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    )
  })
})
