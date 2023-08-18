import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
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
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            variant: 'admin'
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
