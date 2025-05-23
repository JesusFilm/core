import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  getJourneysMockWithAcceptanceTag,
  getJourneysMockWithoutTagsEnglish,
  getJourneysMockWithoutTagsFrench,
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'
import '../../../test/i18n'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    pathname: '/templates',
    query: { tab: 'active' }
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateGallery', () => {
  it('should render TemplateGallery', async () => {
    mockedUseRouter.mockReturnValue({
      isReady: true,
      pathname: '/templates',
      push: jest.fn(),
      query: { tagIds: ['acceptanceTagId'], languageIds: ['529'] }
    } as unknown as NextRouter)
    render(
      <MockedProvider
        mocks={[
          getJourneysWithoutLanguageIdsMock,
          getLanguagesMock,
          getTagsMock
        ]}
      >
        <TemplateGallery />
      </MockedProvider>
    )
    expect(
      screen.getAllByRole('heading', { name: 'Journey Templates' })[0]
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getAllByRole('heading', { name: 'English' })[0]
      ).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 6, name: 'Acceptance' })
      ).toBeInTheDocument()
    )

    expect(
      screen.getByRole('heading', { level: 6, name: 'Hope' })
    ).toBeInTheDocument()
  })

  it('should render templates with multiple filtered tags', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      pathname: '/templates',
      query: { tagIds: [], languageIds: ['529'] }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getTagsMock,
          getJourneysMockWithAcceptanceTag
        ]}
      >
        <TemplateGallery />
      </MockedProvider>
    )
    fireEvent.keyDown(
      screen.getByRole('combobox', {
        name: 'Topics, holidays, felt needs, collections'
      }),
      {
        key: 'ArrowDown'
      }
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'Acceptance' }))
    )
    expect(
      screen.getByRole('heading', { level: 6, name: 'Acceptance' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 5, name: 'Hope' })
    ).not.toBeInTheDocument()
    expect(push).toHaveBeenCalledWith(
      {
        query: {
          tagIds: ['acceptanceTagId'],
          languageIds: ['529']
        }
      },
      undefined,
      { shallow: true }
    )
  })

  it('should render templates filtered via language ids', async () => {
    const push = jest.fn()
    const on = jest.fn()
    mockedUseRouter.mockReturnValue({
      isReady: true,
      push,
      pathname: '/templates',
      events: {
        on
      },
      query: { languageIds: [] }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          getJourneysWithoutLanguageIdsMock,
          getJourneysMockWithoutTagsFrench,
          getLanguagesMock,
          getTagsMock
        ]}
      >
        <TemplateGallery />
      </MockedProvider>
    )
    await waitFor(() =>
      fireEvent.click(
        screen.getAllByRole('heading', { name: 'All Languages' })[0]
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'French Français' }))
    fireEvent.click(screen.getByTestId('PresentationLayer'))
    await waitFor(
      () => {
        expect(push).toHaveBeenCalledWith(
          {
            query: {
              languageIds: [],
              param: 'template-language'
            }
          },
          undefined,
          { shallow: true }
        )
      },
      { timeout: 10000 }
    )
  }, 15000)

  it('should render templates with a felt needs tags selected', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      pathname: '/templates',
      query: { tagIds: [], languageIds: ['529'] }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          getJourneysMockWithoutTagsEnglish,
          getJourneysMockWithAcceptanceTag,
          getLanguagesMock,
          getTagsMock
        ]}
      >
        <TemplateGallery />
      </MockedProvider>
    )

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', {
            name: 'Acceptance tag Acceptance Acceptance'
          })
        ).toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )
    await waitFor(
      () => {
        expect(push).toHaveBeenCalledWith(
          {
            query: {
              tagIds: 'acceptanceTagId',
              languageIds: ['529']
            }
          },
          undefined,
          { shallow: true }
        )
      },
      { timeout: 10000 }
    )
  }, 15000)
})
