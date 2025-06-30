import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields as Blocks } from '../../../../__generated__/BlockFields'
import { GetAllTeamHosts_hosts as Host } from '../../../../__generated__/GetAllTeamHosts'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { TestEditorState } from '../../../libs/TestEditorState'

import { JourneyQuickSettingsGoals } from './JourneyQuickSettingsGoals'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
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
    submitEnabled: null,
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
    submitEnabled: null,
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
    submitEnabled: null,
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
    nextBlockId: null,
    slug: null
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
    fullscreen: false,
    backdropBlur: null
  }
]

const defaultHost: Host = {
  id: 'hostId',
  __typename: 'Host',
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'imageSrc1',
  src2: 'imageSrc2'
}

describe('JourneyQuickSettingsGoals', () => {
  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: 'teamId' }
  } as unknown as Journey

  const state: EditorState = {
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    selectedGoalUrl: 'initialUrl'
  }

  it('should render 3 goals', () => {
    render(
      <JourneyProvider
        value={{ journey: { ...journey, blocks }, variant: 'admin' }}
      >
        <JourneyQuickSettingsGoals />
      </JourneyProvider>
    )

    expect(screen.getByTestId('JourneyQuickSettingsGoals')).toBeInTheDocument()

    expect(screen.getByText('https://m.me/some_user')).toBeInTheDocument()
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()

    expect(screen.getByText('https://www.bible.com/')).toBeInTheDocument()
    expect(screen.getByText('Link to Bible')).toBeInTheDocument()

    expect(screen.getByText('https://www.google.com/')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
  })

  it('should setSelectedGoalUrl on first render', async () => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

    render(
      <EditorProvider initialState={state}>
        <JourneyProvider
          value={{ journey: { ...journey, blocks }, variant: 'admin' }}
        >
          <JourneyQuickSettingsGoals />
          <TestEditorState />
        </JourneyProvider>
      </EditorProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByText('selectedGoalUrl: https://www.google.com/')
      ).toBeInTheDocument()
    )
  })

  it('should open and close goal details drawer', async () => {
    render(
      <JourneyProvider
        value={{ journey: { ...journey, blocks }, variant: 'admin' }}
      >
        <JourneyQuickSettingsGoals />
      </JourneyProvider>
    )

    expect(screen.queryByTestId('GoalDetailsDrawer')).not.toBeInTheDocument()

    const firstGoal = screen.getByText('https://www.google.com/')
    fireEvent.click(firstGoal)

    expect(screen.getByTestId('GoalDetailsDrawer')).toBeInTheDocument()
    expect(screen.getByTestId('GoalDetailsDrawer')).toBeVisible()

    fireEvent.click(screen.getByTestId('CloseGoalDetailsDrawerButton'))

    await waitFor(() =>
      expect(screen.queryByTestId('GoalDetailsDrawer')).not.toBeInTheDocument()
    )
  })
})
