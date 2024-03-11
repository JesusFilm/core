import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_FormBlock as FormBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import '../../../../../../../test/i18n'

import { FormBlockNode } from './FormBlockNode'

describe('FormBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockFormBlock = {
    __typename: 'FormBlock',
    id: 'FormBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    form: null,
    action: null,
    children: []
  } satisfies TreeBlock<FormBlock>

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
        children: [mockFormBlock]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    id: mockFormBlock.id,
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
      ...mockFormBlock,
      step: mockStep
    }
  }

  it('should render form node with title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <FormBlockNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Form')).toBeInTheDocument()
  })
})
