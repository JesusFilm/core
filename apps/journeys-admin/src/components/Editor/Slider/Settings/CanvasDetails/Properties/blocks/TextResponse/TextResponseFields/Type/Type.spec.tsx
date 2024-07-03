import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../../__generated__/GetJourney'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { TEXT_RESPONSE_TYPE_UPDATE, Type } from './Type'

describe('Type', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.freeForm,
    children: []
  }

  it('should change type of text response', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          type: TextResponseType.email
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_TYPE_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journey.id',
                input: {
                  type: TextResponseType.email
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should reset integrationId and routeId to null if type is not email', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          type: TextResponseType.freeForm,
          integrationId: null,
          routeId: null
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_TYPE_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journey.id',
                input: {
                  type: TextResponseType.freeForm,
                  integrationId: null,
                  routeId: null
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedBlock: { ...selectedBlock, type: TextResponseType.email }
            }}
          >
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Freeform' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
