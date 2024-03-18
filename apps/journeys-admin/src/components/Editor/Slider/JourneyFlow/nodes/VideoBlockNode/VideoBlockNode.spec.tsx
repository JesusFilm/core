import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import '../../../../../../../test/i18n'
import { VideoBlockNode } from './VideoBlockNode'

describe('VideoBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockVideoBlock = {
    __typename: 'VideoBlock',
    id: 'VideoBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    muted: false,
    autoplay: false,
    startAt: 0,
    endAt: null,
    posterBlockId: null,
    fullsize: false,
    videoId: 'video.id',
    videoVariantLanguageId: null,
    source: VideoBlockSource.youTube,
    title: 'Video block title',
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: 'video.id',
      title: [
        {
          __typename: 'Translation',
          value: 'Video title'
        }
      ],
      image: null,
      variant: null
    },
    action: null,
    children: []
  } satisfies TreeBlock<VideoBlock>

  const mockStep = {
    __typename: 'StepBlock',
    id: 'StepBlock.id',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 0,
    children: [
      {
        __typename: 'CardBlock',
        id: 'CardBlock.id',
        parentBlockId: 'StepBlock.id',
        backgroundColor: null,
        coverBlockId: null,
        fullscreen: false,
        parentOrder: 0,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        children: [mockVideoBlock]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    id: mockVideoBlock.id,
    dragHandle: undefined,
    dragging: false,
    isConnectable: true,
    selected: false,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    type: mockVideoBlock.__typename,
    data: {
      ...mockVideoBlock,
      step: mockStep
    }
  }

  it('should render video block node with title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <VideoBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Video title')).toBeInTheDocument()
  })

  it('should render video block node label with fallback block title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <VideoBlockNode
            {...defaultProps}
            data={{ step: mockStep, ...mockVideoBlock, video: null }}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Video block title')).toBeInTheDocument()
  })

  it('should render video block node label with default title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <VideoBlockNode
            {...defaultProps}
            data={{
              step: mockStep,
              ...mockVideoBlock,
              video: null,
              title: null
            }}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Video')).toBeInTheDocument()
  })
})
