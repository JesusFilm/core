import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import '../../../../../../../test/i18n'

import { RadioOptionBlockNode } from './RadioOptionBlockNode'

describe('RadioOptionBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockRadioOptionBlock = {
    __typename: 'RadioOptionBlock',
    id: 'FormBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    label: 'Option 1',
    action: null,
    children: []
  } satisfies TreeBlock<RadioOptionBlock>

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
        children: [
          {
            __typename: 'RadioQuestionBlock',
            id: 'RadioQuestion.id',
            parentBlockId: 'CardBlock.id',
            parentOrder: 0,
            children: [mockRadioOptionBlock]
          }
        ]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    id: mockRadioOptionBlock.id,
    dragHandle: undefined,
    dragging: false,
    isConnectable: true,
    selected: false,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    type: 'ButtonBlock',
    data: {
      ...mockRadioOptionBlock,
      step: mockStep
    }
  }

  it('should render radio option block node with title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <RadioOptionBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText(mockRadioOptionBlock.label)).toBeInTheDocument()
  })

  it('should render default option text', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <RadioOptionBlockNode
            {...defaultProps}
            data={{ step: mockStep, ...mockRadioOptionBlock, label: '' }}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Option')).toBeInTheDocument()
  })
})
