import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { TextResponseFields } from '../../../../../../__generated__/TextResponseFields'

import { TEXT_RESPONSE_BLOCK_UPDATE_CONTENT, TextResponseEdit } from '.'

describe('TextResponseEdit', () => {
  const props: TreeBlock<TextResponseFields> = {
    id: 'textResponse.id',
    __typename: 'TextResponseBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    submitLabel: 'Submit',
    submitIconId: null,
    action: null,
    children: []
  }

  it('selects the input on click', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TextResponseEdit {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('saves the textResponse label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: [
          {
            __typename: 'TextResponseBlock',
            id: 'textResponse.id',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'textResponse.id',
                journeyId: 'journeyId',
                input: {
                  submitLabel: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider>
              <TextResponseEdit {...props} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: [
          {
            __typename: 'TextResponseBlock',
            id: 'textResponse.id',
            submitLabel: 'Submit'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'textResponse.id',
                journeyId: 'journeyId',
                input: {
                  submitLabel: 'Submit'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider>
              <TextResponseEdit {...props} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Submit' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('saves the textResponse label on outside click', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: [
          {
            __typename: 'TextResponseBlock',
            id: 'textResponse.id',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'textResponse.id',
                journeyId: 'journeyId',
                input: {
                  submitLabel: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider>
              <h1 className="swiper-container">Other Content</h1>
              <iframe>
                <TextResponseEdit {...props} />
              </iframe>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.click(getByRole('heading', { level: 1 }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
