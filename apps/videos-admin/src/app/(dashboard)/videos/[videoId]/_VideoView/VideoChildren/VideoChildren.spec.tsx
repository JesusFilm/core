import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'

import { GetAdminVideo_AdminVideo_Children as AdminVideoChildren } from '../../../../../../libs/useAdminVideo'
import { GET_ADMIN_VIDEO } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VIDEO_CHILDREN_ORDER_UPDATE, VideoChildren } from './VideoChildren'

const childVideos: AdminVideoChildren =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['children']

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

const getAdminVideoMock = {
  request: {
    query: GET_ADMIN_VIDEO,
    variables: { videoId: 'videoId' }
  },
  result: {
    data: {
      adminVideo: {
        id: 'videoId',
        children: childVideos
      }
    }
  }
}

const mutationMock = {
  request: {
    query: VIDEO_CHILDREN_ORDER_UPDATE,
    variables: {
      input: {
        id: 'videoId',
        childIds: ['existingId', 'newVideoId']
      }
    }
  },
  result: {
    data: {
      videoUpdate: {
        id: 'videoId',
        children: [
          {
            id: 'existingId',
            title: [{ id: 'title1', value: 'Existing Child' }],
            images: [{ id: 'img1', mobileCinematicHigh: 'image1.jpg' }],
            imageAlt: [{ id: 'alt1', value: 'Alt text 1' }]
          },
          {
            id: 'newVideoId',
            title: [{ id: 'title2', value: 'New Child' }],
            images: [{ id: 'img2', mobileCinematicHigh: 'image2.jpg' }],
            imageAlt: [{ id: 'alt2', value: 'Alt text 2' }]
          }
        ]
      }
    }
  }
}

describe('VideoChildren', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn()
    } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
  })

  it('should render', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={childVideos}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-1')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-2')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should direct to video view of the child video on click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]
    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={oneChildVideo}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('OrderedItem-0'))
    })

    expect(push).toHaveBeenCalledWith('/en/videos/1_jf6101-0-0')
  })

  it('should show fallback if no video children', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren videoId="videoId" childVideos={[]} label="Clips" />
        </MockedProvider>
      )
    })

    expect(screen.getByText('No children to show')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should handle null childVideos gracefully', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={null as unknown as AdminVideoChildren}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    expect(screen.getByText('No children to show')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should open create dialog when Add button is clicked', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={childVideos}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    expect(screen.queryByText('Create New Clip')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Add'))
    })

    expect(screen.getByText('Create New Clip')).toBeInTheDocument()
  })

  it('should handle null values in child video properties', async () => {
    const incompleteChildVideos = [
      {
        ...childVideos[0],
        title: null,
        images: null,
        imageAlt: null
      }
    ]

    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={incompleteChildVideos as unknown as AdminVideoChildren}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    expect(screen.getByText('1. Untitled Video')).toBeInTheDocument()
  })

  it('should update local state when childVideos prop changes', async () => {
    let rerender

    await act(async () => {
      const renderResult = render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={[childVideos[0]]}
            label="Clips"
          />
        </MockedProvider>
      )
      rerender = renderResult.rerender
    })

    // Only first child should be visible
    expect(screen.getAllByTestId(/OrderedItem-\d+/)).toHaveLength(1)

    // Update with more children
    await act(async () => {
      rerender(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={childVideos}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    // Now all children should be visible
    expect(screen.getAllByTestId(/OrderedItem-\d+/)).toHaveLength(
      childVideos.length
    )
  })

  it('should navigate to video edit page when clicking the edit menu option', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]

    await act(async () => {
      render(
        <MockedProvider>
          <VideoChildren
            videoId="videoId"
            childVideos={oneChildVideo}
            label="Clips"
          />
        </MockedProvider>
      )
    })

    // Find the menu button (More button) in the OrderedItem
    const orderedItem = screen.getByTestId('OrderedItem-0')
    const menuButton = within(orderedItem).getByLabelText(
      'ordered-item-actions'
    )

    // Open the menu
    await act(async () => {
      fireEvent.click(menuButton)
    })

    // Click the Edit menu option
    const editMenuItem = screen.getByText('Edit')
    await act(async () => {
      fireEvent.click(editMenuItem)
    })

    // Check that router.push was called with the correct path
    expect(push).toHaveBeenCalledWith(`/videos/${oneChildVideo[0].id}`)
  })
})
