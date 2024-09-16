import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Slider from '@mui/material/Slider'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { GetPlausibleJourneyFlowViewed } from '../../../../__generated__/GetPlausibleJourneyFlowViewed'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import {
  UpdatePlausibleJourneyFlowViewed,
  UpdatePlausibleJourneyFlowViewedVariables
} from '../../../../__generated__/UpdatePlausibleJourneyFlowViewed'
import { TestEditorState } from '../../../libs/TestEditorState'

import {
  GET_PLAUSIBLE_JOURNEY_FLOW_VIEWED,
  UPDATE_PLAUSIBLE_JOURNEY_FLOW_VIEWED
} from './Toolbar'

import { Toolbar } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Toolbar', () => {
  const mockGetPlausibleJourneyFlowViewed: MockedResponse<GetPlausibleJourneyFlowViewed> =
    {
      request: {
        query: GET_PLAUSIBLE_JOURNEY_FLOW_VIEWED
      },
      result: {
        data: {
          getJourneyProfile: {
            id: 'journeyProfileId',
            plausibleJourneyFlowViewed: true,
            __typename: 'JourneyProfile'
          }
        }
      }
    }

  const mockUpdatePlausibleJourneyFlowViewed: MockedResponse<
    UpdatePlausibleJourneyFlowViewed,
    UpdatePlausibleJourneyFlowViewedVariables
  > = {
    request: {
      query: UPDATE_PLAUSIBLE_JOURNEY_FLOW_VIEWED,
      variables: { input: { plausibleJourneyFlowViewed: true } }
    },
    result: {
      data: {
        journeyProfileUpdate: {
          id: 'journeyProfileId',
          plausibleJourneyFlowViewed: true,
          __typename: 'JourneyProfile'
        }
      }
    }
  }

  const defaultJourney = {
    journey: {
      id: 'journeyId',
      title: 'My Awesome Journey Title',
      description: 'My Awesome Journey Description',
      primaryImageBlock: null,
      status: JourneyStatus.draft
    } as unknown as Journey,
    variant: 'admin'
  }

  const socialImageJourney = {
    journey: {
      title: 'My Awesome Journey Title',
      description: 'My Awesome Journey Description',
      primaryImageBlock: {
        id: 'image1.id',
        __typeame: 'ImageBlock',
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      },
      status: JourneyStatus.draft,
      variant: 'admin'
    } as unknown as Journey,

    variant: 'admin'
  }

  beforeEach(() => {
    window.Beacon = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render NextSteps logo on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByAltText('Next Steps')).toBeInTheDocument() // NextSteps logo
  })

  it('should render help scout beacon', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('HelpScoutBeaconIconButton')).toBeInTheDocument()
  })

  it('should render title & description on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByText('My Awesome Journey Title')).toBeInTheDocument()
    expect(
      screen.getByText('My Awesome Journey Description')
    ).toBeInTheDocument()
  })

  it('should open the title dialog when selected', async () => {
    render(toolbar(defaultJourney))

    fireEvent.click(screen.getByRole('button', { name: 'Click to edit' }))
    await waitFor(() => {
      expect(screen.getByTestId('TitleDescriptionDialog')).toBeInTheDocument()
    })
  })

  it('should render items stack on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ItemsStack')).toBeInTheDocument()
  })

  it('should render menu button on Toolbar', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ToolbarMenuButton')).toBeInTheDocument()
    expect(screen.getByTestId('MoreIcon')).toBeInTheDocument()
  })

  it('should render all journeys button', () => {
    render(toolbar(defaultJourney))
    expect(screen.getByTestId('ToolbarBackButton')).toHaveAttribute('href', '/')
    expect(screen.getByTestId('FormatListBulletedIcon')).toBeInTheDocument()
  })

  it('should render journeys tooltip on hover', async () => {
    render(toolbar(defaultJourney))
    fireEvent.mouseOver(screen.getByTestId('ToolbarBackButton'))
    await waitFor(() => {
      expect(screen.getByText('See all journeys')).toBeInTheDocument()
    })
  })

  it('should render journey image', () => {
    render(toolbar(socialImageJourney))

    expect(
      screen.getByAltText('random image from unsplash')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('ThumbsUpIcon')).not.toBeInTheDocument()
  })

  it('should open the tooltip when the image is hovered over', async () => {
    render(toolbar(defaultJourney))
    fireEvent.mouseOver(screen.getByTestId('ToolbarSocialImage'))
    await waitFor(() => {
      expect(screen.getByText('Social Image')).toBeInTheDocument()
    })
  })

  it('should open the social preview when the image is clicked', () => {
    render(toolbar(socialImageJourney))

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('ToolbarSocialImage'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('should open analytics popover if users first time and update plausible viewed', async () => {
    const initialState = {
      showAnalytics: true
    } as unknown as EditorState

    const result = jest
      .fn()
      .mockReturnValue(mockUpdatePlausibleJourneyFlowViewed.result)

    render(
      <FlagsProvider flags={{ editorAnalytics: true }}>
        <MockedProvider
          mocks={[{ ...mockUpdatePlausibleJourneyFlowViewed, result }]}
        >
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney.journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <TestEditorState />
                <Toolbar />
                <Slider />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </FlagsProvider>
    )

    expect(screen.getByText('New Feature Feedback')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }))
    expect(window.Beacon).toHaveBeenCalledWith('open')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.queryByText('New Feature Feedback')).not.toBeInTheDocument()
  })

  it('should not open analytics popover if user has already enabled analytics before', async () => {
    const initialState = {
      showAnalytics: true
    } as unknown as EditorState

    const result = jest
      .fn()
      .mockReturnValue(mockGetPlausibleJourneyFlowViewed.result)

    render(
      <FlagsProvider flags={{ editorAnalytics: true }}>
        <MockedProvider
          mocks={[
            mockUpdatePlausibleJourneyFlowViewed,
            { ...mockGetPlausibleJourneyFlowViewed, result }
          ]}
        >
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney.journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={initialState}>
                <TestEditorState />
                <Toolbar />
                <Slider />
              </EditorProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </FlagsProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.queryByText('New Feature Feedback')).not.toBeInTheDocument()
  })

  function toolbar(journey): ReactElement {
    return (
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={journey}>
            <EditorProvider>
              <TestEditorState />
              <Toolbar />
              <Slider />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
})
