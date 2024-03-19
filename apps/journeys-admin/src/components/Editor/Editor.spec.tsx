import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ThemeProvider } from '../ThemeProvider'
import { mockReactFlow } from '../../../test/mockReactFlow'

import { Editor } from '.'

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
    tags: []
  }
  beforeEach(() => {
    mockReactFlow()
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
          nextBlockId: 'step1.id'
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
          fullscreen: false
        },
        {
          __typename: 'TypographyBlock',
          id: 'heading3',
          parentBlockId: 'card0.id',
          parentOrder: 0,
          content: 'Test selected step',
          variant: null,
          color: null,
          align: null
        }
      ]
    }
    render(
      <MockedProvider>
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
