import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks as Blocks,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'

import { ActionsTable } from './ActionsTable'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const blocks: Blocks[] = [
  {
    __typename: 'IconBlock',
    id: '4756cf5a-2457-4ed3-8a08-729a5b43d0ee',
    parentBlockId: '84d742c8-9905-4b77-8987-99c08c04cde3',
    parentOrder: null,
    iconName: null,
    iconSize: null,
    iconColor: null
  },
  {
    __typename: 'ButtonBlock',
    id: '84d742c8-9905-4b77-8987-99c08c04cde3',
    parentBlockId: '777f29f2-274f-4f14-ba21-2208ea06e7f5',
    parentOrder: 0,
    label: 'Google link',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.medium,
    startIconId: 'dd6404d6-421d-4c4c-a059-7ac4aafa805b',
    endIconId: '4756cf5a-2457-4ed3-8a08-729a5b43d0ee',
    action: {
      __typename: 'LinkAction',
      parentBlockId: '84d742c8-9905-4b77-8987-99c08c04cde3',
      gtmEventName: null,
      url: 'https://www.google.com/'
    }
  },
  {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: '777f29f2-274f-4f14-ba21-2208ea06e7f5',
    parentOrder: 1,
    label: 'Chat link',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.medium,
    startIconId: null,
    endIconId: null,
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'button2.id',
      gtmEventName: null,
      url: 'https://m.me/some_user'
    }
  },
  {
    __typename: 'ButtonBlock',
    id: 'button3.id',
    parentBlockId: '777f29f2-274f-4f14-ba21-2208ea06e7f5',
    parentOrder: 2,
    label: 'Bible link',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.medium,
    startIconId: null,
    endIconId: null,
    action: {
      __typename: 'LinkAction',
      parentBlockId: '84d742c8-9905-4b77-8987-99c08c04cde3',
      gtmEventName: null,
      url: 'https://www.bible.com/'
    }
  },
  {
    __typename: 'StepBlock',
    id: '5b97eebc-0fcd-46ea-8d42-370538bd9f82',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null
  },
  {
    __typename: 'CardBlock',
    id: '777f29f2-274f-4f14-ba21-2208ea06e7f5',
    parentBlockId: '5b97eebc-0fcd-46ea-8d42-370538bd9f82',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: '9caf671e-713e-492d-ac8a-b33e71fc5e18',
    themeMode: null,
    themeName: null,
    fullscreen: false
  }
]

describe('ActionsTable', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    featuredAt: null,
    slug: 'my-journey',
    strategySlug: null,
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: null,
    tags: []
  }

  it('should render placeholder', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <ActionsTable />
      </JourneyProvider>
    )
    expect(getByText('Every Journey has a goal')).toBeInTheDocument()
  })

  it('should render a list of actions', () => {
    const { getByText, getAllByText, getAllByTestId } = render(
      <JourneyProvider
        value={{
          journey: {
            ...journey,
            blocks
          },
          variant: 'admin'
        }}
      >
        <ActionsTable />
      </JourneyProvider>
    )
    expect(getByText('The Journey Goals')).toBeInTheDocument()

    expect(getAllByText('https://m.me/some_user')[0]).toBeInTheDocument()
    expect(getAllByText('Start a Conversation')).toHaveLength(2)

    expect(getAllByText('https://www.bible.com/')[0]).toBeInTheDocument()
    expect(getAllByText('Link to Bible')).toHaveLength(2)

    expect(getAllByText('https://www.google.com/')[0]).toBeInTheDocument()
    expect(getAllByText('Visit a Website')).toHaveLength(2)

    expect(getAllByTestId('Edit2Icon')).toHaveLength(3)
  })
})
