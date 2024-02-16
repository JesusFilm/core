import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { render } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

import { ActionNode } from '.'

describe('ActionNode', () => {
  const stepBlock: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step3.id',
    children: []
  }

  it('should display the correct title', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReactFlowProvider>
          <Box>
            <ActionNode
              data-testid="action-node"
              title="The correct title"
              block={stepBlock}
              step={stepBlock}
            />
          </Box>
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(getByText('The correct title')).toBeInTheDocument()
  })

  it('should dispaly a border that is grey when not selected', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionNode
            title="The title"
            block={stepBlock}
            step={stepBlock}
            selected={false}
          />
        </ReactFlowProvider>
      </MockedProvider>
    )
    expect(getByText('The title').parentElement).toHaveStyle(
      'outline: 1px solid grey'
    )
  })

  it('should dispaly a border that is red when selected', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionNode
            title="The title"
            block={stepBlock}
            step={stepBlock}
            selected
          />
        </ReactFlowProvider>
      </MockedProvider>
    )
    expect(getByText('The title').parentElement).toHaveStyle(
      'outline: 1px solid #1976d2'
    )
  })
})
