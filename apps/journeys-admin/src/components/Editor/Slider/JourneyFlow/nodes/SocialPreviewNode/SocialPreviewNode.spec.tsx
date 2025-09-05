import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReactFlowProvider } from 'reactflow'

import { EditorState } from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider
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
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { SocialPreviewNode } from '.'

describe('SocialPreviewNode', () => {
  beforeEach(() => {
    mockReactFlow()
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
    blurhash: '',
    scale: null,
    focalLeft: 50,
    focalTop: 50
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
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    updatedAt: '2021-11-19T12:34:56.647Z',
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
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    socialNodeX: null,
    socialNodeY: null,
    journeyTheme: null
  }

  const blankSeoJourney: Journey = {
    ...defaultJourney,
    seoTitle: null,
    seoDescription: null,
    primaryImageBlock: null
  }

  it('renders social preview node properly', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </MockedProvider>
      </ReactFlowProvider>
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
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: blankSeoJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('SocialPreviewPostEmpty')).toBeInTheDocument()
    expect(screen.getByTestId('SocialPreviewTitleEmpty')).toBeInTheDocument()
    expect(
      screen.getByTestId('SocialPreviewDescriptionEmpty')
    ).toBeInTheDocument()
  })

  it('calls select social media node on click', async () => {
    const state: EditorState = {
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Canvas,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
    }

    render(
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: blankSeoJourney }}>
            <EditorProvider initialState={state}>
              <TestEditorState />
              <SocialPreviewNode />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('SocialPreviewNode'))
    expect(screen.getByText('activeContent: social')).toBeInTheDocument()
  })

  it('sets active slide to content when clicking on a selected social node', () => {
    const state = {
      activeContent: ActiveContent.Social,
      activeSlide: ActiveSlide.JourneyFlow
    }

    render(
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: blankSeoJourney }}>
            <EditorProvider initialState={state}>
              <TestEditorState />
              <SocialPreviewNode />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('activeContent: social')).toBeInTheDocument()
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('SocialPreviewNode'))
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
  })

  it('should render tooltip', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <SocialPreviewNode />
          </JourneyProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )

    const node = screen.getByTestId('SocialPreviewNode')

    await userEvent.hover(node)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Social Media Preview')).toBeVisible()
  })
})
