import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../_EditProvider'

import { VideoView } from './VideoView'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>

describe('VideoView', () => {
  it('should get video details', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })

    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider>
            <VideoView />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      screen.getByRole('heading', { level: 4, name: 'JESUS' })
    ).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'JESUS' })).toBeInTheDocument()
  })

  it('should toggle edit mode', () => {})
})
