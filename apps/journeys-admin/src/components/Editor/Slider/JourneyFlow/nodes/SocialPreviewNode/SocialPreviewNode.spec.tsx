import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreate'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation'

import { SocialPreviewNode } from './SocialPreviewNode'

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('SocialPreviewNode', () => {
  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Social,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  const dispatch = jest.fn()

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  const image: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: ''
  }

  const defaultJourney: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    featuredAt: null,
    title: 'my journey',
    strategySlug: null,
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
    primaryImageBlock: image,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: 'Test Title Social Preview',
    seoDescription: 'Test Description Social Preview',
    chatButtons: [],
    host: null,
    team: null,
    tags: []
  }

  const blankSeoJourney: Journey = {
    ...defaultJourney,
    seoTitle: null,
    seoDescription: null,
    primaryImageBlock: null
  }

  const stepAndCardBlockCreateMock: MockedResponse<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  > = {
    request: {
      query: STEP_AND_CARD_BLOCK_CREATE,
      variables: {
        stepBlockCreateInput: {
          id: 'stepId',
          journeyId: 'journeyId'
        },
        cardBlockCreateInput: {
          id: 'cardId',
          journeyId: 'journeyId',
          parentBlockId: 'stepId',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    },
    result: {
      data: {
        stepBlockCreate: {
          id: 'stepId',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          __typename: 'StepBlock'
        },
        cardBlockCreate: {
          id: 'cardId',
          parentBlockId: 'stepId',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          __typename: 'CardBlock'
        }
      }
    }
  }

  it('renders social preview node properly', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80'
    )
    expect(getByText('Test Description Social Preview')).toBeInTheDocument()
    expect(getByText('Test Title Social Preview')).toBeInTheDocument()
  })

  it('renders blank social preview node properly', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: blankSeoJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('SocialPreviewPostEmpty')).toBeInTheDocument()
    expect(getByTestId('SocialPreviewTitleEmpty')).toBeInTheDocument()
    expect(getByTestId('SocialPreviewDescriptionEmpty')).toBeInTheDocument()
  })

  it('calls dispatch on social media node click', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: blankSeoJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('SocialPreviewNode'))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  })
})
