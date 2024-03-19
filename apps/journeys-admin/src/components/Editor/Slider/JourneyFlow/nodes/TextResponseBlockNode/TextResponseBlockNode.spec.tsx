import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import '../../../../../../../test/i18n'

import { TextResponseBlockNode } from './TextResponseBlockNode'

describe('TextResponseBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockTextResponseBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'TextResponseBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    label: 'TextResponseBlock',
    hint: null,
    minRows: null,
    submitLabel: null,
    submitIconId: null,
    action: null,
    children: []
  }

  const mockStep: TreeBlock<StepBlock> = {
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
        children: [mockTextResponseBlock]
      }
    ]
  }

  const defaultProps = {
    id: mockTextResponseBlock.id,
    dragHandle: undefined,
    dragging: false,
    isConnectable: true,
    selected: false,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    type: 'TextResponseBlock',
    data: {
      ...mockTextResponseBlock,
      step: mockStep
    }
  }

  it('should render text response block node with label', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <TextResponseBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })
})
