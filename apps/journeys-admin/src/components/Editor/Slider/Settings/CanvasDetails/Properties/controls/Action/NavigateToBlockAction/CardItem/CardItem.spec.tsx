import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/TemplateView/TemplateFooter/data'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../../__generated__/globalTypes'

import { CardItem } from './CardItem'

describe('CardItem', () => {
  const step = {
    __typename: 'StepBlock' as const,
    id: 'stepId',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        __typename: 'CardBlock' as const,
        id: 'cardId',
        parentBlockId: 'stepId',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false,
        backdropBlur: null,
        children: []
      }
    ]
  }

  it('should render card item', () => {
    const { getByTestId } = render(
      <JourneyProvider value={{ journey }}>
        <CardItem step={step} id={step.id} />
      </JourneyProvider>
    )

    const cardItemElement = getByTestId(`CardItem-${step.id}`)
    expect(cardItemElement).toBeInTheDocument()
  })
})
