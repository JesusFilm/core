import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { InformationButton } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

mockedUseRouter.mockReturnValue({
  query: {}
} as unknown as NextRouter)

describe('InformationButton', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    title: 'my journey',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
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
    team: {
      __typename: 'Team',
      id: 'teamId',
      title: 'Team Title',
      publicTitle: ''
    },
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

  it('should have report contact button', () => {
    render(
      <MockedProvider>
        <InformationButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    render(
      <MockedProvider>
        <InformationButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.getByRole('link', { name: 'Terms & Conditions' })
    ).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the journey creator privacy policy', () => {
    render(
      <MockedProvider>
        <InformationButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toBeInTheDocument()
  })

  it('should have the correct line height for journey creator privacy policy', () => {
    render(
      <MockedProvider>
        <InformationButton />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toHaveStyle({ 'line-height': 1.2, display: 'block' })
  })

  it('should show public title', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...journey,
              seoTitle: null,
              team: {
                __typename: 'Team',
                id: 'teamId',
                title: 'Team Title',
                publicTitle: 'Public Title'
              }
            }
          }}
        >
          <InformationButton />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByText('Public Title')).toBeInTheDocument()
    )
  })

  it('should default to team title if public title does not exist', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, seoTitle: null }
          }}
        >
          <InformationButton />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByText('Team Title')).toBeInTheDocument()
    )
  })

  it('should hide more info button if noi is in query', async () => {
    mockedUseRouter.mockReturnValue({
      query: { noi: '' }
    } as unknown as NextRouter)

    render(<InformationButton />)

    expect(screen.queryByTestId('more-info')).not.toBeInTheDocument()
  })
})
