import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourneyForEdit'
import { BackgroundColor } from '.'

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
    const { getByTestId } = render(
      <ThemeProvider>
        <BackgroundColor {...card} />
      </ThemeProvider>
    )
    expect(
      getByTestId('bgColorTextField').children[0].children[1].getAttribute(
        'value'
      )
    ).toEqual('Default')
  })

  it('changes color on theme color pick', () => {
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
    const { getByTestId } = render(
      <ThemeProvider>
        <BackgroundColor {...card} />
      </ThemeProvider>
    )
    fireEvent.click(getByTestId('#DCDDE5'))
    expect(
      getByTestId('bgColorTextField').children[0].children[1].getAttribute(
        'value'
      )
    ).toEqual('Default')
  })
})

// still figuring this one out
xit('changes color on picker color pick', () => {
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
  const { getByTestId, getByRole } = render(
    <ThemeProvider>
      <BackgroundColor {...card} />
    </ThemeProvider>
  )
  console.log(getByTestId('bgColorPicker').children)
  fireEvent.click(getByTestId('bgColorPicker').children[1])
  expect(
    getByTestId('bgColorTextField').children[0].children[1].getAttribute(
      'value'
    )
  ).toEqual('Default')
})
