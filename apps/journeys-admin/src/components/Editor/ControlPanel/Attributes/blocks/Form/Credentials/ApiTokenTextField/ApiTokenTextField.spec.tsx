import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../../../../../__generated__/GetJourney'

import {
  ApiTokenTextField,
  FORM_BLOCK_UPDATE,
  placeHolderToken
} from './ApiTokenTextField'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ApiTokenTextField', () => {
  const selectedBlock = {
    __typename: 'FormBlock',
    id: 'id',
    children: []
  } as unknown as TreeBlock<FormBlock>

  it('should show the textfield', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              apiTokenExists
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByTestId('JourneysAdminTextFieldForm')).toBeInTheDocument()
  })

  it('should update the api token', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          id: 'id',
          form: null,
          projects: [],
          forms: [],
          projectId: null,
          formSlug: null
        }
      }
    }))

    const { getByLabelText, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: FORM_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  apiToken: 'new-token'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              apiTokenExists
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByLabelText('Api Token')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Api Token'), {
      target: { value: 'new-token' }
    })
    fireEvent.blur(getByLabelText('Api Token'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('API Token updated')).toBeInTheDocument()
  })

  it('should not update the api token if the token is the same', async () => {
    const result = jest.fn(() => ({
      data: {
        formBlockUpdate: {
          id: 'id',
          form: null,
          projects: [],
          forms: [],
          projectId: null,
          formSlug: null
        }
      }
    }))

    const { getByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: FORM_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  apiToken: placeHolderToken
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              apiTokenExists
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByLabelText('Api Token')).toBeInTheDocument()

    fireEvent.change(getByLabelText('Api Token'), {
      target: { value: placeHolderToken }
    })
    fireEvent.blur(getByLabelText('Api Token'))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('should show error message if error updating api token', async () => {
    const { getByLabelText, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: FORM_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  apiToken: 'new-token'
                }
              }
            },
            result: {
              errors: [new GraphQLError('invalid api token')]
            }
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              apiTokenExists
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByLabelText('Api Token'), {
      target: { value: 'new-token' }
    })
    fireEvent.blur(getByLabelText('Api Token'))
    await waitFor(() =>
      expect(getByText('invalid api token')).toBeInTheDocument()
    )
  })

  it('should allow the user to lock and unlock the textfield', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              apiTokenExists
              loading={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByLabelText('Api Token')).toBeDisabled()
    fireEvent.click(getByLabelText('toggle field lock'))
    expect(getByLabelText('Api Token')).not.toBeDisabled()
    fireEvent.click(getByLabelText('toggle field lock'))
    expect(getByLabelText('Api Token')).toBeDisabled()
  })

  it('should be locked while loading', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField id={selectedBlock.id} apiTokenExists loading />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByLabelText('Api Token')).toBeDisabled()
    expect(getByLabelText('Api Token')).toHaveValue('')
  })

  it('should be unlocked if token does not exist', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock }}>
            <ApiTokenTextField
              id={selectedBlock.id}
              loading={false}
              apiTokenExists={false}
            />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByLabelText('Api Token')).not.toBeDisabled()
    expect(getByLabelText('Api Token')).toHaveValue('')
  })
})
