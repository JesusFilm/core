import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../libs/VideoProvider'

import { Metadata } from './Metadata'

describe('Metadata', () => {
  const mockAdminVideo: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  it('should render with data', () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockAdminVideo}>
            <Metadata video={mockAdminVideo} />
          </VideoProvider>
        </MockedProvider>
      
    )

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Short Description')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Study Questions')).toBeInTheDocument()
  })
})
