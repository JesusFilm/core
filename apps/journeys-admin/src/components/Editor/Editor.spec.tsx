import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/compat/router'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'

import type { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import type { GetStepBlocksWithPosition } from '../../../__generated__/GetStepBlocksWithPosition'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../test/mockReactFlow'
import { ThemeProvider } from '../ThemeProvider'

import { GET_STEP_BLOCKS_WITH_POSITION } from './Slider/JourneyFlow/JourneyFlow'

import { Editor } from '.'

jest.mock('next/compat/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Editor', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    featuredAt: null,
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
    blocks: [
      {
        id: 'step0.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id'
      },
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: 'step1.id'
      }
    ] as TreeBlock[],
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
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    journeyTheme: null
  }

  beforeEach(() => {
    mockReactFlow()

    mockedUseRouter.mockReturnValue({
      query: { journeyId: journey.id }
    } as unknown as NextRouter)
  })

  it('should render the Toolbar', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey} />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('Toolbar')).toBeInTheDocument()
  })

  it('should render the Slider', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey} />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('Slider')).toBeInTheDocument()
  })

  it('should render the Fab', async () => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey} />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Fab')).toBeInTheDocument()
  })

  it('should set the selected step', async () => {
    const withTypographyBlock: Journey = {
      ...journey,
      blocks: [
        {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: 'step1.id',
          slug: null
        },
        {
          __typename: 'CardBlock',
          id: 'card0.id',
          parentBlockId: 'step0.id',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: ThemeMode.light,
          themeName: ThemeName.base,
          fullscreen: false,
          backdropBlur: null
        },
        {
          __typename: 'TypographyBlock',
          id: 'heading3',
          parentBlockId: 'card0.id',
          parentOrder: 0,
          content: 'Test selected step',
          variant: null,
          color: null,
          align: null,
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          }
        }
      ]
    }

    const mockGetStepBlocksWithPosition: MockedResponse<GetStepBlocksWithPosition> =
      {
        request: {
          query: GET_STEP_BLOCKS_WITH_POSITION,
          variables: {
            journeyIds: [journey.id]
          }
        },
        result: {
          data: {
            blocks: [
              {
                __typename: 'StepBlock',
                id: 'step0.id',
                x: 0,
                y: 0
              }
            ]
          }
        }
      }
    render(
      <MockedProvider mocks={[mockGetStepBlocksWithPosition]}>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={withTypographyBlock} selectedStepId="step0.id" />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('Test selected step')).toBeInTheDocument()
    )
  })
})
