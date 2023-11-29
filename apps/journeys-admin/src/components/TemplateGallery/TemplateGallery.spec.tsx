import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import '../../../test/i18n'

import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import {
  getJourneysMock,
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateGallery', () => {
  it('should render TemplateGallery', async () => {
    const { getByRole, getAllByRole } = render(
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
      getAllByRole('heading', { name: 'Journey Templates' })[0]
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        getAllByRole('heading', { name: 'All Languages' })[0]
      ).toBeInTheDocument()
    )
    expect(
      getByRole('heading', { level: 5, name: 'Acceptance' })
    ).toBeInTheDocument()
    expect(getByRole('heading', { level: 5, name: 'Hope' })).toBeInTheDocument()
  })

  it('should render templates with multiple filtered tags', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: { tagIds: [], languageIds: ['529'] }
    } as unknown as NextRouter)

    const { getByRole, queryByRole } = render(
      <MockedProvider mocks={[getJourneysMock, getLanguagesMock, getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    fireEvent.keyDown(
      getByRole('combobox', {
        name: 'Topics, holidays, felt needs, collections'
      }),
      {
        key: 'ArrowDown'
      }
    )
    await waitFor(() =>
      fireEvent.click(getByRole('option', { name: 'Acceptance' }))
    )
    expect(
      getByRole('heading', { level: 6, name: 'Acceptance' })
    ).toBeInTheDocument()
    expect(
      queryByRole('heading', { level: 5, name: 'Hope' })
    ).not.toBeInTheDocument()
    expect(push).toHaveBeenCalledWith({
      push,
      query: {
        tagIds: ['acceptanceTagId'],
        languageIds: ['529']
      }
    })
  })

  it('should render templates filtered via language ids', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: { languageIds: [] }
    } as unknown as NextRouter)

    const { getByRole, getAllByRole, getByTestId } = render(
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
    await waitFor(() =>
      fireEvent.click(getAllByRole('heading', { name: 'All Languages' })[0])
    )

    fireEvent.click(getByRole('button', { name: 'French Français' }))
    fireEvent.click(getByTestId('PresentationLayer'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        push,
        query: {
          languageIds: ['496']
        }
      })
    })
  })

  it('should render templates with a felt needs tags selected', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: { tagIds: [], languageIds: ['529'] }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider mocks={[getJourneysMock, getLanguagesMock, getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getByRole('button', { name: 'Acceptance Acceptance' })
      ).toBeInTheDocument()
    })

    fireEvent.click(getByRole('button', { name: 'Acceptance Acceptance' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        push,
        query: {
          tagIds: 'acceptanceTagId',
          languageIds: ['529']
        }
      })
    })
  })
})
