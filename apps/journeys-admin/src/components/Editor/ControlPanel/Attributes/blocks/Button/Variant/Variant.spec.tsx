import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { ButtonVariant } from '../../../../../../../../__generated__/globalTypes'
import { BUTTON_BLOCK_UPDATE } from './Variant'
import { Variant } from '.'

describe('Button variant selector', () => {
  it('should show button variant properties', () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
  })
  it('should change the Variant property', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          color: ButtonVariant.text
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  variant: 'text'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
