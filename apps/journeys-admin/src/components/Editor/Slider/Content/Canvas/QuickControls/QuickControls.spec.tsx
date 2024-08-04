import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetAdminJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetAdminJourney'

import { QuickControls } from '.'

describe('QuickControls', () => {
  const videoBlock = {
    __typename: 'VideoBlock',
    id: 'video1.id'
  } as unknown as TreeBlock<VideoBlock>

  it('should render buttons', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <QuickControls open anchorEl={null} block={videoBlock} />
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByLabelText('move-block-up')).toBeInTheDocument()
    expect(screen.getByLabelText('move-block-down')).toBeInTheDocument()
    expect(screen.getByTestId('duplicate-block')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete Block Actions')).toBeInTheDocument()
  })

  it('should disable duplicate block', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <EditorProvider initialState={{ selectedBlock: videoBlock }}>
            <QuickControls open anchorEl={null} block={videoBlock} />
          </EditorProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('duplicate-block')).toBeDisabled()
  })
})
