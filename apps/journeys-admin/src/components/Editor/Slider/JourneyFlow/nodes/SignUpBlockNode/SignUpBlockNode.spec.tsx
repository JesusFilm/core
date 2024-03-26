import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { SignUpBlockNode } from './SignUpBlockNode'

describe('SignUpBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockSignUpBlock = {
    __typename: 'SignUpBlock',
    id: 'SignUpBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    submitLabel: 'Submit',
    submitIconId: null,
    action: null,
    children: []
  } satisfies TreeBlock<SignUpBlock>

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
        children: [mockSignUpBlock]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    id: mockSignUpBlock.id,
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
      ...mockSignUpBlock,
      step: mockStep
    }
  }

  it('should render sign up block node with label', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <SignUpBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Subscribe')).toBeInTheDocument()
  })
})
