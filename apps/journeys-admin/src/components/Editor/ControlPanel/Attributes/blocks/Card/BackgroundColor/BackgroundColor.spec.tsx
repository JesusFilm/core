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

// test for color picker excluded as it is an external component with its own tests. The same internal handler methods are tested above
