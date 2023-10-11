import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'

import { RADIO_OPTION_BLOCK_UPDATE_CONTENT, RadioOptionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    children: []
  }

  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Type your text here...')
  })

  it('saves the option label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'test label'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <RadioOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'test label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('saves the option label on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
                journeyId: 'journeyId',
                input: {
                  label: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <h1 className="swiper-container" />
            <iframe>
              <RadioOptionEdit {...props} />
            </iframe>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should clear label if Option 1 or Option 2', () => {
    const args = {
      ...props,
      label: 'Option 1'
    }
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...args} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: '' })).toBeInTheDocument()
  })
})
