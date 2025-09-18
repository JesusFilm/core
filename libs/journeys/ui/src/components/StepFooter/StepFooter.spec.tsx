import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  JourneyStatus,
  MessagePlatform,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { StepFooter } from './StepFooter'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('StepFooter', () => {
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
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: 'My awesome journey',
    seoDescription: null,
    chatButtons: [],
    host: {
      id: 'hostId',
      __typename: 'Host',
      teamId: 'teamId',
      title: 'Cru International',
      location: 'Florida, USA',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: null
    },
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
    journeyTheme: null,
    journeyCustomizationDescription: null,
    journeyCustomizationFields: [],
    fromTemplateId: null,
    showAssistant: null
  }

  it('should render custom styles', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <StepFooter sx={{ outline: '1px solid red' }} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneysStepFooter')).toHaveStyle(
      'outline: 1px solid red'
    )
  })

  it('should call onFooterClick on click', () => {
    const onFooterClick = jest.fn()
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, seoTitle: null },
              variant: 'admin'
            }}
          >
            <StepFooter onFooterClick={onFooterClick} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('JourneysStepFooter'))

    expect(onFooterClick).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              variant: 'admin',
              journey: { ...journey, seoTitle: 'discovery journey title' }
            }}
          >
            <StepFooter onFooterClick={jest.fn()} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('discovery journey title')).toBeInTheDocument()
  })

  describe('Journey', () => {
    it('should display social media title if no display title', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByText('My awesome journey')).toBeInTheDocument()
    })

    it('should show display title by default', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { ...journey, displayTitle: 'Display title' },
                variant: 'admin'
              }}
            >
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Display title')).toBeInTheDocument()
    })

    it('should display host avatar, name and location', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('StepFooterHostAvatars')).toBeInTheDocument()
      expect(
        screen.getByTestId('StepFooterHostTitleLocation')
      ).toBeInTheDocument()
    })

    it('should show footer buttons', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getAllByTestId('StepFooterButtonList')).toHaveLength(2)
    })

    it('should show ai chat button on journey', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { ...journey, showAssistant: true },
                variant: 'default'
              }}
            >
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByTestId('AiChatButton')).toBeInTheDocument()
    })

    it('should not show ai chat button on journey if chat buttons exist', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: {
                  ...journey,
                  showAssistant: true,
                  chatButtons: [
                    {
                      __typename: 'ChatButton',
                      id: 'chatButtonId',
                      link: 'https://www.google.com',
                      platform: MessagePlatform.whatsApp
                    }
                  ]
                },
                variant: 'default'
              }}
            >
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.queryByTestId('AiChatButton')).not.toBeInTheDocument()
    })
  })

  describe('website', () => {
    const websiteJourney = {
      ...journey,
      website: true
    }

    it('should show information', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: websiteJourney, variant: 'admin' }}
            >
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('InformationButton')).toBeInTheDocument()
    })

    it('should chat buttons', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: websiteJourney, variant: 'admin' }}
            >
              <StepFooter />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('StepFooterChatButtons')).toBeInTheDocument()
    })
  })
})
