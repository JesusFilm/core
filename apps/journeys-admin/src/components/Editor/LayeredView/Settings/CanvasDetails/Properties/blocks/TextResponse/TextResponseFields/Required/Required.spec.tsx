import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'

import { Required, TEXT_RESPONSE_REQUIRED_UPDATE } from './Required'

describe('Required', () => {
  const textResponseBlock = {
    id: 'textResponse.id',
    __typename: 'TextResponseBlock',
    label: 'Your Answer',
    required: false
  } as unknown as TreeBlock<TextResponseBlock>

  const mocks = [
    {
      request: {
        query: TEXT_RESPONSE_REQUIRED_UPDATE,
        variables: {
          id: 'textResponse.id',
          required: true
        }
      },
      result: {
        data: {
          textResponseBlockUpdate: {
            id: 'textResponse.id',
            required: true,
            __typename: 'TextResponseBlock'
          }
        }
      }
    }
  ]

  it('shows the required label', () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <EditorProvider
          initialState={{
            selectedBlock: textResponseBlock
          }}
        >
          <Required />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('Required')).toBeInTheDocument()
  })

  it('renders a toggle that reflects the required state', () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <EditorProvider
          initialState={{
            selectedBlock: textResponseBlock
          }}
        >
          <Required />
        </EditorProvider>
      </MockedProvider>
    )

    const toggle = getByRole('checkbox')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})
