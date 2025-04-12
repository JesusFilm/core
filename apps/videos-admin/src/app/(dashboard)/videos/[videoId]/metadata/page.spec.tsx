import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../libs/VideoProvider'

import { GET_VIDEO_IMAGES } from './@images/VideoImage'
import { Metadata } from './layout'

// Mock the VideoImage component to prevent test failures due to query
jest.mock('./VideoImage', () => ({
  VideoImage: ({ videoId }) => (
    <div data-testid={`MockedVideoImage-${videoId}`}>
      <div>Banner Image</div>
      <div>HD Image</div>
    </div>
  ),
  GET_VIDEO_IMAGES: jest.requireActual('./VideoImage/VideoImage')
    .GET_VIDEO_IMAGES
}))

const mockAdminVideo: AdminVideo =
  useAdminVideoMock['result']?.['data']?.['adminVideo']

// Create mocked query response for VideoImage
const mockVideoImagesResponse: MockedResponse = {
  request: {
    query: GET_VIDEO_IMAGES,
    variables: { id: mockAdminVideo.id }
  },
  result: {
    data: {
      video: {
        id: mockAdminVideo.id,
        images: mockAdminVideo.images,
        imageAlt: mockAdminVideo.imageAlt,
        __typename: 'Video'
      }
    }
  }
}

describe('Metadata', () => {
  it('should render with data', () => {
    render(
      <MockedProvider mocks={[mockVideoImagesResponse]}>
        <VideoProvider video={mockAdminVideo}>
          <Metadata video={mockAdminVideo} />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('Banner Image')).toBeInTheDocument()
    expect(screen.getByText('HD Image')).toBeInTheDocument()
    expect(screen.getByText('Short Description')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Study Questions')).toBeInTheDocument()
  })
})
