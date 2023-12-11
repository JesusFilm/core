import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render,  waitFor } from '@testing-library/react'

import { Service } from '../../../../__generated__/globalTypes'
import { GET_TAGS } from '../../../libs/useTagsQuery/useTagsQuery'

import { TagsFilter } from '.'


describe('TagsFilter', () => {
  const topics = [
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
    {
      __typename: 'Tag',
      id: 'tagId1',
      service: Service.apiJourneys,
      parentId: 'parentId1',
      name: [
        {
          value: 'Acceptance',
          primary: true
        }
      ]
    },
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
    }
  ]

  const feltNeeds = [
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
    {
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
    },
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

  const parentTags = [
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
    {
      __typename: 'Tag',
      id: 'parentId3',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Holidays',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'parentId4',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Audience',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'parentId5',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Genre',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'parentId6',
      service: Service.apiJourneys,
      parentId: null,
      name: [
        {
          value: 'Collections',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'tagId1',
      service: Service.apiJourneys,
      parentId: 'parentId1',
      name: [
        {
          value: 'Acceptance',
          primary: true
        }
      ]
    },
    {
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
    },
    {
      __typename: 'Tag',
      id: 'tagId5',
      service: Service.apiJourneys,
      parentId: 'parentId3',
      name: [
        {
          value: 'New Year',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'tagId6',
      service: Service.apiJourneys,
      parentId: 'parentId6',
      name: [
        {
          value: 'NUA',
          primary: true
        }
      ]
    }
  ]

  const getTagsMock = {
    request: {
      query: GET_TAGS
    },
    result: {
      data: {
        tags: [...topics]
      }
    }
  }

  const getMultipleTagsMock = {
    request: {
      query: GET_TAGS
    },
    result: {
      data: {
        tags: [...topics, ...feltNeeds]
      }
    }
  }

  const allParentTagsMock = {
    request: {
      query: GET_TAGS
    },
    result: {
      data: {
        tags: [...parentTags]
      }
    }
  }

  it('should call handleChange on option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagsFilter
          label="Topics"
          tagNames={['Topics']}
          onChange={handleChange}
          selectedTagIds={[]}
        />
      </MockedProvider>
    )
    expect(getByRole('combobox', { name: 'Topics' })).toBeInTheDocument()
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByRole('option', { name: 'Acceptance' })).toBeInTheDocument()
    )
    expect(getByRole('option', { name: 'Addiction' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Anger' })).toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Acceptance' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId1'],
      ['tagId1', 'tagId2', 'tagId3']
    )
  })

  it('should call handleChange on multiple option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagsFilter
          label="Topics"
          tagNames={['Topics']}
          onChange={handleChange}
          selectedTagIds={[]}
        />
      </MockedProvider>
    )
    expect(getByRole('combobox', { name: 'Topics' })).toBeInTheDocument()
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByRole('option', { name: 'Acceptance' })).toBeInTheDocument()
    )
    expect(getByRole('option', { name: 'Addiction' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Anger' })).toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Acceptance' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId1'],
      ['tagId1', 'tagId2', 'tagId3']
    )
    fireEvent.click(getByRole('option', { name: 'Anger' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId3'],
      ['tagId1', 'tagId2', 'tagId3']
    )
  })

  it('should remove tag from being selected', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getTagsMock]}>
        <TagsFilter
          label="Topics"
          tagNames={['Topics']}
          onChange={handleChange}
          selectedTagIds={['tagId1', 'tagId2', 'tagId3']}
        />
      </MockedProvider>
    )
    expect(getByRole('combobox', { name: 'Topics' })).toBeInTheDocument()
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByRole('option', { name: 'Acceptance' })).toBeInTheDocument()
    )
    expect(getByRole('option', { name: 'Addiction' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Anger' })).toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Acceptance' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId2', 'tagId3'],
      ['tagId1', 'tagId2', 'tagId3']
    )
  })

  it('should render multiple parent tag sections', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getMultipleTagsMock]}>
        <TagsFilter
          label="Topics, felt needs"
          tagNames={['Topics', 'Felt Needs']}
          onChange={handleChange}
          selectedTagIds={[]}
        />
      </MockedProvider>
    )
    expect(
      getByRole('combobox', { name: 'Topics, felt needs' })
    ).toBeInTheDocument()
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    // topics
    await waitFor(() =>
      expect(getByRole('option', { name: 'Acceptance' })).toBeInTheDocument()
    )
    expect(getByRole('option', { name: 'Addiction' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Anger' })).toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Acceptance' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId1'],
      ['tagId1', 'tagId2', 'tagId3', 'tagId4', 'tagId5', 'tagId6']
    )
    // felt needs
    expect(getByRole('option', { name: 'Loneliness' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Fear/Anxiety' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'Depression' })).toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Loneliness' }))
    expect(handleChange).toHaveBeenCalledWith(
      ['tagId4'],
      ['tagId1', 'tagId2', 'tagId3', 'tagId4', 'tagId5', 'tagId6']
    )
  })

  it('renders parent tag icons', async () => {
    const handleChange = jest.fn()
    const { getByTestId, getByRole } = render(
      <MockedProvider mocks={[allParentTagsMock]}>
        <TagsFilter
          label="Topics, felt needs, holidays, collections"
          tagNames={['Topics', 'Felt Needs', 'Holidays', 'Collections']}
          onChange={handleChange}
          selectedTagIds={[]}
        />
      </MockedProvider>
    )
    expect(
      getByRole('combobox', {
        name: 'Topics, felt needs, holidays, collections'
      })
    ).toBeInTheDocument()
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })

    await waitFor(() => expect(getByTestId('Hash2Icon')).toBeInTheDocument())
    expect(getByTestId('SmileyNeutralIcon')).toBeInTheDocument()
    expect(getByTestId('Calendar4Icon')).toBeInTheDocument()
    expect(getByTestId('Grid1Icon')).toBeInTheDocument()
  })

  it('should change all dropdown arrows into chevron arrows', async () => {
    const handleChange = jest.fn()
    const { getByTestId } = render(
      <MockedProvider mocks={[allParentTagsMock]}>
        <TagsFilter
          label="Topics, felt needs, holidays, collections"
          tagNames={['Topics', 'Felt Needs', 'Holidays', 'Collections']}
          onChange={handleChange}
          selectedTagIds={[]}
        />
      </MockedProvider>
    )
    expect(getByTestId('ChevronDownIcon')).toBeInTheDocument()
  })
  
})

