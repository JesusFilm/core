import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'

import { GetAdminVideo_AdminVideo_Children as AdminVideoChildren } from '../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoChildren } from './VideoChildren'

const childVideos: AdminVideoChildren =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['children']

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('VideoChildren', () => {
  it('should render', () => {
    render(
      
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={childVideos}
            label="Clips"
          />
        </MockedProvider>
      
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-1')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-2')).toBeInTheDocument()
  })

  it('should direct to video view of the child video on click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]
    render(
      
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={oneChildVideo}
            label="Clips"
          />
        </MockedProvider>
      
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('OrderedItem-0'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/en/videos/1_jf6101-0-0')
    )
  })

  it('should show fall back if no video children', () => {
    render(
      
        <MockedProvider>
          <VideoChildren videoId="videoId" childVideos={[]} label="Clips" />
        </MockedProvider>
      
    )

    expect(screen.getByText('No children to show')).toBeInTheDocument()
  })
})
