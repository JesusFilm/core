import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
import { Attributes } from '.'

describe('Attributes', () => {
  it('should render card block', () => {
    const step: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: 'image1.id',
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: true,
      children: []
    }
    const { getByText } = render(<Attributes selected={step} />)
    expect(getByText('Background Color')).toBeInTheDocument()
  })

  it('should render step block with card block', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: 'image1.id',
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: true,
          children: []
        }
      ]
    }
    const { getByText } = render(<Attributes selected={step} />)
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    expect(getByText('Background Color')).toBeInTheDocument()
  })

  it('should render step block without card block', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByText, queryByText } = render(<Attributes selected={step} />)
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    expect(queryByText('Background Color')).not.toBeInTheDocument()
  })
})
