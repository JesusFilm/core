import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'
import noop from 'lodash/noop'

import { Service } from '../../../../../../../__generated__/globalTypes'
import { GET_TAGS } from '../../../../../../libs/useTagsQuery/useTagsQuery'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

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

  const parentTagsMock = {
    ...tagsMock,
    result: {
      data: {
        tags: parentTags
      }
    }
  }

  it('shows tag autocompletes with initial tags', async () => {
    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[tagsMock]}>
        <FormikProvider
          value={
            {
              values: { tagIds: [] },
              setFieldValue: noop
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <CategoriesTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    await waitFor(() => null)

    await waitFor(() => {
      const topicsAutocomplete = getByRole('combobox', { name: 'Topics' })
      expect(topicsAutocomplete).toBeInTheDocument()
      expect(getByRole('combobox', { name: 'Felt Needs' })).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Open' })[0])

    await waitFor(() => {
      expect(
        getByRole('option', { name: 'Addiction', selected: false })
      ).toBeInTheDocument()
      expect(
        getByRole('option', { name: 'Anger', selected: false })
      ).toBeInTheDocument()
    })
  })

  it('shows tag autocompletes with proper parent tag icons', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[parentTagsMock]}>
        <FormikProvider
          value={
            {
              values: { tagIds: [] },
              setFieldValue: noop
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <CategoriesTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByTestId('Hash2Icon')).toBeInTheDocument()
      expect(getByTestId('SmileyNeutralIcon')).toBeInTheDocument()
      expect(getByTestId('Calendar4Icon')).toBeInTheDocument()
      expect(getByTestId('UsersProfiles2Icon')).toBeInTheDocument()
      expect(getByTestId('MediaStrip1Icon')).toBeInTheDocument()
      expect(getByTestId('Grid1Icon')).toBeInTheDocument()
    })
  })

  it('calls onChange with selected tags from all tag groups', async () => {
    const setFieldValue = jest.fn()

    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[tagsMock]}>
        <FormikProvider
          value={
            {
              values: { tagIds: [] },
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <CategoriesTabPanel />
        </FormikProvider>
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

    expect(setFieldValue).toHaveBeenCalledWith('tagIds', ['tagId4'])
  })
})
