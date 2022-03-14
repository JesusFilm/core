import { fireEvent, render, waitFor } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { VideoBlockEditor } from '.'

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  title: 'watch',
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
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
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText('Select Video File')).toBeInTheDocument()
      expect(getByText('Formats: MP4, HLS')).toBeInTheDocument()
    })

    it('has settings disabled', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={null}
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
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
    it('shows video information', async () => {
      const { getByText, getAllByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
              onChange={onChange}
              onDelete={onDelete}
            />
          </MockedProvider>
        </ThemeProvider>
      )
      expect(getByText(video.title)).toBeInTheDocument()
      const textBox = getAllByRole('textbox')[0]
      expect(textBox).toHaveValue(video.videoContent.src)
    })
    it('calls onDelete', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <VideoBlockEditor
              selectedBlock={video}
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
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
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
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
              parentBlockId={card.id}
              parentOrder={Number(card.parentOrder)}
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
