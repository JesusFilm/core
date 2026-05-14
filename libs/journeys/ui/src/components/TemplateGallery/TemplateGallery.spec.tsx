import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import '../../../test/i18n'

import {
  getJourneyTemplateLanguageIdsMock,
  getJourneysMockWithAcceptanceTag,
  getJourneysMockWithoutTagsEnglish,
  getJourneysMockWithoutTagsFrench,
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'

vi.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: vi.fn(() => false)
}))

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({
    pathname: '/templates',
    query: { tab: 'active' }
  }))
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('TemplateGallery', () => {
  it('should render TemplateGallery', async () => {
    mockedUseRouter.mockReturnValue({
      isReady: true,
      pathname: '/templates',
      push: vi.fn(),
      query: { tagIds: ['acceptanceTagId'], languageIds: ['529'] }
    } as unknown as NextRouter)
    render(
      <MockedProvider
        mocks={[
          getJourneysWithoutLanguageIdsMock,
          getJourneyTemplateLanguageIdsMock,
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
    const push = vi.fn()
    mockedUseRouter.mockReturnValue({
      push,
      pathname: '/templates',
      query: { tagIds: [], languageIds: ['529'] }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[
          getJourneyTemplateLanguageIdsMock,
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
    const push = vi.fn()
    const on = vi.fn()
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
          getJourneyTemplateLanguageIdsMock,
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
              languageIds: ['496']
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
    const push = vi.fn()
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
          getJourneyTemplateLanguageIdsMock,
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
