import { render, screen } from '@testing-library/react'

import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { SpacerFields } from './__generated__/SpacerFields'

import { Spacer } from '.'

describe('Spacer', () => {
  const block: TreeBlock<SpacerFields> = {
    __typename: 'SpacerBlock',
    id: 'spacer.id',
    parentBlockId: 'Image1',
    parentOrder: 0,
    spacing: 200,
    children: []
  }

  it('should render invisible on journeys context', () => {
    render(
      <JourneyProvider
        value={{ journey: {} as unknown as Journey, variant: 'default' }}
      >
        <Spacer {...block} />
      </JourneyProvider>
    )

    const spacer = screen.getByTestId('JourneysSpacer')
    expect(spacer).toHaveStyle(`height: 200px`)
    expect(spacer).toHaveStyle(`background-color: rgba(0, 0, 0, 0)`)
  })

  it('should render opaque on editor context', () => {
    render(
      <JourneyProvider
        value={{ journey: {} as unknown as Journey, variant: 'admin' }}
      >
        <Spacer {...block} />
      </JourneyProvider>
    )

    const spacer = screen.getByTestId('JourneysSpacer')
    expect(spacer).toHaveStyle(`height: 200px`)
    expect(spacer).toHaveStyle(`background-color: rgba(255, 255, 255, 0.2)`)
  })
})
