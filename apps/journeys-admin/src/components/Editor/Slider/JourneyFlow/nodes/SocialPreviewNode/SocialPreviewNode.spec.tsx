import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

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

  it('renders social preview node properly', async () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <SocialPreviewNode />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80'
    )
    expect(
      screen.getByText('Test Description Social Preview')
    ).toBeInTheDocument()
    expect(screen.getByText('Test Title Social Preview')).toBeInTheDocument()
  })

  it('renders blank social preview node properly', async () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: blankSeoJourney }}>
          <SocialPreviewNode />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SocialPreviewPostEmpty')).toBeInTheDocument()
    expect(screen.getByTestId('SocialPreviewTitleEmpty')).toBeInTheDocument()
    expect(
      screen.getByTestId('SocialPreviewDescriptionEmpty')
    ).toBeInTheDocument()
  })

  it('calls dispatch on social media node click', async () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: blankSeoJourney }}>
          <SocialPreviewNode />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('SocialPreviewNode'))

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  })
})
