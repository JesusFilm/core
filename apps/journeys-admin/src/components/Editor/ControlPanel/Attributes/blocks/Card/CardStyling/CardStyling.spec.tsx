import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourneyForEdit'
import { CardStyling } from '.'

describe('CardStyling', () => {
  it('shows default ', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByText } = render(<CardStyling {...card} />)
    expect(getByText('Default')).toBeInTheDocument()
  })

  it('shows dark', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByText } = render(<CardStyling {...card} />)
    expect(getByText('dark')).toBeInTheDocument()
  })

  it('shows light', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByText } = render(<CardStyling {...card} />)
    expect(getByText('light')).toBeInTheDocument()
  })

  it('changes to Dark', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByTestId, getByText } = render(<CardStyling {...card} />)
    fireEvent.click(getByTestId(ThemeMode.dark))
    expect(getByText('dark')).toBeInTheDocument()
  })

  it('changes to Light', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      journeyId: 'journey1',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByTestId, getByText } = render(<CardStyling {...card} />)
    fireEvent.click(getByTestId(ThemeMode.light))
    expect(getByText('light')).toBeInTheDocument()
  })
})
