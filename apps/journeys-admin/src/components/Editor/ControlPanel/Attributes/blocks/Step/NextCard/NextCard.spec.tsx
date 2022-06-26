import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { fireEvent, render } from '@testing-library/react'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../../__generated__/globalTypes'
import { NextCard } from './NextCard'

describe('NextCard', () => {
  it('changes between cards and conditions tabs', () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: 'step2.id',
      parentOrder: 0,
      locked: false,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey,
            admin: true
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <NextCard />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('tab', { name: 'Cards' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(getByRole('tab', { name: 'Conditions' }))

    expect(getByRole('tab', { name: 'Conditions' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(getByRole('tab', { name: 'Cards' }))

    expect(getByRole('tab', { name: 'Cards' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
