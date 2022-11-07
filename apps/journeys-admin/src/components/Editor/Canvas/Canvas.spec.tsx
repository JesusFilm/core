import { render, fireEvent } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { ThemeProvider } from '../../ThemeProvider'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
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
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                language: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en',
                  iso3: 'eng'
                }
              } as unknown as Journey,
              admin: true
            }}
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
      </MockedProvider>
    )
    fireEvent.click(getByTestId('step-step0.id'))
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 2px solid #c52d3a'
    )
  })
})
