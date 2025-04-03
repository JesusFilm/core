import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../libs/VideoProvider'

import { Editions } from './Editions'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

describe('Editions', () => {
  it('should render with editions', async () => {
    render(
      
        <MockedProvider>
          <Editions editions={mockVideo.videoEditions} />
        </MockedProvider>
      
    )

    expect(screen.getByText('Editions')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'New Edition' })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText('base')).toHaveLength(2)
    })
    expect(screen.getByText('2 subtitles')).toBeInTheDocument()
  })

  it('should render with no editions', () => {
    render(
      
        <MockedProvider>
          <Editions editions={[]} />
        </MockedProvider>
      
    )

    expect(screen.getByText('Editions')).toBeInTheDocument()
    expect(screen.getByText('No editions')).toBeInTheDocument()
  })

  it('should open create edition dialog', async () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <Editions editions={mockVideo.videoEditions} />
          </VideoProvider>
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: 'New Edition' })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Create Edition')).toBeInTheDocument()
    })
  })

  it('should open edition dialog when edition is clicked', async () => {
    render(
      
        <MockedProvider>
          <Editions editions={mockVideo.videoEditions} />
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    await user.click(screen.getAllByText('base')[0])

    await waitFor(() => {
      expect(screen.getByText('View Edition')).toBeInTheDocument()
    })
  })

  it('should close edition dialog', async () => {
    render(
      
        <MockedProvider>
          <Editions editions={mockVideo.videoEditions} />
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    await user.click(screen.getAllByText('base')[0])

    await waitFor(() => {
      expect(screen.getByText('View Edition')).toBeInTheDocument()
    })

    const backdrop = document.querySelector('.MuiBackdrop-root')
    if (backdrop) {
      await user.click(backdrop)
    }

    await waitFor(() => {
      expect(screen.queryByText('View Edition')).not.toBeInTheDocument()
    })
  })

  it('should open edit edition dialog', async () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <Editions editions={mockVideo.videoEditions} />
          </VideoProvider>
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    const menuButton = screen.getAllByRole('button', {
      name: /more options/i
    })[0]
    await user.click(menuButton)

    const editMenuItem = screen.getAllByRole('menuitem', { name: 'Edit' })[0]

    expect(screen.getByRole('menuitem', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()

    await user.click(editMenuItem)

    await waitFor(() => {
      expect(screen.getByText('Edit Edition')).toBeInTheDocument()
    })
  })

  it('should open delete edition dialog', async () => {
    render(
      
        <MockedProvider>
          <VideoProvider video={mockVideo}>
            <Editions
              editions={[{ ...mockVideo.videoEditions[0], videoSubtitles: [] }]}
            />
          </VideoProvider>
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    const menuButton = screen.getAllByRole('button', {
      name: /more options/i
    })[0]
    await user.click(menuButton)

    const editMenuItem = screen.getAllByRole('menuitem', { name: 'Delete' })[0]

    expect(screen.getByRole('menuitem', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()

    await user.click(editMenuItem)

    await waitFor(() => {
      expect(screen.getByText('Delete Edition')).toBeInTheDocument()
    })
  })
})
