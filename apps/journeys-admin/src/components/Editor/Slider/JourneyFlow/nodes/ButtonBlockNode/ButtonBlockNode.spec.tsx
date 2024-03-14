import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import '../../../../../../../test/i18n'

import { ButtonBlockNode } from './ButtonBlockNode'

describe('ButtonBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'ButtonBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    label: 'Click Me',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.medium,
    startIconId: null,
    endIconId: null,
    action: null,
    children: []
  } satisfies TreeBlock<ButtonBlock>

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
        children: [mockButtonBlock]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    id: mockButtonBlock.id,
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
      ...mockButtonBlock,
      step: mockStep
    }
  }

  it('should render button block node with label', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <ButtonBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText(mockButtonBlock.label)).toBeInTheDocument()
  })

  it('should render default text if block has no label', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <ButtonBlockNode
            {...defaultProps}
            data={{ step: mockStep, ...mockButtonBlock, label: '' }}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
  })
})
