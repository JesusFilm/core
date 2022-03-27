import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { VideoBlockEditor } from '.'

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    variant: {
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: null,
  children: []
}

const onChange = jest.fn()
const onDelete = jest.fn()

describe('VideoBlockEditor', () => {
  describe('no existing block', () => {
    it('shows placeholders on null', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('Select Video File')).toBeInTheDocument()
    })

    it('has settings disabled', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByTestId('videoSettingsTab')).toBeDisabled()
    })
  })

  describe('existing block', () => {
    it('calls onDelete', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      const button = await getByTestId('imageBlockHeaderDelete')
      fireEvent.click(button)
      expect(onDelete).toHaveBeenCalledWith()
    })
    it('has settings enabled', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByTestId('videoSettingsTab')).toBeEnabled()
    })
    it('can switch to settings on Mobile', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      await fireEvent.click(getByTestId('videoSettingsTab'))
      await waitFor(() =>
        expect(getByTestId('videoSettingsMobile')).toBeInTheDocument()
      )
    })
  })
})
