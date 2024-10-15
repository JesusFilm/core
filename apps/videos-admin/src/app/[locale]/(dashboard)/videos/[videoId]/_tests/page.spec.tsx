import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import VideoViewPage from '../page'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>

describe('VideoViewPage', () => {
  it('should display video view component', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })

    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <VideoViewPage />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByTestId('VideoView')).toBeInTheDocument()
  })
})
