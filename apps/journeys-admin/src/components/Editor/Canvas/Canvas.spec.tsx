import { render, fireEvent } from '@testing-library/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { ThemeProvider } from '../../ThemeProvider'
import { Canvas } from '.'

describe('Canvas', () => {
  it('should show border around selected', () => {
    const step0: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: [
        {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: 'step0.id',
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
      ]
    }
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
      ]
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
  })
})
