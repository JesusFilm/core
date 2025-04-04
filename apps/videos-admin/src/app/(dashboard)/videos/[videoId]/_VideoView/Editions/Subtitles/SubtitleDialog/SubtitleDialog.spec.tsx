import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DialogAction } from '../../../../../../../../components/CrudDialog'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { SubtitleDialog } from './SubtitleDialog'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]
const mockSubtitle = mockEdition.videoSubtitles[0]

describe('SubtitleDialog', () => {
  it('should not render when action is null', () => {
    render(
      <SubtitleDialog
        subtitle={mockSubtitle}
        edition={mockEdition}
        action={null}
        close={jest.fn()}
      />
    )

    expect(screen.queryByText('Subtitle Create')).not.toBeInTheDocument()
  })

  it('should render create subtitle dialog', () => {
    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[]}>
          <SubtitleDialog
            subtitle={mockSubtitle}
            edition={mockEdition}
            action={DialogAction.CREATE}
            close={jest.fn()}
          />
        </MockedProvider>
      </VideoProvider>
    )

    expect(screen.getByText('Create Subtitle')).toBeInTheDocument()
  })

  it('should render edit subtitle dialog', () => {
    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[]}>
          <SubtitleDialog
            subtitle={mockSubtitle}
            edition={mockEdition}
            action={DialogAction.EDIT}
            close={jest.fn()}
          />
        </MockedProvider>
      </VideoProvider>
    )

    expect(screen.getByText('Edit Subtitle')).toBeInTheDocument()
  })

  it('should render delete subtitle dialog', () => {
    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[]}>
          <SubtitleDialog
            subtitle={mockSubtitle}
            edition={mockEdition}
            action={DialogAction.DELETE}
            close={jest.fn()}
          />
        </MockedProvider>
      </VideoProvider>
    )

    expect(screen.getByText('Delete Subtitle')).toBeInTheDocument()
  })

  it('should close dialog when close button is clicked', async () => {
    const close = jest.fn()

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[]}>
          <SubtitleDialog
            subtitle={mockSubtitle}
            edition={mockEdition}
            action={DialogAction.CREATE}
            close={close}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByTestId('dialog-close-button'))

    expect(close).toHaveBeenCalled()
  })
})
