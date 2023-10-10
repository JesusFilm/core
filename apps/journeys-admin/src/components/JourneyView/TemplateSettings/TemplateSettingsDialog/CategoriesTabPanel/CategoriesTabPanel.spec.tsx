import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { GetTags } from '../../../../../../__generated__/GetTags'
import { GET_TAGS } from '../../../../../libs/useTagsQuery/useTagsQuery'

import { CategoriesTabPanel } from './CategoriesTabPanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CategoriesTabPanel', () => {
  const useTagsQueryMock: MockedResponse<GetTags> = {
    request: {
      query: GET_TAGS
    },
    result: jest.fn(() => ({
      data: {
        tags: [
          {
            __typename: 'Tag',
            id: 'tag1',
            service: null,
            parentId: null,
            name: [
              {
                __typename: 'Translation',
                value: 'Holidays',
                primary: true
              }
            ]
          },
          {
            __typename: 'Tag',
            id: 'tag2',
            service: null,
            parentId: 'tag1',
            name: [
              {
                __typename: 'Translation',
                value: 'Ramadan',
                primary: true
              }
            ]
          },
          {
            __typename: 'Tag',
            id: 'tag3',
            service: null,
            parentId: 'tag1',
            name: [
              {
                __typename: 'Translation',
                value: 'Christmas',
                primary: true
              }
            ]
          }
        ]
      }
    }))
  }

  it('calls onClick when clicked', async () => {
    ;(useMediaQuery as jest.Mock).mockReturnValue(true)
    const onClick = jest.fn()
    const { getByRole, getByPlaceholderText, getByText } = render(
      <MockedProvider mocks={[useTagsQueryMock]}>
        <CategoriesTabPanel tabValue={1} onChange={onClick} />
      </MockedProvider>
    )

    await waitFor(() => expect(useTagsQueryMock.result).toHaveBeenCalled())
    expect(getByText('Holidays')).toBeInTheDocument()
    expect(getByPlaceholderText('Add holidays')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Open' }))

    fireEvent.click(
      within(getByRole('option', { name: 'Ramadan' })).getByRole('checkbox')
    )

    expect(onClick).toHaveBeenCalledWith('tags', [
      { id: 'tag2', parentId: 'tag1' }
    ])

    fireEvent.click(
      within(getByRole('option', { name: 'Christmas' })).getByRole('checkbox')
    )

    await waitFor(() =>
      expect(onClick).toHaveBeenCalledWith('tags', [
        { id: 'tag2', parentId: 'tag1' },
        { id: 'tag3', parentId: 'tag1' }
      ])
    )
  })

  it('does not render placeholder below medium breakpoint', async () => {
    ;(useMediaQuery as jest.Mock).mockReturnValue(false)
    const onClick = jest.fn()
    const { queryByPlaceholderText } = render(
      <MockedProvider mocks={[useTagsQueryMock]}>
        <CategoriesTabPanel tabValue={1} onChange={onClick} />
      </MockedProvider>
    )

    await waitFor(() => expect(useTagsQueryMock.result).toHaveBeenCalled())

    expect(queryByPlaceholderText('Add holidays')).not.toBeInTheDocument()
  })
})
