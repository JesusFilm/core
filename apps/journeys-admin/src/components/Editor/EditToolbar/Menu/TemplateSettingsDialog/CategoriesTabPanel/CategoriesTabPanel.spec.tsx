import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { Service } from '../../../../../../../__generated__/globalTypes'
import { GET_TAGS } from '../../../../../../libs/useTagsQuery/useTagsQuery'

import { CategoriesTabPanel } from './CategoriesTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('CategoriesTabPanel', () => {
  const topicTag = {
    __typename: 'Tag' as const,
    id: 'tagId1',
    service: Service.apiJourneys,
    parentId: 'parentId1',
    name: [
      {
        value: 'Acceptance',
        primary: true
      }
    ]
  }

  const needsTag = {
    __typename: 'Tag',
    id: 'tagId4',
    service: Service.apiJourneys,
    parentId: 'parentId2',
    name: [
      {
        value: 'Loneliness',
        primary: true
      }
    ]
  }

  const tags = [
    {
      __typename: 'Tag',
      id: 'parentId1',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Topics',
          primary: true
        }
      ]
    },
    topicTag,
    {
      __typename: 'Tag',
      id: 'tagId2',
      service: Service.apiJourneys,
      parentId: 'parentId1',
      name: [
        {
          value: 'Addiction',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'tagId3',
      service: Service.apiJourneys,
      parentId: 'parentId1',
      name: [
        {
          value: 'Anger',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'parentId2',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Felt Needs',
          primary: true
        }
      ]
    },
    needsTag,
    {
      __typename: 'Tag',
      id: 'tagId5',
      service: Service.apiJourneys,
      parentId: 'parentId2',
      name: [
        {
          value: 'Fear/Anxiety',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'tagId6',
      service: Service.apiJourneys,
      parentId: 'parentId2',
      name: [
        {
          value: 'Depression',
          primary: true
        }
      ]
    }
  ]

  const tagsMock = {
    request: {
      query: GET_TAGS
    },
    result: {
      data: {
        tags
      }
    }
  }

  it('shows tag autocompletes with initial tags', async () => {
    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[tagsMock]}>
        <CategoriesTabPanel
          tabValue={1}
          onChange={jest.fn()}
          initialTags={[{ id: topicTag.id, parentId: topicTag.parentId }]}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      const topicsAutocomplete = getByRole('combobox', { name: 'Topics' })
      expect(topicsAutocomplete).toBeInTheDocument()
      const selectedChip = getByRole('button', { name: 'Acceptance' })
      expect(selectedChip).toBeInTheDocument()
      expect(getByRole('combobox', { name: 'Felt Needs' })).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Open' })[0])

    await waitFor(() => {
      expect(
        getByRole('option', { name: 'Acceptance', selected: true })
      ).toBeInTheDocument()
      expect(
        getByRole('option', { name: 'Addiction', selected: false })
      ).toBeInTheDocument()
      expect(
        getByRole('option', { name: 'Anger', selected: false })
      ).toBeInTheDocument()
    })
  })

  it('calls onChange with selected tags from all tag groups', async () => {
    const onChange = jest.fn()

    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[tagsMock]}>
        <CategoriesTabPanel
          tabValue={1}
          onChange={onChange}
          initialTags={[{ id: topicTag.id, parentId: topicTag.parentId }]}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('combobox', { name: 'Felt Needs' })).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Open' })[1])

    fireEvent.click(
      within(getByRole('option', { name: needsTag.name[0].value })).getByRole(
        'checkbox'
      )
    )

    expect(onChange).toHaveBeenCalledWith('tags', [
      { id: topicTag.id, parentId: topicTag.parentId },
      { id: needsTag.id, parentId: needsTag.parentId }
    ])
  })
})
