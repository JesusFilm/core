import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

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

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
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
      expect(getByRole('button', { name: 'All Languages' })).toBeInTheDocument()
    )
    expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
  })

  it('should render templates filtered via tags', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: { tagIds: [] }
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
      queryByRole('heading', { name: 'Addiction' })
    ).not.toBeInTheDocument()
    expect(push).toHaveBeenCalledWith({
      push,
      query: {
        tagIds: ['acceptanceTagId']
      }
    })
  })

  it('should render templates filtered via language ids', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: { languageIds: [] }
    } as unknown as NextRouter)

    const { getByRole } = render(
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
      fireEvent.click(getByRole('button', { name: 'All Languages' }))
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      fireEvent.click(getByRole('option', { name: 'French' }))
    )
    expect(push).toHaveBeenCalledWith({
      push,
      query: {
        languageIds: ['496']
      }
    })
  })
})
