import { render, fireEvent } from '@testing-library/react'
import { Canvas } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'
import { ThemeProvider } from '../../ThemeProvider'
import { EditorProvider } from '../Context'

describe('Canvas', () => {
  it('should show border around selected', () => {
    const step0: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <ThemeProvider>
        <EditorProvider
          initialState={{
            steps: [step0, step1]
          }}
        >
          <Canvas />
        </EditorProvider>
      </ThemeProvider>
    )
    fireEvent.click(getByTestId('step-step0.id'))
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 2px solid #c52d3a'
    )
    fireEvent.click(getByTestId('step-step1.id'))
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 2px solid #efefef'
    )
  })
})
