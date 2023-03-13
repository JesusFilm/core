import { render } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks as Blocks
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
  const defaultJourney: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
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
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null
  }

  it('should render placeholder', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey: defaultJourney }}>
        <ActionsTable />
      </JourneyProvider>
    )
    expect(
      getByText('Your Journey doesnt have actions yet')
    ).toBeInTheDocument()
    expect(getByText('Add a button/poll to your card')).toBeInTheDocument()
  })
  it('should render a list of actions', () => {
    const { getByText, getByTestId } = render(
      <JourneyProvider
        value={{
          journey: {
            ...defaultJourney,
            blocks
          }
        }}
      >
        <ActionsTable />
      </JourneyProvider>
    )
    expect(
      getByText('Here you can see the list of goals for this journey')
    ).toBeInTheDocument()
    expect(getByText('https://www.google.com/')).toBeInTheDocument()
    expect(getByTestId('EditRoundedIcon')).toBeInTheDocument()
  })
})
