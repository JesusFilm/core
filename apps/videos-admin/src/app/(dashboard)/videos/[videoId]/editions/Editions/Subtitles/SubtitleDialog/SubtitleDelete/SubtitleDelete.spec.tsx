import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import {
  DELETE_VIDEO_SUBTITLE,
  DeleteVideoSubtitle,
  DeleteVideoSubtitleVariables,
  SubtitleDelete
} from './SubtitleDelete'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo?.videoEditions[0]
const mockSubtitle = mockEdition?.videoSubtitles[0]

const deleteSubtitleMock: MockedResponse<
  DeleteVideoSubtitle,
  DeleteVideoSubtitleVariables
> = {
  request: {
    query: DELETE_VIDEO_SUBTITLE,
    variables: { id: mockSubtitle?.id }
  },
  result: jest.fn(() => ({ data: { videoSubtitleDelete: mockSubtitle } }))
}

describe('SubtitleDelete', () => {
  it('should render', () => {
    render(
      <MockedProvider mocks={[]}>
        <SubtitleDelete
          edition={mockEdition}
          subtitle={mockSubtitle}
          close={jest.fn()}
        />
      </MockedProvider>
    )

    expect(
      screen.getByText('Are you sure you want to delete this subtitle?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('should call close when cancel is clicked', async () => {
    const close = jest.fn()

    render(
      <MockedProvider mocks={[]}>
        <SubtitleDelete
          edition={mockEdition}
          subtitle={mockSubtitle}
          close={close}
        />
      </MockedProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(close).toHaveBeenCalled()
  })

  it('should call deleteSubtitle when delete is clicked', async () => {
    const close = jest.fn()

    render(
      <MockedProvider mocks={[deleteSubtitleMock]}>
        <SubtitleDelete
          edition={mockEdition}
          subtitle={mockSubtitle}
          close={close}
        />
      </MockedProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteSubtitleMock.result).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
  })
})
