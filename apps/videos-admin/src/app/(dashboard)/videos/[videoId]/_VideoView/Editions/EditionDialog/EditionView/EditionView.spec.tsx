import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { EditionView } from './EditionView'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]

describe('EditionView', () => {
  it('should render with subtitles', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditionView edition={mockEdition} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'New Subtitle' })
    ).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('should render with no subtitles', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditionView edition={{ ...mockEdition, videoSubtitles: [] }} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No subtitles')).toBeInTheDocument()
  })

  it('should show the subtitle create dialog', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[]}>
            <EditionView edition={mockEdition} />
          </MockedProvider>
        </VideoProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'New Subtitle' }))

    await waitFor(() => {
      expect(screen.getByText('Create Subtitle')).toBeInTheDocument()
    })
  })
})
