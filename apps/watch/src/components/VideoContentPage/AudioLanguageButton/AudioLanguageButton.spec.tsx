import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

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

  it('displays correct language name from locale mapping', () => {
    mockGetCookie.mockReturnValue('es')

    const { getByText } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )

    expect(getByText('Español')).toBeInTheDocument()
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
      expect(
        getByRole('dialog', { name: 'Language Settings' })
      ).toBeInTheDocument()
    )
  })

  it('renders audio language as an icon', async () => {
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="icon" />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('LanguageOutlinedIcon'))
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Language Settings' })
      ).toBeInTheDocument()
    )
  })
})
