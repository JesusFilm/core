import { render, fireEvent } from '@testing-library/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/context'
import { Canvas } from '.'

describe('Canvas', () => {
  it('should show border around selected', () => {
    const step0: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 1,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <ThemeProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider
            initialState={{
              steps: [step0, step1]
            }}
          >
            <Canvas />
          </EditorProvider>
        </JourneyProvider>
      </ThemeProvider>
    )
    fireEvent.click(getByTestId('step-step0.id'))
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 2px solid #c52d3a'
    )
  })
})
