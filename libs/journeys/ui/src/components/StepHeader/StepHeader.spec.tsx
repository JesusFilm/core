import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { StepHeader } from './StepHeader'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('StepHeader', () => {
  const journey: JourneyFields = {
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
    }
  }

  it('should have report contact button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    const { getByRole } = render(
      <MockedProvider>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the journey creator privacy policy', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toBeInTheDocument()
  })

  it('should have the correct line height for journey creator privacy policy', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <StepHeader />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toHaveStyle({ 'line-height': 1.2, display: 'block' })
  })

  it('should show public title', async () => {
    const { getByRole, getByText } = render(
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
          <StepHeader />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Public Title')).toBeInTheDocument())
  })

  it('should default to team title if public title does not exist', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, seoTitle: null }
          }}
        >
          <StepHeader />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Team Title')).toBeInTheDocument())
  })
})
