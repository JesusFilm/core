import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { getJourneysMock, getLanguagesMock, getTagsMock } from './data'

import { TemplateGallery } from '.'

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
      <MockedProvider mocks={[getJourneysMock, getLanguagesMock, getTagsMock]}>
        <TemplateGallery />
      </MockedProvider>
    )
    expect(
      getAllByRole('heading', { name: 'Journey Templates' })[0]
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('button', { name: 'English' })).toBeInTheDocument()
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
    expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
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
})
