import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_TAGS } from '../../../libs/useTagsQuery/useTagsQuery'

import { parentTags, tags } from './data'
import { TemplateTags } from './TemplateTags'

describe('TemplateTags', () => {
  it('should hide template tags if there are no tags', () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <TemplateTags tags={[]} />
      </MockedProvider>
    )
    expect(queryByTestId('TemplateTags')).not.toBeInTheDocument()
  })

  it('should show tags', async () => {
    const result = jest.fn(() => ({
      data: {
        tags: [...parentTags, ...tags]
      }
    }))

    const { getByTestId, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TAGS
            },
            result
          }
        ]}
      >
        <TemplateTags tags={tags} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(getByText('Topic sub-tag')).toBeInTheDocument()
    expect(getByTestId('Hash2Icon')).toBeInTheDocument()

    expect(getByText('Felt Needs sub-tag')).toBeInTheDocument()
    expect(getByTestId('SmileyNeutralIcon')).toBeInTheDocument()

    expect(getByText('Holidays sub-tag')).toBeInTheDocument()
    expect(getByTestId('Calendar4Icon')).toBeInTheDocument()

    expect(getByText('Audience sub-tag')).toBeInTheDocument()
    expect(getByTestId('UsersProfiles2Icon')).toBeInTheDocument()

    expect(getByText('Genre sub-tag')).toBeInTheDocument()
    expect(getByTestId('MediaStrip1Icon')).toBeInTheDocument()

    expect(getByText('Other Tag')).toBeInTheDocument()
    expect(getByTestId('Grid1Icon')).toBeInTheDocument()
  })
})
